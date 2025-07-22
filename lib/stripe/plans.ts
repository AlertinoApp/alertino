import { SubscriptionPlan } from "@/types/subscription";
import { Crown, Zap, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubscriptionConfig {
  name: string;
  description: string;
  icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
  pricing: {
    monthly: number;
    yearly: number;
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  limits: {
    maxFilters: number;
    cities: string;
    notifications: string;
    support: string;
  };
  trialDays: number;
}

const TRIAL_DAYS = 14;

export const SUBSCRIPTION_CONFIGS: Record<
  SubscriptionPlan,
  SubscriptionConfig
> = {
  free: {
    name: "Free",
    description: "Perfect for getting started with apartment hunting",
    icon: Zap,
    color: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      accent: "text-gray-600",
    },
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: "",
      yearly: "",
    },
    features: [
      "Up to 3 active filters",
      "Email notifications",
      "Basic apartment alerts",
      "Warsaw & Krakow coverage",
      "Community support",
    ],
    limits: {
      maxFilters: 3,
      cities: "Warsaw & Krakow",
      notifications: "Standard speed",
      support: "Community",
    },
    trialDays: 0,
  },
  premium: {
    name: "Premium",
    description: "For serious apartment hunters who need more flexibility",
    icon: Crown,
    color: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      accent: "text-blue-600",
    },
    pricing: {
      monthly: 19,
      yearly: 190,
    },
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
    limits: {
      maxFilters: -1,
      cities: "All Polish cities",
      notifications: "5-minute delay",
      support: "Priority",
    },
    trialDays: TRIAL_DAYS,
  },
  business: {
    name: "Business",
    description: "For real estate professionals and leading agencies",
    icon: Building2,
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      accent: "text-purple-600",
    },
    pricing: {
      monthly: 49,
      yearly: 490,
    },
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
    limits: {
      maxFilters: -1,
      cities: "All Polish cities",
      notifications: "Instant",
      support: "Dedicated manager",
    },
    trialDays: TRIAL_DAYS,
  },
};

export function getSubscriptionConfig(
  plan: SubscriptionPlan
): SubscriptionConfig {
  const config = SUBSCRIPTION_CONFIGS[plan];
  if (!config) {
    throw new Error(`Invalid subscription plan: ${plan}`);
  }
  return config;
}

export function getUpgradeMessage(currentPlan: SubscriptionPlan): string {
  switch (currentPlan) {
    case "free":
      return "Upgrade to Premium for unlimited filters and priority notifications";
    case "premium":
      return "Upgrade to Business for team collaboration and API access";
    case "business":
      return "You're on our highest tier plan";
    default:
      return "Upgrade your plan for more features";
  }
}
