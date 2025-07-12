export type SubscriptionPlan = "free" | "premium" | "business";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";
export type SubscriptionInterval = "month" | "year";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  interval: SubscriptionInterval | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  canceled_at: string;
}

export interface PlanConfig {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  maxFilters: number;
}
