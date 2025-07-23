import { getUserSubscription, updateSubscription } from "./database";
import { mapStripePlanToSubscriptionPlan, timestampToDate } from "./utils";
import { determineTrialStatus } from "./trial-logic";
import type {
  SubscriptionStatus,
  SubscriptionInterval,
  Subscription,
} from "@/types/subscription";
import type Stripe from "stripe";

export async function processSubscriptionUpdate(
  subscription: Stripe.Subscription,
  userId: string,
  customerId?: string
): Promise<void> {
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

  const subscriptionData: Partial<Subscription> & {
    user_id: string;
    stripe_subscription_id: string;
  } = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
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
  };

  await updateSubscription(subscriptionData);
}
