import { LucideIcon } from "lucide-react";

export type SubscriptionPlan = "free" | "basic" | "pro";
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
  trial_start: string | null;
  trial_end: string | null;
  trial_used: boolean;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
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
  trialDays: number;
}

// New enhanced plan configuration interface
export interface EnhancedPlanConfig {
  name: string;
  description: string;
  icon: LucideIcon;
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
    filtersLimit: number;
    searchesPerDay: number;
    scrapingInterval: number; // in hours
    notificationTypes: ("email" | "sms")[];
    filtersType: "basic" | "advanced";
    autoCheckLimit: number; // searches per day for auto scraping
  };
  trialDays: number;
}

export interface TrialInfo {
  isEligible: boolean;
  daysRemaining: number | null;
  isActive: boolean;
  hasUsedTrial: boolean;
}
