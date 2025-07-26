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

  if (!subscriptionId || !customerId || !userId) {
    throw new Error("Missing required data in checkout session");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  await processSubscriptionUpdate(subscription, userId, customerId);
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const userId = await getUserIdByStripeSubscription(subscription.id);

  if (!userId) {
    console.error(`Subscription not found: ${subscription.id}`);
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
