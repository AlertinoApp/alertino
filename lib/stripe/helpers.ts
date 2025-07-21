import { stripe } from "./config";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInterval,
  TrialInfo,
} from "@/types/subscription";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const TRIAL_DAYS = 14;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_MAPPING: Record<string, SubscriptionPlan> = {
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!]: "premium",
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!]: "premium",
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!]: "business",
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID!]: "business",
};

function mapStripePlanToSubscriptionPlan(priceId: string): SubscriptionPlan {
  return PLAN_MAPPING[priceId] || "free";
}

// Get or create Stripe customer
async function getOrCreateCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  // Check if user already has a customer ID
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (subscription?.stripe_customer_id) {
    try {
      await stripe.customers.retrieve(subscription.stripe_customer_id);
      return subscription.stripe_customer_id;
    } catch (error) {
      console.warn("Customer not found in Stripe, creating new one");
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { supabase_user_id: userId },
  });

  // Upsert subscription record with customer ID
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
      plan: "free",
      status: "incomplete" as SubscriptionStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return customer.id;
}

export async function getUserSubscription(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: subscription, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return subscription;
}

export async function getUserTrialInfo(userId: string): Promise<TrialInfo> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      isEligible: true,
      daysRemaining: null,
      isActive: false,
      hasUsedTrial: false,
    };
  }

  const hasUsedTrial = subscription.trial_used || false;
  const isActive = subscription.status === "trialing";

  let daysRemaining = null;
  if (isActive && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    isEligible: !hasUsedTrial,
    daysRemaining,
    isActive,
    hasUsedTrial,
  };
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const now = new Date();

  // Check trial status
  if (subscription.status === "trialing" && subscription.trial_end) {
    return now < new Date(subscription.trial_end);
  }

  // Check active subscription
  if (subscription.status === "active") {
    if (subscription.cancel_at_period_end) {
      return now < new Date(subscription.current_period_end);
    }
    return true;
  }

  return false;
}

export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const customerId = await getOrCreateCustomer(userId, userEmail);
  const trialInfo = await getUserTrialInfo(userId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: userId },
    subscription_data: {
      metadata: { user_id: userId },
      ...(trialInfo.isEligible && { trial_period_days: TRIAL_DAYS }),
    },
    allow_promotion_codes: true,
  };

  return await stripe.checkout.sessions.create(sessionParams);
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  // Verify customer exists
  await stripe.customers.retrieve(customerId);

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.user_id;

  if (!subscriptionId || !customerId || !userId) {
    throw new Error("Missing required data in checkout session");
  }

  console.log("Processing checkout session completed:", {
    sessionId: session.id,
    subscriptionId,
    userId,
    customerId,
  });

  // Retrieve the full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  console.log("Retrieved subscription from Stripe:", {
    id: subscription.id,
    status: subscription.status,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end,
  });

  await updateSubscriptionInDatabase(subscription, userId, customerId);
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  // Find the subscription record in our database
  const { data: subRecord, error } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (error || !subRecord) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  await updateSubscriptionInDatabase(subscription, subRecord.user_id);
}

async function updateSubscriptionInDatabase(
  subscription: Stripe.Subscription,
  userId: string,
  customerId?: string
) {
  const subscriptionItem = subscription.items.data[0];
  const price = subscriptionItem.price;

  if (!price) {
    throw new Error("No price found in subscription");
  }

  const plan = mapStripePlanToSubscriptionPlan(price.id);
  const interval = price.recurring?.interval as SubscriptionInterval;
  const status = subscription.status as SubscriptionStatus;

  // Handle trial information - FIXED Logic
  let trialStart = null;
  let trialEnd = null;
  let trialUsed = false;

  // Get existing subscription data to preserve trial_used status
  const existingSubscription = await getUserSubscription(userId);

  // Check if this subscription has any trial period (current or past)
  if (subscription.trial_start && subscription.trial_start > 0) {
    trialStart = new Date(subscription.trial_start * 1000).toISOString();
    trialUsed = true;
  }

  if (subscription.trial_end && subscription.trial_end > 0) {
    trialEnd = new Date(subscription.trial_end * 1000).toISOString();

    // If we have trial_end but no trial_start, calculate it
    if (!trialStart) {
      const trialEndDate = new Date(subscription.trial_end * 1000);
      const trialStartDate = new Date(
        trialEndDate.getTime() - TRIAL_DAYS * 24 * 60 * 60 * 1000
      );
      trialStart = trialStartDate.toISOString();
      trialUsed = true;
    }
  }

  // For trialing status, ensure we mark trial as used even if timestamps are missing
  if (status === "trialing") {
    trialUsed = true;

    // If no trial timestamps from Stripe, create them based on current time
    if (!trialStart && !trialEnd) {
      const now = new Date();
      trialStart = now.toISOString();
      trialEnd = new Date(
        now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();
    }
  }

  // Preserve existing trial_used status if it was already true
  if (existingSubscription?.trial_used) {
    trialUsed = true;
  }

  // For subscriptions that had trials but are now active, preserve trial info
  if (status === "active" && existingSubscription?.trial_used && !trialUsed) {
    trialUsed = existingSubscription.trial_used;
    trialStart = existingSubscription.trial_start;
    trialEnd = existingSubscription.trial_end;
  }

  // Determine final plan and status
  const finalPlan = status === "canceled" ? "free" : plan;
  const finalStatus = status;

  const updateData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    plan: finalPlan,
    status: finalStatus,
    interval: status === "canceled" ? null : interval,
    current_period_start: new Date(
      subscriptionItem.current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscriptionItem.current_period_end * 1000
    ).toISOString(),
    trial_start: trialStart,
    trial_end: trialEnd,
    trial_used: trialUsed,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
    ...(customerId && { stripe_customer_id: customerId }),
  };

  console.log("Updating subscription in database:", {
    userId,
    subscriptionId: subscription.id,
    status: finalStatus,
    plan: finalPlan,
    trialStart,
    trialEnd,
    trialUsed,
    stripeTrialStart: subscription.trial_start,
    stripeTrialEnd: subscription.trial_end,
  });

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(updateData, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

// Simplified webhook handlers (implement based on your needs)
export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded:", invoice.id);
  // Add any custom logic here
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed:", invoice.id);
  // Add any custom logic here (e.g., notifications)
}

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log("Trial will end:", subscription.id);
  // Add any custom logic here (e.g., notifications)
}

export async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
) {
  console.log("Checkout session expired:", session.id);
  // Add any custom logic here
}
