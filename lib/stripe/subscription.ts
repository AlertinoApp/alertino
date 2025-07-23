import { getUserSubscription } from "./database";
import { calculateDaysRemaining } from "./utils";
import type { TrialInfo } from "@/types/subscription";

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
