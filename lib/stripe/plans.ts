import { SubscriptionPlan, PlanConfig } from "@/types/subscription";
import { Crown, Zap, Building2 } from "lucide-react";

const TRIAL_DAYS = 14;

export const SUBSCRIPTION_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: "Free",
    description: "Perfect for getting started with apartment hunting",
    icon: Zap,
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: "",
      yearly: "",
    },
    features: [
      "3 active filters",
      "10 searches per day (manual only)",
      "Email notifications (weekly summary)",
      "Basic filters only",
      "Community support",
    ],
    limits: {
      filtersLimit: 3,
      searchesPerDay: 10,
      scrapingInterval: 0, // No auto scraping for free
      notificationTypes: ["email"],
      filtersType: "basic",
      autoCheckLimit: 0,
    },
    trialDays: 0,
  },
  basic: {
    name: "Basic",
    description: "For serious apartment hunters who need more flexibility",
    icon: Crown,
    pricing: {
      monthly: 39,
      yearly: 390,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID!,
    },
    features: [
      "10 active filters",
      "50 searches per day",
      "Scraping every 4 hours",
      "Email + SMS notifications",
      "Access to advanced filters",
      "Priority support",
      "Export alerts to CSV",
    ],
    limits: {
      filtersLimit: 10,
      searchesPerDay: 50,
      scrapingInterval: 4, // 4 hours
      notificationTypes: ["email", "sms"],
      filtersType: "advanced",
      autoCheckLimit: 50,
    },
    trialDays: TRIAL_DAYS,
  },
  pro: {
    name: "Pro",
    description: "For real estate professionals and power users",
    icon: Building2,
    pricing: {
      monthly: 99,
      yearly: 990,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
    },
    features: [
      "Unlimited filters",
      "200 searches per day",
      "Scraping every 1 hour",
      "Email + SMS notifications",
      "Access to advanced filters",
      "Priority support",
      "Export alerts to CSV",
      "Custom notification schedules",
      "Advanced analytics",
    ],
    limits: {
      filtersLimit: 50,
      searchesPerDay: 200,
      scrapingInterval: 1, // 1 hour
      notificationTypes: ["email", "sms"],
      filtersType: "advanced",
      autoCheckLimit: 200,
    },
    trialDays: 0,
  },
};

export function getSubscriptionConfig(plan: SubscriptionPlan): PlanConfig {
  const config = SUBSCRIPTION_CONFIGS[plan];
  if (!config) {
    throw new Error(`Invalid subscription plan: ${plan}`);
  }
  return config;
}

export function getUpgradeMessage(currentPlan: SubscriptionPlan): string {
  switch (currentPlan) {
    case "free":
      return "Upgrade to Basic for more filters and automated scraping";
    case "basic":
      return "Upgrade to Pro for unlimited filters and faster scraping";
    case "pro":
      return "You're on our highest tier plan";
    default:
      return "Upgrade your plan for more features";
  }
}

// Helper function to check if user can access advanced filters
export function canAccessAdvancedFilters(plan: SubscriptionPlan): boolean {
  const config = getSubscriptionConfig(plan);
  return config.limits.filtersType === "advanced";
}

// Helper function to get user's filter limit
export function getFilterLimit(plan: SubscriptionPlan): number {
  const config = getSubscriptionConfig(plan);
  return config.limits.filtersLimit;
}

// Helper function to get user's daily search limit
export function getDailySearchLimit(plan: SubscriptionPlan): number {
  const config = getSubscriptionConfig(plan);
  return config.limits.searchesPerDay;
}

// Helper function to get user's scraping interval
export function getScrapingInterval(plan: SubscriptionPlan): number {
  const config = getSubscriptionConfig(plan);
  return config.limits.scrapingInterval;
}

// Helper function to check if user has SMS notifications
export function hasSmsNotifications(plan: SubscriptionPlan): boolean {
  const config = getSubscriptionConfig(plan);
  return config.limits.notificationTypes.includes("sms");
}
