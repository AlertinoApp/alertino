import { stripe } from "./config";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInterval,
} from "@/types/subscription";
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

function getPriceIdFromPlanAndInterval(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
): string | null {
  // Guard clause: free plan doesn't have a price ID
  if (plan === "free") {
    return null;
  }

  const priceMapping: Record<string, string> = {
    premium_month: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    premium_year: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    business_month: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    business_year: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID!,
  };

  const key = `${plan}_${interval}`;
  const priceId = priceMapping[key];

  if (!priceId) {
    throw new Error(
      `No price ID found for plan: ${plan}, interval: ${interval}`
    );
  }

  return priceId;
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlan: SubscriptionPlan,
  newInterval: SubscriptionInterval
) {
  try {
    console.log(
      `Updating subscription ${subscriptionId} to ${newPlan} (${newInterval})`
    );

    // Get the new price ID (null for free plan)
    const newPriceId = getPriceIdFromPlanAndInterval(newPlan, newInterval);

    // Handle free plan: cancel subscription at period end
    if (!newPriceId && newPlan === "free") {
      console.log("Cancelling subscription for free plan downgrade");

      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      // Update our database to reflect the cancellation
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);

      if (error) {
        console.error("Error updating subscription for cancellation:", error);
        throw error;
      }

      console.log(
        `✅ Subscription scheduled for cancellation: ${subscriptionId}`
      );
      return updatedSubscription;
    }

    // Handle paid plans: update subscription price
    if (newPriceId) {
      // Retrieve current subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Get current subscription item
      const currentItem = subscription.items.data[0];

      if (!currentItem) {
        throw new Error("No subscription items found");
      }

      // Update the subscription with the new price
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          items: [
            {
              id: currentItem.id,
              price: newPriceId,
            },
          ],
          // Prorate the charges
          proration_behavior: "create_prorations",
          // Ensure subscription is not cancelled if it was previously set to cancel
          cancel_at_period_end: false,
        }
      );

      console.log(`✅ Subscription updated successfully: ${subscriptionId}`);

      // The webhook will handle updating our database when Stripe sends the subscription.updated event
      return updatedSubscription;
    }

    throw new Error("Invalid plan configuration");
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  try {
    console.log(`Cancelling subscription at period end: ${subscriptionId}`);

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error updating subscription for cancellation:", error);
      throw error;
    }

    console.log(
      `✅ Subscription scheduled for cancellation: ${subscriptionId}`
    );
    return updatedSubscription;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const userId = session.metadata?.user_id;

    console.log("Processing checkout session completed:", {
      sessionId: session.id,
      subscriptionId,
      customerId,
      userId,
    });

    if (!subscriptionId || !customerId || !userId) {
      console.error("Missing required data in checkout session:", {
        subscriptionId,
        customerId,
        userId,
      });
      throw new Error("Missing required data in checkout session");
    }

    // Retrieve the full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem.price;

    if (!price) {
      throw new Error("No price found in subscription");
    }

    const plan = mapStripePlanToSubscriptionPlan(price.id);
    const interval = price.recurring?.interval as "month" | "year";

    // Use transaction to ensure data consistency
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
        canceled_at: null, // Reset canceled_at for new subscription
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Error upserting subscription:", error);
      throw error;
    }

    console.log(
      `✅ Subscription created/updated for user ${userId} - Plan: ${plan}, Status: ${subscription.status}`
    );
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
    throw error; // Re-throw to ensure webhook fails and gets retried
  }
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  try {
    const subscriptionId = subscription.id;
    const status = subscription.status as SubscriptionStatus;

    console.log("Processing subscription change:", {
      subscriptionId,
      status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Find the subscription record in our database
    const { data: subRecord, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan, status")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (fetchError || !subRecord) {
      console.error(
        "Subscription not found in database:",
        subscriptionId,
        fetchError
      );
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem.price;
    const plan = mapStripePlanToSubscriptionPlan(price.id);
    const interval = price.recurring?.interval as "month" | "year";

    // Determine final plan and status
    let finalPlan: SubscriptionPlan;
    let finalStatus: SubscriptionStatus;

    if (status === "canceled") {
      finalPlan = "free";
      finalStatus = "canceled";
    } else {
      finalPlan = plan;
      finalStatus = status;
    }

    const updateData = {
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
    };

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }

    console.log(
      `✅ Subscription updated for user ${subRecord.user_id}: ${finalPlan} (${finalStatus})`
    );
  } catch (error) {
    console.error("Error handling subscription change:", error);
    throw error; // Re-throw to ensure webhook fails and gets retried
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
    console.log("Creating checkout session for user:", userId);

    // Validate price ID
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    // Get or create customer
    const customerId = await getOrCreateCustomer(userId, userEmail);

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

    console.log("✅ Checkout session created:", session.id);
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

async function getOrCreateCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  // First check if user already has a subscription with customer ID
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (subscription?.stripe_customer_id) {
    // Verify the customer exists in Stripe
    try {
      await stripe.customers.retrieve(subscription.stripe_customer_id);
      return subscription.stripe_customer_id;
    } catch (error) {
      console.warn("Customer not found in Stripe, creating new one:", error);
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { supabase_user_id: userId },
  });

  // Upsert subscription record with customer ID
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
      plan: "free",
      status: "incomplete" as SubscriptionStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Error upserting subscription with new customer ID:", error);
    throw error;
  }

  return customer.id;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    // Verify customer exists
    await stripe.customers.retrieve(customerId);

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
    // PGRST116 is "not found"
    throw error;
  }

  return subscription;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) return false;

    const activeStatuses: SubscriptionStatus[] = ["active", "trialing"];
    const hasActiveStatus = activeStatuses.includes(subscription.status);

    // If subscription is set to cancel at period end, it's still active until then
    if (subscription.cancel_at_period_end && subscription.status === "active") {
      const periodEnd = new Date(subscription.current_period_end);
      const now = new Date();
      return now < periodEnd;
    }

    return hasActiveStatus;
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return false;
  }
}
