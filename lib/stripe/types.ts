import {
  SubscriptionInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

export interface SubscriptionData {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  interval: SubscriptionInterval | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string | null;
  trialEnd: string | null;
  trialUsed: boolean;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}
