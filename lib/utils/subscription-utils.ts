import { SubscriptionPlan } from "@/types/subscription";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

// Helper function to check if SMS notifications are available (but not fully implemented yet)
export function isSmsNotificationsAvailable(plan: SubscriptionPlan): boolean {
  const config = getSubscriptionConfig(plan);
  return config.limits.notificationTypes.includes("sms");
}

// Helper function to get SMS notification status message
export function getSmsNotificationStatus(plan: SubscriptionPlan): {
  available: boolean;
  status: "available" | "coming-soon" | "not-available";
  message: string;
} {
  const config = getSubscriptionConfig(plan);
  const hasSms = config.limits.notificationTypes.includes("sms");

  if (!hasSms) {
    return {
      available: false,
      status: "not-available",
      message: "SMS notifications not included in this plan",
    };
  }

  // For now, SMS is "coming soon" for all plans that include it
  return {
    available: true,
    status: "coming-soon",
    message: "SMS notifications coming soon",
  };
}

// Helper function to check if user can add more filters
export function canAddMoreFilters(
  currentPlan: SubscriptionPlan,
  currentFiltersCount: number
): boolean {
  const config = getSubscriptionConfig(currentPlan);
  const limit = config.limits.filtersLimit;

  if (limit === -1) return true; // Unlimited
  return currentFiltersCount < limit;
}

// Helper function to get remaining filters count
export function getRemainingFiltersCount(
  currentPlan: SubscriptionPlan,
  currentFiltersCount: number
): number {
  const config = getSubscriptionConfig(currentPlan);
  const limit = config.limits.filtersLimit;

  if (limit === -1) return -1; // Unlimited
  return Math.max(0, limit - currentFiltersCount);
}

// Helper function to check if user can perform more searches today
export function canPerformSearch(
  currentPlan: SubscriptionPlan,
  searchesUsedToday: number
): boolean {
  const config = getSubscriptionConfig(currentPlan);
  const limit = config.limits.searchesPerDay;

  return searchesUsedToday < limit;
}

// Helper function to get user's daily search limit
export function getDailySearchLimit(plan: SubscriptionPlan): number {
  const config = getSubscriptionConfig(plan);
  return config.limits.searchesPerDay;
}

// Helper function to get remaining searches count
export function getRemainingSearchesCount(
  currentPlan: SubscriptionPlan,
  searchesUsedToday: number
): number {
  const config = getSubscriptionConfig(currentPlan);
  const limit = config.limits.searchesPerDay;

  return Math.max(0, limit - searchesUsedToday);
}

// Helper function to get scraping interval in human-readable format
export function getScrapingIntervalDisplay(plan: SubscriptionPlan): string {
  const config = getSubscriptionConfig(plan);
  const interval = config.limits.scrapingInterval;

  if (interval === 0) return "Manual only";
  if (interval === 1) return "Every hour";
  if (interval === 4) return "Every 4 hours";
  if (interval === 24) return "Daily";

  return `Every ${interval} hours`;
}

// Helper function to get plan upgrade recommendation
export function getUpgradeRecommendation(
  currentPlan: SubscriptionPlan,
  filtersCount: number,
  searchesUsedToday: number
): {
  recommended: boolean;
  reason: string;
  suggestedPlan: SubscriptionPlan | null;
} {
  const config = getSubscriptionConfig(currentPlan);

  // Check if user is approaching or at limits
  const isAtFilterLimit =
    config.limits.filtersLimit !== -1 &&
    filtersCount >= config.limits.filtersLimit;
  const isAtSearchLimit = searchesUsedToday >= config.limits.searchesPerDay;

  if (currentPlan === "free") {
    if (isAtFilterLimit || isAtSearchLimit) {
      return {
        recommended: true,
        reason: "You've reached your free plan limits",
        suggestedPlan: "basic",
      };
    }
    if (filtersCount >= 2) {
      return {
        recommended: true,
        reason: "You're approaching your filter limit",
        suggestedPlan: "basic",
      };
    }
  }

  if (currentPlan === "basic") {
    if (isAtFilterLimit || isAtSearchLimit) {
      return {
        recommended: true,
        reason: "You've reached your Basic plan limits",
        suggestedPlan: "pro",
      };
    }
    if (filtersCount >= 8) {
      return {
        recommended: true,
        reason: "You're approaching your filter limit",
        suggestedPlan: "pro",
      };
    }
  }

  return {
    recommended: false,
    reason: "",
    suggestedPlan: null,
  };
}
