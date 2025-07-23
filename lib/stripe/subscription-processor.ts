import { getUserSubscription, updateSubscription } from "./database";
import { mapStripePlanToSubscriptionPlan, timestampToDate } from "./utils";
import { determineTrialStatus } from "./trial-logic";
import type {
  SubscriptionStatus,
  SubscriptionInterval,
} from "@/types/subscription";
import type { SubscriptionData } from "./types";
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

  const subscriptionData: SubscriptionData = {
    userId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    plan: status === "canceled" ? "free" : plan,
    status,
    interval: status === "canceled" ? null : interval,
    currentPeriodStart: timestampToDate(
      subscriptionItem.current_period_start
    ).toISOString(),
    currentPeriodEnd: timestampToDate(
      subscriptionItem.current_period_end
    ).toISOString(),
    trialStart,
    trialEnd,
    trialUsed,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? timestampToDate(subscription.canceled_at).toISOString()
      : null,
  };

  await updateSubscription(subscriptionData);
}
