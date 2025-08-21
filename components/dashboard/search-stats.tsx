"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";
import {
  getDailySearchLimit,
  getRemainingSearchesCount,
} from "@/lib/utils/subscription-utils";
import type { SubscriptionPlan } from "@/types/subscription";

interface SearchStatsProps {
  currentPlan: SubscriptionPlan;
  searchesUsedToday: number;
  searchesLimit?: number;
}

export function SearchStats({
  currentPlan,
  searchesUsedToday,
  searchesLimit,
}: SearchStatsProps) {
  const dailyLimit = searchesLimit || getDailySearchLimit(currentPlan);
  const remainingSearches = getRemainingSearchesCount(
    currentPlan,
    searchesUsedToday
  );
  const usagePercentage = Math.min((searchesUsedToday / dailyLimit) * 100, 100);
  const isAtLimit = remainingSearches === 0;
  const isNearLimit = remainingSearches <= Math.ceil(dailyLimit * 0.2); // Within 20% of limit

  const getProgressColor = () => {
    if (isAtLimit) return "bg-destructive";
    if (isNearLimit) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusBadge = () => {
    if (isAtLimit) {
      return (
        <Badge
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <Target className="w-3 h-3 mr-1" />
          Limit Reached
        </Badge>
      );
    }
    if (isNearLimit) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-600"
        >
          <Clock className="w-3 h-3 mr-1" />
          Near Limit
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg font-semibold text-foreground">
              Search Usage
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Usage Progress */}
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Today&apos;s searches</span>
              <span className="font-medium dark:text-gray-100">
                {searchesUsedToday} / {dailyLimit}
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2 bg-gray-200 dark:bg-gray-600"
            >
              <div
                className={`h-full transition-all duration-300 ease-out rounded-full ${getProgressColor()}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </Progress>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {remainingSearches}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Remaining
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailyLimit}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Daily Limit
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
