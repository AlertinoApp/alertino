import { stripe } from "./config";
import { getUserIdByStripeSubscription } from "./database";
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

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded:", invoice.id);
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed:", invoice.id);
}

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log("Trial will end:", subscription.id);
  // TODO: Send notification to user
}

export async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
) {
  console.log("Checkout session expired:", session.id);
}
