import { PlanConfig, SubscriptionPlan } from "@/types/subscription";

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: "Free",
    description: "Perfect for getting started with apartment hunting",
    price: { monthly: 0, yearly: 0 },
    stripePriceIds: { monthly: "", yearly: "" },
    features: [
      "Up to 3 active filters",
      "Email notifications",
      "Basic apartment alerts",
      "Warsaw & Krakow coverage",
      "Community support",
    ],
    maxFilters: 3,
  },
  premium: {
    name: "Premium",
    description: "For serious apartment hunters who need more flexibility",
    price: { monthly: 19, yearly: 190 },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    },
    features: [
      "Unlimited filters",
      "Priority notifications (5min delay)",
      "All Polish cities coverage",
      "Advanced filter options",
      "Email & SMS notifications",
      "Priority support",
      "Export alerts to CSV",
      "Custom notification schedules",
    ],
    maxFilters: -1, // unlimited
  },
  business: {
    name: "Business",
    description: "For real estate professionals and agencies",
    price: { monthly: 49, yearly: 490 },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID!,
    },
    features: [
      "Everything in Premium",
      "Team collaboration (up to 5 users)",
      "API access",
      "White-label notifications",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    maxFilters: -1, // unlimited
  },
};

export function getPlanConfig(plan: SubscriptionPlan): PlanConfig {
  return PLAN_CONFIGS[plan];
}
