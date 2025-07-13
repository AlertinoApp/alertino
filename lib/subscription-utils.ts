import { SubscriptionPlan } from "@/types/subscription";
import { Crown, Zap, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubscriptionConfig {
  name: string;
  icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
  features: string[];
  limits: {
    filters: number | "unlimited";
    cities: string;
    notifications: string;
    support: string;
  };
}

export const SUBSCRIPTION_CONFIG: Record<SubscriptionPlan, SubscriptionConfig> =
  {
    free: {
      name: "Free",
      icon: Zap,
      color: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        accent: "text-gray-600",
      },
      features: [
        "Up to 3 active filters",
        "Email notifications",
        "Basic apartment alerts",
        "Warsaw & Krakow coverage",
      ],
      limits: {
        filters: 3,
        cities: "Warsaw & Krakow",
        notifications: "Standard speed",
        support: "Community",
      },
    },
    premium: {
      name: "Premium",
      icon: Crown,
      color: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        accent: "text-blue-600",
      },
      features: [
        "Unlimited filters",
        "Priority notifications (5min delay)",
        "All Polish cities coverage",
        "Advanced filter options",
        "Email & SMS notifications",
        "Priority support",
      ],
      limits: {
        filters: "unlimited",
        cities: "All Polish cities",
        notifications: "5-minute delay",
        support: "Priority",
      },
    },
    business: {
      name: "Business",
      icon: Building2,
      color: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        accent: "text-purple-600",
      },
      features: [
        "Everything in Premium",
        "Team collaboration (up to 5 users)",
        "API access",
        "White-label notifications",
        "Advanced analytics",
        "Dedicated account manager",
      ],
      limits: {
        filters: "unlimited",
        cities: "All Polish cities",
        notifications: "Instant",
        support: "Dedicated manager",
      },
    },
  };

export function getSubscriptionConfig(
  plan: SubscriptionPlan
): SubscriptionConfig {
  return SUBSCRIPTION_CONFIG[plan];
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
