"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, X, Zap, Timer, Gift, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Subscription, TrialInfo } from "@/types/subscription";
import { getFilterLimit, getDailySearchLimit } from "@/lib/stripe/plans";

interface UpgradeBannerProps {
  filtersCount: number;
  subscription?: Subscription | null;
  trialInfo?: TrialInfo | null;
  searchesUsedToday?: number;
}

export function UpgradeBanner({
  filtersCount,
  subscription,
  trialInfo,
  searchesUsedToday = 0,
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const currentPlan = subscription?.plan || "free";
  const isTrialActive = trialInfo?.isActive || false;
  const trialDaysRemaining = trialInfo?.daysRemaining || 0;
  const hasUsedTrial = trialInfo?.hasUsedTrial || false;

  // Check if subscription is effectively active (including grace periods)
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    if (isTrialActive) return true;
    if (subscription.status === "active") return true;
    if (subscription.status === "canceled" && subscription.current_period_end) {
      return new Date() < new Date(subscription.current_period_end);
    }
    return false;
  };

  // Determine what banner to show (if any)
  const getBannerContext = () => {
    // Don't show banner if user has active premium subscription
    if (isSubscriptionActive() && currentPlan !== "free" && !isTrialActive) {
      return null;
    }

    // Trial ending soon (3 days or less)
    if (
      isTrialActive &&
      trialDaysRemaining !== null &&
      trialDaysRemaining <= 3
    ) {
      return {
        type: "trial_ending",
        title: "Trial Ending Soon",
        message: `Your ${currentPlan === "basic" ? "Basic" : "Pro"} trial ends in ${trialDaysRemaining} ${trialDaysRemaining === 1 ? "day" : "days"}. Convert now to keep automated scraping and premium features.`,
        icon: Timer,
        iconColor: "text-orange-600",
        bgGradient: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-700",
        buttonText: "Convert Trial",
        buttonVariant: "urgent" as const,
        showDismiss: false,
      };
    }

    // Active trial (more than 3 days remaining)
    if (isTrialActive) {
      return {
        type: "trial_active",
        title: "Trial Active",
        message: `Enjoying ${currentPlan === "basic" ? "Basic" : "Pro"} features? Convert anytime to continue automated scraping and premium support.`,
        icon: Gift,
        iconColor: "text-orange-600",
        bgGradient: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-700",
        buttonText: "Convert Now",
        buttonVariant: "trial" as const,
        showDismiss: true,
      };
    }

    // Subscription ending soon (canceled but still active)
    if (subscription?.status === "canceled" && isSubscriptionActive()) {
      return {
        type: "ending_soon",
        title: "Subscription Ending Soon",
        message: `Your ${currentPlan === "basic" ? "Basic" : currentPlan === "pro" ? "Pro" : "Free"} subscription ends on ${subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "your next billing date"}. Reactivate to continue automated scraping and premium features.`,
        icon: AlertTriangle,
        iconColor: "text-amber-600",
        bgGradient: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-700",
        buttonText: "Reactivate",
        buttonVariant: "reactivate" as const,
        showDismiss: true,
      };
    }

    // Get plan limits
    const filterLimit = getFilterLimit(currentPlan);
    const searchLimit = getDailySearchLimit(currentPlan);
    const isAtFilterLimit = filterLimit !== -1 && filtersCount >= filterLimit;
    const isAtSearchLimit = searchesUsedToday >= searchLimit;
    const isNearFilterLimit =
      filterLimit !== -1 && filtersCount >= Math.ceil(filterLimit * 0.6); // Within 60% of limit

    // Check for search limit exceeded first (highest priority)
    if (isAtSearchLimit) {
      return {
        type: "search_limit_reached",
        title: "Daily Search Limit Reached",
        message: `You've used all ${searchLimit} daily searches. Upgrade to Basic for ${getDailySearchLimit("basic")} searches/day or Pro for unlimited searches.`,
        icon: AlertTriangle,
        iconColor: "text-red-600",
        bgGradient: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
        buttonText: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // Check for filter limit reached
    if (isAtFilterLimit) {
      return {
        type: "filter_limit_reached",
        title: "Filter Limit Reached",
        message: `You've reached your limit of ${filterLimit} filters. Upgrade to Basic for ${getFilterLimit("basic")} filters or Pro for unlimited filters with automated scraping.`,
        icon: Crown,
        iconColor: "text-red-600",
        bgGradient: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
        buttonText: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // Check for approaching filter limit
    if (isNearFilterLimit && !isAtFilterLimit) {
      return {
        type: "approaching_limit",
        title: "Approaching Filter Limit",
        message: `You're using ${filtersCount}/${filterLimit} filters (${Math.round((filtersCount / filterLimit) * 100)}% used). Upgrade for more filters and automated scraping to find apartments faster.`,
        icon: Crown,
        iconColor: "text-emerald-600",
        bgGradient: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-700",
        buttonText: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // Check for approaching search limit
    const isNearSearchLimit =
      searchLimit !== -1 && searchesUsedToday >= Math.ceil(searchLimit * 0.8);
    if (isNearSearchLimit && !isAtSearchLimit) {
      return {
        type: "approaching_search_limit",
        title: "Approaching Search Limit",
        message: `You've used ${searchesUsedToday}/${searchLimit} searches today (${Math.round((searchesUsedToday / searchLimit) * 100)}% used). Upgrade for more daily searches and automated scraping.`,
        icon: AlertTriangle,
        iconColor: "text-emerald-600",
        bgGradient: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-700",
        buttonText: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // New free user (0 filters)
    if (currentPlan === "free" && filtersCount === 0 && !hasUsedTrial) {
      return {
        type: "new_user",
        title: "Start Finding Apartments Today",
        message:
          "Create your first filter and get a free 14-day trial of Basic plan. Enjoy automated scraping, more filters, and priority support.",
        icon: Crown,
        iconColor: "text-emerald-600",
        bgGradient: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-700",
        buttonText: "Start Free Trial",
        buttonVariant: "trial_start" as const,
        showDismiss: true,
      };
    }

    return null;
  };

  const bannerContext = getBannerContext();

  if (isDismissed || !bannerContext) return null;

  const BannerIcon = bannerContext.icon;

  const getButtonColor = () => {
    switch (bannerContext.buttonVariant) {
      case "urgent":
        return "bg-orange-600 hover:bg-orange-700 text-white dark:text-white";
      case "trial":
        return "bg-orange-600 hover:bg-orange-700 text-white dark:text-white";
      case "reactivate":
        return "bg-amber-600 hover:bg-amber-700 text-white dark:text-white";
      case "trial_start":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-300";
      case "upgrade":
      default:
        return "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-300";
    }
  };

  const getHref = () => {
    switch (bannerContext.type) {
      case "trial_ending":
      case "trial_active":
      case "ending_soon":
        return "/account-settings?tab=billing";
      case "approaching_limit":
      case "approaching_search_limit":
      case "new_user":
      case "upgrade_available":
      case "upgrade_to_pro":
      case "pro_recommendation":
      default:
        return "/pricing";
    }
  };

  return (
    <Card
      className={`${bannerContext.bgGradient} ${bannerContext.borderColor} shadow-sm`}
    >
      <CardContent className="p-4 sm:p-6 relative">
        {/* Close Button - Upper Right (only if dismissible) */}
        {bannerContext.showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className={`${bannerContext.iconColor.replace("text-", "text-").replace("600", "700")} hover:bg-white/50 dark:hover:bg-gray-700/50 absolute top-2 right-2 z-10 sm:hidden`}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          {/* Main Content */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 ${bannerContext.bgGradient.includes("emerald") ? "bg-emerald-100 dark:bg-emerald-900/30" : bannerContext.bgGradient.includes("orange") ? "bg-orange-100 dark:bg-orange-900/30" : "bg-amber-100 dark:bg-amber-900/30"} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <BannerIcon className={`w-6 h-6 ${bannerContext.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${bannerContext.iconColor.replace("600", "900")} dark:text-gray-100`}
                >
                  {bannerContext.title}
                </h3>
                {(bannerContext.type === "trial_ending" ||
                  bannerContext.type === "trial_active") &&
                  trialDaysRemaining !== null && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 text-xs w-fit">
                      {trialDaysRemaining} days remaining
                    </Badge>
                  )}
              </div>
              <p
                className={`${bannerContext.iconColor.replace("600", "800")} dark:text-gray-300 text-sm leading-relaxed`}
              >
                {bannerContext.message}
              </p>
            </div>
          </div>

          {/* Action Buttons for desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild className={getButtonColor()}>
              <Link href={getHref()}>
                <Zap className="w-4 h-4 mr-2" />
                {bannerContext.buttonText}
              </Link>
            </Button>
            {bannerContext.showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className={`${bannerContext.iconColor.replace("600", "700")} hover:bg-white/50 dark:hover:bg-gray-700/50`}
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={`sm:hidden ${bannerContext.showDismiss ? "pr-8" : ""}`}>
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-10 h-10 ${bannerContext.bgGradient.includes("emerald") ? "bg-emerald-100 dark:bg-emerald-900/30" : bannerContext.bgGradient.includes("orange") ? "bg-orange-100 dark:bg-orange-900/30" : "bg-amber-100 dark:bg-amber-900/30"} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <BannerIcon className={`w-5 h-5 ${bannerContext.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3
                  className={`font-semibold ${bannerContext.iconColor.replace("600", "900")} dark:text-gray-100 text-base`}
                >
                  {bannerContext.title}
                </h3>
                {(bannerContext.type === "trial_ending" ||
                  bannerContext.type === "trial_active") &&
                  trialDaysRemaining !== null && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 text-xs w-fit">
                      {trialDaysRemaining} days remaining
                    </Badge>
                  )}
              </div>
              <p
                className={`${bannerContext.iconColor.replace("600", "800")} dark:text-gray-300 text-sm leading-relaxed`}
              >
                {bannerContext.message}
              </p>
            </div>
          </div>

          {/* Action Button for mobile */}
          <div className="flex justify-start">
            <Button asChild className={`${getButtonColor()} w-full sm:w-auto`}>
              <Link href={getHref()}>
                <Zap className="w-4 h-4 mr-2" />
                {bannerContext.buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
