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
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusBadge = () => {
    if (isAtLimit) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-600"
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
        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
