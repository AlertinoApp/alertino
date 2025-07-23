import type {
  SubscriptionInterval,
  SubscriptionPlan,
} from "@/types/subscription";
import { getSubscriptionConfig } from "./plans";
import { MILLISECONDS_PER_DAY, PLAN_MAPPING } from "./constants";

export function mapStripePlanToSubscriptionPlan(
  priceId: string
): SubscriptionPlan {
  return PLAN_MAPPING[priceId] || "free";
}

export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function calculateDaysRemaining(endDate: Date): number {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / MILLISECONDS_PER_DAY);
}

export function getAppUrl(path: string = ""): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export function getPriceId(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
): string {
  if (plan === "free") {
    throw new Error("Free plan does not have a price ID");
  }

  const planConfig = getSubscriptionConfig(plan);
  const priceId =
    interval === "month"
      ? planConfig.stripePriceIds.monthly
      : planConfig.stripePriceIds.yearly;

  if (!priceId) {
    throw new Error(`No price ID found for ${plan} ${interval}`);
  }

  return priceId;
}
