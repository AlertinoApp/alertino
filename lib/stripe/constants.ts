import { SubscriptionPlan } from "@/types/subscription";

export const TRIAL_DAYS = 14;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const PLAN_MAPPING: Record<string, SubscriptionPlan> = {
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!]: "basic",
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!]: "basic",
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!]: "pro",
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID!]: "pro",
};
