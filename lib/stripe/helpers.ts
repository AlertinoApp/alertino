import { stripe } from "./config";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapStripePlanToSubscriptionPlan(priceId: string): SubscriptionPlan {
  const planMapping: Record<string, SubscriptionPlan> = {
    [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!]: "premium",
    [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!]: "premium",
    [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!]: "business",
    [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID!]: "business",
  };

  return planMapping[priceId] || "free";
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const userId = session.metadata?.user_id;

    if (!subscriptionId || !customerId || !userId) {
      console.error("Missing required data in checkout session:", {
        subscriptionId,
        customerId,
        userId,
      });
      return;
    }

    // Retrieve the full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem.price;

    const plan = mapStripePlanToSubscriptionPlan(price.id);
    const interval = price.recurring?.interval as "month" | "year";

    // Upsert subscription record
    const { error } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        plan,
        status: subscription.status as SubscriptionStatus,
        interval,
        current_period_start: new Date(
          subscriptionItem.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscriptionItem.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Error upserting subscription:", error);
      return;
    }

    console.log(`✅ Subscription created/updated for user ${userId}`);
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
  }
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  try {
    const subscriptionId = subscription.id;
    const status = subscription.status as SubscriptionStatus;

    // Find the subscription record in our database
    const { data: subRecord, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (fetchError || !subRecord) {
      console.error("Subscription not found in database:", subscriptionId);
      return;
    }

    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem.price;
    const plan = mapStripePlanToSubscriptionPlan(price.id);
    const interval = price.recurring?.interval as "month" | "year";

    // Handle cancellation - move to free plan if subscription is canceled
    const finalPlan = status === "canceled" ? "free" : plan;
    const finalStatus = status === "canceled" ? "canceled" : status;

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: finalPlan,
        status: finalStatus,
        interval: status === "canceled" ? null : interval,
        current_period_start: new Date(
          subscriptionItem.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscriptionItem.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return;
    }

    console.log(
      `✅ Subscription updated for user ${subRecord.user_id}: ${finalPlan} (${finalStatus})`
    );
  } catch (error) {
    console.error("Error handling subscription change:", error);
  }
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
  try {
    // Get customer ID from subscriptions table
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      // Insert new subscription record with customer ID
      const { error } = await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          plan: "free", // Default to free plan
          status: "incomplete" as SubscriptionStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error(
          "Error upserting subscription with new customer ID:",
          error
        );
        throw error;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId },
      subscription_data: {
        metadata: { user_id: userId },
      },
      allow_promotion_codes: true,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw error;
  }
}

// Helper function to get user's subscription data
export async function getUserSubscription(userId: string) {
  const { data: subscription, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error fetching subscription:", error);
    return null;
  }

  return subscription;
}

// Helper function to check if user has active subscription
export async function hasActiveSubscription(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription) return false;

  const activeStatuses: SubscriptionStatus[] = ["active", "trialing"];
  const hasActiveStatus = activeStatuses.includes(subscription.status);

  // If subscription is set to cancel at period end, it's still active until then
  if (subscription.cancel_at_period_end && subscription.status === "active") {
    const periodEnd = new Date(subscription.current_period_end);
    const now = new Date();
    return now < periodEnd; // Still active until period ends
  }

  return hasActiveStatus;
}

// Helper function to get subscription details with cancellation info
export async function getSubscriptionDetails(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      plan: "free" as SubscriptionPlan,
      status: "incomplete" as SubscriptionStatus,
      isActive: false,
      willCancelAtPeriodEnd: false,
      periodEnd: null,
      canceledAt: null,
    };
  }

  const isActive = await hasActiveSubscription(userId);

  return {
    plan: subscription.plan,
    status: subscription.status,
    isActive,
    willCancelAtPeriodEnd: subscription.cancel_at_period_end,
    periodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at)
      : null,
  };
}
