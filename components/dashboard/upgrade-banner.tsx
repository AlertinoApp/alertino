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
        message: `Your trial ends in ${trialDaysRemaining} ${trialDaysRemaining === 1 ? "day" : "days"}. Convert now to keep premium features.`,
        icon: Timer,
        iconColor: "text-orange-600",
        bgGradient: "from-orange-50 to-red-50",
        borderColor: "border-orange-200",
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
        message: `Enjoying ${currentPlan === "basic" ? "Basic" : "Pro"}? ${trialDaysRemaining !== null ? `${trialDaysRemaining} days remaining.` : ""} Convert anytime to continue.`,
        icon: Gift,
        iconColor: "text-orange-600",
        bgGradient: "from-orange-50 to-amber-50",
        borderColor: "border-orange-200",
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
        message: `Your subscription ends on ${subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "your next billing date"}. Reactivate to continue.`,
        icon: AlertTriangle,
        iconColor: "text-amber-600",
        bgGradient: "from-amber-50 to-orange-50",
        borderColor: "border-amber-200",
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
    // test
    // Check for search limit exceeded first (highest priority)
    if (isAtSearchLimit) {
      return {
        type: "search_limit_reached",
        title: "Search Limit Reached",
        message: `You've used ${searchesUsedToday}/${searchLimit} searches today. Upgrade for more daily searches.`,
        icon: AlertTriangle,
        iconColor: "text-red-600",
        bgGradient: "from-red-50 to-pink-50",
        borderColor: "border-red-200",
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
        message: `You've reached your limit of ${filterLimit} filters. Upgrade for more filters and advanced features.`,
        icon: Crown,
        iconColor: "text-red-600",
        bgGradient: "from-red-50 to-pink-50",
        borderColor: "border-red-200",
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
        message: `You're using ${filtersCount}/${filterLimit} filters. Upgrade for more filters and automated scraping.`,
        icon: Crown,
        iconColor: "text-blue-600",
        bgGradient: "from-blue-50 to-indigo-50",
        borderColor: "border-blue-200",
        buttonText: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // New free user (0 filters)
    if (currentPlan === "free" && filtersCount === 0 && !hasUsedTrial) {
      return {
        type: "new_user",
        title: "Unlock Advanced Features",
        message:
          "Get more filters, automated scraping, and access to advanced features with a free 14-day trial.",
        icon: Crown,
        iconColor: "text-blue-600",
        bgGradient: "from-blue-50 to-indigo-50",
        borderColor: "border-blue-200",
        buttonText: "Start Free Trial",
        buttonVariant: "trial_start" as const,
        showDismiss: true,
      };
    }

    // Free user who used trial
    if (currentPlan === "free" && filtersCount === 0 && hasUsedTrial) {
      return {
        type: "upgrade_available",
        title: "Upgrade to Basic",
        message:
          "Get more filters, automated scraping, and access to all premium features.",
        icon: Crown,
        iconColor: "text-blue-600",
        bgGradient: "from-blue-50 to-indigo-50",
        borderColor: "border-blue-200",
        buttonText: "Upgrade Now",
        buttonVariant: "upgrade" as const,
        showDismiss: true,
      };
    }

    // Basic plan user approaching Pro limits
    if (
      currentPlan === "basic" &&
      (isNearFilterLimit || searchesUsedToday >= Math.ceil(searchLimit * 0.8))
    ) {
      return {
        type: "upgrade_to_pro",
        title: "Upgrade to Pro",
        message: `Get unlimited filters and ${getDailySearchLimit("pro")} searches per day for maximum flexibility.`,
        icon: Crown,
        iconColor: "text-purple-600",
        bgGradient: "from-purple-50 to-indigo-50",
        borderColor: "border-purple-200",
        buttonText: "Upgrade to Pro",
        buttonVariant: "upgrade" as const,
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
        return "bg-orange-600 hover:bg-orange-700";
      case "trial":
        return "bg-orange-600 hover:bg-orange-700";
      case "reactivate":
        return "bg-amber-600 hover:bg-amber-700";
      case "trial_start":
        return "bg-blue-600 hover:bg-blue-700";
      case "upgrade":
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  const getHref = () => {
    switch (bannerContext.type) {
      case "trial_ending":
      case "trial_active":
      case "ending_soon":
        return "/billing";
      case "approaching_limit":
      case "new_user":
      case "upgrade_available":
      default:
        return "/pricing";
    }
  };

  return (
    <Card
      className={`bg-gradient-to-r ${bannerContext.bgGradient} ${bannerContext.borderColor} shadow-sm`}
    >
      <CardContent className="p-4 sm:p-6 relative">
        {/* Close Button - Upper Right (only if dismissible) */}
        {bannerContext.showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className={`${bannerContext.iconColor.replace("text-", "text-").replace("600", "700")} hover:bg-white/50 absolute top-2 right-2 z-10 sm:hidden`}
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
              className={`w-12 h-12 ${bannerContext.bgGradient.includes("blue") ? "bg-blue-100" : bannerContext.bgGradient.includes("orange") ? "bg-orange-100" : "bg-amber-100"} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <BannerIcon className={`w-6 h-6 ${bannerContext.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${bannerContext.iconColor.replace("600", "900")}`}
                >
                  {bannerContext.title}
                </h3>
              </div>
              <p
                className={`${bannerContext.iconColor.replace("600", "800")} text-sm leading-relaxed`}
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
                className={`${bannerContext.iconColor.replace("600", "700")} hover:bg-white/50`}
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
              className={`w-10 h-10 ${bannerContext.bgGradient.includes("blue") ? "bg-blue-100" : bannerContext.bgGradient.includes("orange") ? "bg-orange-100" : "bg-amber-100"} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <BannerIcon className={`w-5 h-5 ${bannerContext.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${bannerContext.iconColor.replace("600", "900")} text-sm`}
                >
                  {bannerContext.title}
                </h3>
                {(bannerContext.type === "trial_ending" ||
                  bannerContext.type === "trial_active") &&
                  trialDaysRemaining !== null && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      {trialDaysRemaining}d
                    </Badge>
                  )}
              </div>
              <p
                className={`${bannerContext.iconColor.replace("600", "800")} text-xs leading-relaxed`}
              >
                {bannerContext.message}
              </p>
            </div>
          </div>

          {/* Action Button for mobile */}
          <div className="flex justify-start">
            <Button asChild className={`${getButtonColor()} text-xs px-3`}>
              <Link href={getHref()}>
                <Zap className="w-3 h-3 mr-1" />
                <span className="hidden xs:inline">
                  {bannerContext.buttonText}
                </span>
                <span className="xs:hidden">
                  {bannerContext.type === "trial_ending"
                    ? "Convert"
                    : bannerContext.type === "trial_active"
                      ? "Convert"
                      : bannerContext.type === "ending_soon"
                        ? "Reactivate"
                        : "Upgrade"}
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
