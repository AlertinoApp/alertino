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
          className="bg-red-100 text-red-700 border-red-200"
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
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          <Clock className="w-3 h-3 mr-1" />
          Near Limit
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
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
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Today's searches</span>
              <span className="font-medium">
                {searchesUsedToday} / {dailyLimit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2 bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ease-out rounded-full ${getProgressColor()}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </Progress>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {remainingSearches}
              </div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {dailyLimit}
              </div>
              <div className="text-xs text-gray-600">Daily Limit</div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="text-xs text-gray-500 text-center">
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
            {isAtLimit && (
              <div className="mt-2">
                <a
                  href="/pricing"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Upgrade for more searches →
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
