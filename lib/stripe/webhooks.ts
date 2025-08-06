import { Subscription } from "@/types/subscription";
import { stripe } from "./config";
import { getUserIdByStripeSubscription, updateSubscription } from "./database";
import { processSubscriptionUpdate } from "./subscription-processor";
import type Stripe from "stripe";

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.user_id;

  console.log("Processing checkout session completed:", {
    subscriptionId,
    customerId,
    userId,
    sessionId: session.id,
  });

  if (!subscriptionId || !customerId || !userId) {
    throw new Error("Missing required data in checkout session");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  console.log("Retrieved subscription for checkout session:", {
    subscriptionId,
    status: subscription.status,
    plan: subscription.items.data[0]?.price?.id,
  });

  await processSubscriptionUpdate(subscription, userId, customerId);
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  let userId = await getUserIdByStripeSubscription(subscription.id);

  console.log("Processing subscription change:", {
    subscriptionId: subscription.id,
    userId,
    status: subscription.status,
    plan: subscription.items.data[0]?.price?.id,
  });

  if (!userId) {
    console.error(`Subscription not found: ${subscription.id}`);

    // Try to get user ID from metadata if available
    const userMetadata = subscription.metadata?.user_id;
    if (userMetadata) {
      console.log(
        "Found user ID in metadata, processing subscription:",
        userMetadata
      );
      await processSubscriptionUpdate(subscription, userMetadata);
      return;
    }

    // Try to find user by customer ID
    if (subscription.customer) {
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { getUserIdByStripeCustomer } = await import("./database");
      userId = await getUserIdByStripeCustomer(customerId);

      if (userId) {
        console.log(
          "Found user ID by customer ID, processing subscription:",
          userId
        );
        await processSubscriptionUpdate(subscription, userId, customerId);
        return;
      }
    }

    console.error("Could not find user for subscription:", subscription.id);
    return;
  }

  await processSubscriptionUpdate(subscription, userId);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const userId = await getUserIdByStripeSubscription(subscription.id);

  if (!userId) {
    console.error(`Subscription not found for deletion: ${subscription.id}`);
    return;
  }

  // Update subscription to canceled status with free plan
  const subscriptionData: Partial<Subscription> & {
    user_id: string;
    stripe_subscription_id: string;
  } = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    plan: "free",
    status: "canceled",
    interval: null,
    canceled_at: new Date().toISOString(),
    cancel_at_period_end: false,
  };

  await updateSubscription(subscriptionData);
  console.log(`Subscription deleted and synced: ${subscription.id}`);
}

export async function handleSubscriptionTrialWillEnd(
  subscription: Stripe.Subscription
) {
  const userId = await getUserIdByStripeSubscription(subscription.id);

  if (!userId) {
    console.error(
      `Subscription not found for trial ending: ${subscription.id}`
    );
    return;
  }

  // Sync the subscription to ensure trial status is up to date
  const fullSubscription = await stripe.subscriptions.retrieve(
    subscription.id,
    {
      expand: ["items.data.price"],
    }
  );

  await processSubscriptionUpdate(fullSubscription, userId);
  console.log("Trial will end, subscription synced:", subscription.id);
  // TODO: Send notification to user
}
