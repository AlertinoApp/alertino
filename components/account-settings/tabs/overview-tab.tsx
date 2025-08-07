"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Filter, BarChart3, TrendingUp, Search } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Subscription, TrialInfo } from "@/types/subscription";
import type { Profile } from "@/types/users";
import { subscribeToAction } from "@/lib/actions/subscription-actions";
import {
  getSearchStats,
  getLastRunDate,
} from "@/lib/actions/search-tracking-actions";
import { getEnhancedSubscriptionConfig } from "@/lib/stripe/plans";
import { toast } from "sonner";
import { createClientForBrowser } from "@/app/utils/supabase/client";

interface OverviewTabProps {
  user: SupabaseUser;
  profile: Profile | null;
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
  filtersCount: number;
  alertsCount: number;
}

export function OverviewTab({
  user,
  subscription,
  alertsCount,
  filtersCount,
  trialInfo,
}: OverviewTabProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    today: number;
    weekTotal: number;
    dailyStats: Array<{ date: string; count: number }>;
  }>({ today: 0, weekTotal: 0, dailyStats: [] });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [dailyAlertsStats, setDailyAlertsStats] = useState<
    Array<{ date: string; count: number }>
  >([]);
  const [lastRunDate, setLastRunDate] = useState<Date | null>(null);

  const currentPlan = subscription?.plan || "free";
  const isTrialActive = trialInfo?.isActive || false;
  const trialDaysRemaining = trialInfo?.daysRemaining || 0;
  const config = getEnhancedSubscriptionConfig(currentPlan);

  const maxFilters = config.limits.filtersLimit;
  const maxSearches = config.limits.searchesPerDay;
  const searchesUsed = searchStats.today;

  const filterUsagePercentage = (filtersCount / maxFilters) * 100;
  const searchUsagePercentage = (searchesUsed / maxSearches) * 100;

  // Calculate time since last run
  const getTimeSinceLastRun = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return "Just now";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch search stats
        const stats = await getSearchStats(user.id);
        setSearchStats(stats);

        // Fetch favorite alerts count and daily alerts stats
        const supabase = createClientForBrowser();

        // Get daily alerts stats for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const { data: dailyAlerts } = await supabase
          .from("alerts")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        // Group alerts by date
        const alertsByDate = new Map<string, number>();
        dailyAlerts?.forEach((alert: { created_at: string }) => {
          const date = new Date(alert.created_at).toISOString().split("T")[0];
          alertsByDate.set(date, (alertsByDate.get(date) || 0) + 1);
        });

        // Fill in missing days with 0
        const dailyStats = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];
          const count = alertsByDate.get(dateStr) || 0;
          dailyStats.push({ date: dateStr, count });
        }

        setDailyAlertsStats(dailyStats);

        // Fetch last run date
        const lastRun = await getLastRunDate(user.id);
        setLastRunDate(lastRun);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [user.id]);

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic";
      case "pro":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "free":
        return "3 active filters, 10 searches per day, email notifications.";
      case "basic":
        return "10 active filters, 50 searches per day, email + SMS notifications.";
      case "pro":
        return "Unlimited filters, 200 searches per day, scraping every 1 hour, and access to advanced features.";
      default:
        return "";
    }
  };

  const handleStartBasicNow = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Starting Basic plan...", {
      description: "Redirecting to checkout.",
    });

    try {
      await subscribeToAction("basic", "month");
      toast.dismiss(loadingToast);
      setIsUpgradeModalOpen(false);
    } catch (error) {
      console.error("Failed to start Basic plan:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to start Basic plan", {
        description: "Please try again shortly.",
      });
      setIsLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Upgrading to Pro...", {
      description: "Redirecting to checkout.",
    });

    try {
      await subscribeToAction("pro", "month");
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Failed to upgrade to Pro:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to upgrade to Pro", {
        description: "Please try again shortly.",
      });
      setIsLoading(false);
    }
  };

  const renderPlanCards = () => {
    if (currentPlan === "free") {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium">
                      {getPlanName(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <Badge variant="secondary" className="text-xs">
                        {trialDaysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {getPlanDescription(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Your subscription will start on{" "}
                        {subscription?.trial_end
                          ? new Date(
                              subscription.trial_end
                            ).toLocaleDateString()
                          : new Date(
                              Date.now() +
                                (trialDaysRemaining || 0) * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Button section - always at bottom */}
                {isTrialActive && trialInfo?.isActive && (
                  <div className="pt-4">
                    <Button
                      className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                      onClick={() => setIsUpgradeModalOpen(true)}
                    >
                      Start Basic Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="text-base font-medium">Basic</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getPlanDescription("basic")}
                  </div>
                </div>

                {/* Button section - always at bottom */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-fit !py-1 rounded-md !px-2 !text-sm !text-white !bg-gray-900 hover:!bg-gray-800 disabled:opacity-50 mt-4"
                    onClick={() => setIsUpgradeModalOpen(true)}
                  >
                    Start 14-day trial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-base font-medium dark:text-gray-100">
                    Pro
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getPlanDescription("pro")}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    onClick={handleUpgradeToPro}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting..." : "Upgrade to Pro"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium">
                      {getPlanName(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <Badge variant="secondary" className="text-xs">
                        {trialDaysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {getPlanDescription(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Your subscription will start on{" "}
                        {subscription?.trial_end
                          ? new Date(
                              subscription.trial_end
                            ).toLocaleDateString()
                          : new Date(
                              Date.now() +
                                (trialDaysRemaining || 0) * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Button section - always at bottom */}
                {isTrialActive && currentPlan === "basic" && (
                  <div className="pt-4">
                    <Button
                      className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                      onClick={() => setIsUpgradeModalOpen(true)}
                    >
                      Start Basic Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-base font-medium dark:text-gray-100">
                    Pro
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getPlanDescription("pro")}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    onClick={handleUpgradeToPro}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting..." : "Upgrade to Pro"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        {/* Plan Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm h-full py-0">
              <CardContent className="p-6 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage Overview Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Usage Overview</CardTitle>
                <p className="text-sm text-slate-600">
                  Monitor your current usage and limits
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Usage Statistics</CardTitle>
                <p className="text-sm text-slate-600">
                  Detailed usage analytics
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* This Week Skeleton */}
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today Skeleton */}
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage History Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Usage History</CardTitle>
                <p className="text-sm text-slate-600">
                  Last 7 days search activity
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Cards Grid */}
      {renderPlanCards()}

      {/* Usage Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage Overview</CardTitle>
              <p className="text-sm text-slate-600">
                Monitor your current usage and limits
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filters Usage */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Filters</span>
                </div>
                <Badge variant="secondary">
                  {filtersCount}/{maxFilters}
                </Badge>
              </div>
              <Progress value={filterUsagePercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {maxFilters - filtersCount} filters remaining
              </p>
            </div>

            {/* Searches Usage */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Searches</span>
                </div>
                <Badge variant="secondary">
                  {searchesUsed}/{maxSearches}
                </Badge>
              </div>
              <Progress value={searchUsagePercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {maxSearches - searchesUsed} searches remaining today
              </p>
            </div>

            {/* Last Run Information */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Last Run</span>
                </div>
              </div>

              {lastRunDate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last scan:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {lastRunDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time ago:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTimeSinceLastRun(lastRunDate)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-gray-400 mb-1">—</div>
                  <p className="text-sm text-gray-500">No runs yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Run your first search to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage Statistics</CardTitle>
              <p className="text-sm text-slate-600">Detailed usage analytics</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This Week */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Searches performed
                  </span>
                  <span className="font-medium">{searchStats.weekTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active filters</span>
                  <span className="font-medium">{filtersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active alerts</span>
                  <span className="font-medium">{alertsCount}</span>
                </div>
              </div>
            </div>

            {/* Today */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Today</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Searches used</span>
                  <span className="font-medium">{searchStats.today}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Searches remaining
                  </span>
                  <span className="font-medium">
                    {maxSearches - searchesUsed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Usage percentage
                  </span>
                  <span className="font-medium">
                    {Math.round(searchUsagePercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage History</CardTitle>
              <p className="text-sm text-slate-600">
                Last 7 days search activity
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {searchStats.dailyStats.map((day, index) => {
              const alertsFound =
                dailyAlertsStats.find((d) => d.date === day.date)?.count || 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-slate-600">
                        {day.count} searches performed
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        alertsFound > 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {alertsFound} alerts
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-medium sm:text-2xl">
              Start Basic Now
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                Get immediate access to advanced filters and all Basic features.
              </p>
              <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                This will end your trial period, and your payment method on file
                will be charged.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 h-11 sm:h-10"
                onClick={() => setIsUpgradeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:flex-1 h-11 sm:h-10 !text-white !bg-gray-900 hover:!bg-gray-800 border-gray-900 hover:border-gray-800"
                onClick={handleStartBasicNow}
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start Basic Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
