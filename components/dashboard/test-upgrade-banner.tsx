"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, X, Zap, Timer, Gift, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Banner types for testing
type BannerType =
  | "trial_ending"
  | "trial_active"
  | "ending_soon"
  | "search_limit_reached"
  | "filter_limit_reached"
  | "approaching_limit"
  | "approaching_search_limit"
  | "new_user";

export function TestUpgradeBanner() {
  const [selectedBanner, setSelectedBanner] = useState<BannerType>("new_user");
  const [isDismissed, setIsDismissed] = useState(false);

  // Mock data for testing
  const mockData = {
    filtersCount: 8,
    searchesUsedToday: 45,
    currentPlan: "free" as const,
    trialDaysRemaining: 2,
    hasUsedTrial: false,
  };

  // Get banner context based on selected type
  const getBannerContext = () => {
    switch (selectedBanner) {
      case "trial_ending":
        return {
          type: "trial_ending",
          title: "Trial Ending Soon",
          message: `Your Basic trial ends in ${mockData.trialDaysRemaining} days. Convert now to keep automated scraping and premium features.`,
          icon: Timer,
          iconColor: "text-orange-600",
          bgGradient: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-700",
          buttonText: "Convert Trial",
          buttonVariant: "urgent" as const,
          showDismiss: false,
        };

      case "trial_active":
        return {
          type: "trial_active",
          title: "Trial Active",
          message: `Enjoying Basic features? Convert anytime to continue automated scraping and premium support.`,
          icon: Gift,
          iconColor: "text-orange-600",
          bgGradient: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-700",
          buttonText: "Convert Now",
          buttonVariant: "trial" as const,
          showDismiss: true,
        };

      case "ending_soon":
        return {
          type: "ending_soon",
          title: "Subscription Ending Soon",
          message: `Your Basic subscription ends on your next billing date. Reactivate to continue automated scraping and premium features.`,
          icon: AlertTriangle,
          iconColor: "text-amber-600",
          bgGradient: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-700",
          buttonText: "Reactivate",
          buttonVariant: "reactivate" as const,
          showDismiss: true,
        };

      case "search_limit_reached":
        return {
          type: "search_limit_reached",
          title: "Daily Search Limit Reached",
          message: `You've used all 10 daily searches. Upgrade to Basic for 50 searches/day or Pro for unlimited searches.`,
          icon: AlertTriangle,
          iconColor: "text-amber-600",
          bgGradient: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-700",
          buttonText: "Try Basic Free",
          buttonVariant: "upgrade" as const,
          showDismiss: true,
        };

      case "filter_limit_reached":
        return {
          type: "filter_limit_reached",
          title: "Filter Limit Reached",
          message: `You've reached your limit of 3 filters. Upgrade to Basic for 10 filters or Pro for unlimited filters with automated scraping.`,
          icon: Crown,
          iconColor: "text-amber-600",
          bgGradient: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-700",
          buttonText: "Try Basic Free",
          buttonVariant: "upgrade" as const,
          showDismiss: true,
        };

      case "approaching_limit":
        return {
          type: "approaching_limit",
          title: "Approaching Filter Limit",
          message: `You're using 8/10 filters (80% used). Upgrade for more filters and automated scraping to find apartments faster.`,
          icon: Crown,
          iconColor: "text-emerald-600",
          bgGradient: "bg-emerald-50 dark:bg-emerald-900/20",
          borderColor: "border-emerald-200 dark:border-emerald-700",
          buttonText: "Try Basic Free",
          buttonVariant: "upgrade" as const,
          showDismiss: true,
        };

      case "approaching_search_limit":
        return {
          type: "approaching_search_limit",
          title: "Approaching Search Limit",
          message: `You've used 45/50 searches today (90% used). Upgrade for more daily searches and automated scraping.`,
          icon: AlertTriangle,
          iconColor: "text-emerald-600",
          bgGradient: "bg-emerald-50 dark:bg-emerald-900/20",
          borderColor: "border-emerald-200 dark:border-emerald-700",
          buttonText: "Try Basic Free",
          buttonVariant: "upgrade" as const,
          showDismiss: true,
        };

      case "new_user":
      default:
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
  };

  const bannerContext = getBannerContext();

  if (isDismissed) return null;

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
      default:
        return "/pricing";
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Type Selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Banner Type to Test:
              </label>
              <Select
                value={selectedBanner}
                onValueChange={(value: BannerType) => setSelectedBanner(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial_ending">
                    Trial Ending Soon
                  </SelectItem>
                  <SelectItem value="trial_active">Trial Active</SelectItem>
                  <SelectItem value="ending_soon">
                    Subscription Ending Soon
                  </SelectItem>
                  <SelectItem value="search_limit_reached">
                    Search Limit Reached
                  </SelectItem>
                  <SelectItem value="filter_limit_reached">
                    Filter Limit Reached
                  </SelectItem>
                  <SelectItem value="approaching_limit">
                    Approaching Filter Limit
                  </SelectItem>
                  <SelectItem value="approaching_search_limit">
                    Approaching Search Limit
                  </SelectItem>
                  <SelectItem value="new_user">New User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsDismissed(false)}
              className="whitespace-nowrap"
            >
              Reset Banner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Banner */}
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
              className={`${bannerContext.iconColor.replace("text-", "text-").replace("600", "700")} hover:bg-white/50 dark:hover:bg-muted/50 absolute top-2 right-2 z-10 sm:hidden`}
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
                    className={`font-semibold ${bannerContext.iconColor.replace("600", "900")} dark:text-foreground`}
                  >
                    {bannerContext.title}
                  </h3>
                  {(bannerContext.type === "trial_ending" ||
                    bannerContext.type === "trial_active") && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 text-xs w-fit">
                      {mockData.trialDaysRemaining} days remaining
                    </Badge>
                  )}
                </div>
                <p
                  className={`${bannerContext.iconColor.replace("600", "800")} dark:text-muted-foreground text-sm leading-relaxed`}
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
                  className={`${bannerContext.iconColor.replace("600", "700")} hover:bg-white/50 dark:hover:bg-muted/50`}
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div
            className={`sm:hidden ${bannerContext.showDismiss ? "pr-8" : ""}`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 ${bannerContext.bgGradient.includes("emerald") ? "bg-emerald-100 dark:bg-emerald-900/30" : bannerContext.bgGradient.includes("orange") ? "bg-orange-100 dark:bg-orange-900/30" : "bg-amber-100 dark:bg-amber-900/30"} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <BannerIcon className={`w-5 h-5 ${bannerContext.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3
                    className={`font-semibold ${bannerContext.iconColor.replace("600", "900")} dark:text-foreground text-base`}
                  >
                    {bannerContext.title}
                  </h3>
                  {(bannerContext.type === "trial_ending" ||
                    bannerContext.type === "trial_active") && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 text-xs w-fit">
                      {mockData.trialDaysRemaining} days remaining
                    </Badge>
                  )}
                </div>
                <p
                  className={`${bannerContext.iconColor.replace("600", "800")} dark:text-muted-foreground text-sm leading-relaxed`}
                >
                  {bannerContext.message}
                </p>
              </div>
            </div>

            {/* Action Button for mobile */}
            <div className="flex justify-start">
              <Button
                asChild
                className={`${getButtonColor()} w-full sm:w-auto`}
              >
                <Link href={getHref()}>
                  <Zap className="w-4 h-4 mr-2" />
                  {bannerContext.buttonText}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Information */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-3">
            Current Banner Colors:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Icon Color:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.iconColor}
                </code>
              </p>
              <p>
                <strong>Background:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.bgGradient}
                </code>
              </p>
              <p>
                <strong>Border:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.borderColor}
                </code>
              </p>
            </div>
            <div>
              <p>
                <strong>Title Color:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.iconColor.replace("600", "900")}{" "}
                  dark:text-foreground
                </code>
              </p>
              <p>
                <strong>Message Color:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.iconColor.replace("600", "800")}{" "}
                  dark:text-muted-foreground
                </code>
              </p>
              <p>
                <strong>Button Style:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  {bannerContext.buttonVariant}
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
