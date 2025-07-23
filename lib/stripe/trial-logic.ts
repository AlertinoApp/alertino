import { TRIAL_DAYS, MILLISECONDS_PER_DAY } from "./constants";
import { timestampToDate } from "./utils";
import type { Subscription, SubscriptionStatus } from "@/types/subscription";
import type Stripe from "stripe";

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

export function determineTrialStatus(
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
