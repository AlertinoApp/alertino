import { stripe } from "./config";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInterval,
  TrialInfo,
  Subscription,
} from "@/types/subscription";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Constants
const TRIAL_DAYS = 14;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

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

// Helper functions
function mapStripePlanToSubscriptionPlan(priceId: string): SubscriptionPlan {
  return PLAN_MAPPING[priceId] || "free";
}

function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

function calculateDaysRemaining(endDate: Date): number {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / MILLISECONDS_PER_DAY);
}

// Database operations
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

async function createStripeCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { supabase_user_id: userId },
  });

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

async function getOrCreateCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  const subscription = await getUserSubscription(userId);

  if (subscription?.stripe_customer_id) {
    try {
      await stripe.customers.retrieve(subscription.stripe_customer_id);
      return subscription.stripe_customer_id;
    } catch {
      console.warn("Customer not found in Stripe, creating new one");
    }
  }

  return createStripeCustomer(userId, userEmail);
}

// Trial and subscription status
export async function getUserTrialInfo(userId: string): Promise<TrialInfo> {
  const subscription = await getUserSubscription(userId);

  const defaultTrialInfo = {
    isEligible: true,
    daysRemaining: null,
    isActive: false,
    hasUsedTrial: false,
  };

  if (!subscription) {
    return defaultTrialInfo;
  }

  const hasUsedTrial = subscription.trial_used || false;
  const isActive = subscription.status === "trialing";

  let daysRemaining = null;
  if (isActive && subscription.trial_end) {
    daysRemaining = calculateDaysRemaining(new Date(subscription.trial_end));
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
    if (subscription.cancel_at_period_end && subscription.current_period_end) {
      return now < new Date(subscription.current_period_end);
    }
    return true;
  }

  return false;
}

// Stripe operations
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

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  await stripe.customers.retrieve(customerId);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Trial logic helpers
function calculateTrialDates(subscription: Stripe.Subscription) {
  let trialStart = null;
  let trialEnd = null;

  if (subscription.trial_start && subscription.trial_start > 0) {
    trialStart = timestampToDate(subscription.trial_start).toISOString();
  }

  if (subscription.trial_end && subscription.trial_end > 0) {
    trialEnd = timestampToDate(subscription.trial_end).toISOString();

    // Calculate trial start if missing
    if (!trialStart) {
      const trialEndDate = new Date(trialEnd);
      const trialStartDate = new Date(
        trialEndDate.getTime() - TRIAL_DAYS * MILLISECONDS_PER_DAY
      );
      trialStart = trialStartDate.toISOString();
    }
  }

  return { trialStart, trialEnd };
}

function determineTrialStatus(
  subscription: Stripe.Subscription,
  existingSubscription: Subscription
): { trialStart: string | null; trialEnd: string | null; trialUsed: boolean } {
  const status = subscription.status as SubscriptionStatus;
  let { trialStart, trialEnd } = calculateTrialDates(subscription);
  let trialUsed = false;

  // Mark trial as used if we have trial dates or status is trialing
  if (trialStart || trialEnd || status === "trialing") {
    trialUsed = true;
  }

  // Handle trialing status without timestamps
  if (status === "trialing" && !trialStart && !trialEnd) {
    const now = new Date();
    trialStart = now.toISOString();
    trialEnd = new Date(
      now.getTime() + TRIAL_DAYS * MILLISECONDS_PER_DAY
    ).toISOString();
    trialUsed = true;
  }

  // Preserve existing trial status
  if (existingSubscription?.trial_used) {
    trialUsed = true;
    if (!trialStart) trialStart = existingSubscription.trial_start;
    if (!trialEnd) trialEnd = existingSubscription.trial_end;
  }

  return { trialStart, trialEnd, trialUsed };
}

// Database update operations
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

  // Get existing subscription and determine trial status
  const existingSubscription = await getUserSubscription(userId);
  const { trialStart, trialEnd, trialUsed } = determineTrialStatus(
    subscription,
    existingSubscription
  );

  const updateData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    plan: status === "canceled" ? "free" : plan,
    status,
    interval: status === "canceled" ? null : interval,
    current_period_start: timestampToDate(
      subscriptionItem.current_period_start
    ).toISOString(),
    current_period_end: timestampToDate(
      subscriptionItem.current_period_end
    ).toISOString(),
    trial_start: trialStart,
    trial_end: trialEnd,
    trial_used: trialUsed,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? timestampToDate(subscription.canceled_at).toISOString()
      : null,
    updated_at: new Date().toISOString(),
    ...(customerId && { stripe_customer_id: customerId }),
  };

  console.log("Updating subscription:", {
    userId,
    subscriptionId: subscription.id,
    status,
    plan: updateData.plan,
    trialUsed,
  });

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(updateData, { onConflict: "user_id" });

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

// Webhook handlers
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.user_id;

  if (!subscriptionId || !customerId || !userId) {
    throw new Error("Missing required data in checkout session");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  await updateSubscriptionInDatabase(subscription, userId, customerId);
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const { data: subRecord } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!subRecord) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  await updateSubscriptionInDatabase(subscription, subRecord.user_id);
}

// Simple webhook handlers
export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded:", invoice.id);
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed:", invoice.id);
}

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log("Trial will end:", subscription.id);
}

export async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
) {
  console.log("Checkout session expired:", session.id);
}
