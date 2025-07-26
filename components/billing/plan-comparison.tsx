"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Building2,
  Zap,
  Sparkles,
  Timer,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { PlanButton } from "@/components/subscription/plan-button";
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { User } from "@supabase/supabase-js";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

const plans: SubscriptionPlan[] = ["free", "premium", "business"];

interface PlanComparisonProps {
  user: User | null;
  subscription: Subscription | null;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
  trialPlan?: SubscriptionPlan;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function PlanComparison({
  subscription,
  user,
  isTrialActive = false,
  trialDaysRemaining = null,
  hasUsedTrial = false,
  trialPlan,
  onError,
  onSuccess,
}: PlanComparisonProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>(
    subscription?.interval || "month"
  );

  // Handle trial state for current plan determination
  const currentPlan = isTrialActive
    ? trialPlan || subscription?.plan || "free"
    : subscription?.plan || "free";
  const currentInterval = subscription?.interval || "month";
  const currentStatus = subscription?.status || "active";
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;
  const isLoggedIn = !!user;
  const hasActiveSubscription =
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing");

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

  const isSubscriptionCanceled = () => {
    return subscription?.status === "canceled";
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "premium":
        return <Crown className="w-4 h-4 text-blue-600" />;
      case "business":
        return <Building2 className="w-4 h-4 text-purple-600" />;
      default:
        return <Zap className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPlanBgColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "premium":
        return "bg-blue-50";
      case "business":
        return "bg-purple-50";
      default:
        return "bg-slate-50";
    }
  };

  const getPlanBorderColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "premium":
        return "border-blue-200";
      case "business":
        return "border-purple-200";
      default:
        return "border-slate-200";
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    const subscriptionConfig = getSubscriptionConfig(plan);

    if (plan === "free") {
      return {
        display: "$0",
        monthly: 0,
        yearly: 0,
        monthlyEquivalent: 0,
      };
    }

    const isYearly = interval === "year";
    const monthlyEquivalent = isYearly
      ? Math.round((subscriptionConfig.pricing.yearly / 12) * 100) / 100
      : subscriptionConfig.pricing.monthly;

    return {
      display: `$${monthlyEquivalent}`,
      monthly: subscriptionConfig.pricing.monthly,
      yearly: subscriptionConfig.pricing.yearly,
      monthlyEquivalent,
    };
  };

  const getYearlyDiscount = (plan: SubscriptionPlan) => {
    if (plan === "free") return 0;

    const subscriptionConfig = getSubscriptionConfig(plan);
    return interval === "year"
      ? Math.round(
          (1 -
            subscriptionConfig.pricing.yearly /
              12 /
              subscriptionConfig.pricing.monthly) *
            100
        )
      : 0;
  };

  const isCurrentPlanAndInterval = (
    plan: SubscriptionPlan,
    checkInterval: SubscriptionInterval
  ) => {
    // For free plan, ignore interval since free doesn't have intervals
    if (plan === "free" && currentPlan === "free") {
      return true;
    }
    return currentPlan === plan && currentInterval === checkInterval;
  };

  const getCurrentPlanBadge = (
    plan: SubscriptionPlan,
    checkInterval: SubscriptionInterval
  ) => {
    const isExactMatch = isCurrentPlanAndInterval(plan, checkInterval);

    // Show trial badge if it's the current plan AND interval
    if (isTrialActive && isExactMatch) {
      return (
        <Badge className="bg-orange-600 text-white border-orange-600 text-xs font-medium flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Trial Active
        </Badge>
      );
    }

    // Show canceled badge if subscription is canceled and it's the exact match
    if (isSubscriptionCanceled() && isExactMatch) {
      const isStillActive = isSubscriptionActive();
      return (
        <Badge
          className={`text-xs font-medium flex items-center gap-1 ${
            isStillActive
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-red-600 text-white border-red-600"
          }`}
        >
          <XCircle className="w-3 h-3" />
          {isStillActive ? "Ending Soon" : "Canceled"}
        </Badge>
      );
    }

    // Show current plan badge if it's the exact plan and interval and active
    // Only show for paid plans, not free plan
    if (
      isExactMatch &&
      !isTrialActive &&
      isSubscriptionActive() &&
      plan !== "free"
    ) {
      return (
        <Badge className="bg-green-600 text-white border-green-600 text-xs font-medium">
          Current Plan
        </Badge>
      );
    }

    return null;
  };

  const getTrialEligibilityNote = (plan: SubscriptionPlan) => {
    if (plan === "free" || hasUsedTrial || isTrialActive) return null;

    return (
      <div className="mt-2 text-xs text-blue-600 font-medium">
        14-day free trial available
      </div>
    );
  };

  const getPlanCardBorder = (
    plan: SubscriptionPlan,
    checkInterval: SubscriptionInterval
  ) => {
    const isExactMatch = isCurrentPlanAndInterval(plan, checkInterval);
    const isPopular = plan === "premium";

    if (isExactMatch) {
      if (isTrialActive) {
        return "border-orange-500 bg-orange-50/50";
      }
      if (isSubscriptionCanceled()) {
        const isStillActive = isSubscriptionActive();
        return isStillActive
          ? "border-amber-500 bg-amber-50/50"
          : "border-red-500 bg-red-50/50";
      }
      // Only apply green styling for paid plans, not free plan
      if (plan !== "free") {
        return "border-green-500 bg-green-50/50";
      }
      // Free plan current state - just normal border, no green
      return "border-slate-200 hover:border-slate-300 hover:shadow-sm";
    }

    if (isPopular) {
      return "border-blue-500 bg-blue-50/50";
    }

    return "border-slate-200 hover:border-slate-300 hover:shadow-sm";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-600" />
          </div>
          {hasActiveSubscription || isTrialActive
            ? "Switch Your Plan"
            : "Choose Your Plan"}
        </CardTitle>
        {isTrialActive && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">
                You&apos;re on a free trial of{" "}
                {getSubscriptionConfig(currentPlan).name}
              </span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {trialDaysRemaining !== null
                ? `${trialDaysRemaining} days remaining. Convert to a paid plan to continue after your trial ends.`
                : "Convert to a paid plan to continue after your trial ends."}
            </p>
          </div>
        )}
        {isSubscriptionCanceled() && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Subscription canceled</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              {isSubscriptionActive()
                ? `Your subscription is scheduled to end on ${
                    subscription?.current_period_end
                      ? new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()
                      : "your next billing date"
                  }. You can reactivate anytime before then.`
                : "Your subscription has ended. You can start a new subscription anytime."}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 p-1 bg-slate-100 rounded-lg">
          <span
            className={`text-sm font-medium ${
              interval === "month" ? "text-slate-900" : "text-slate-600"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setInterval(interval === "month" ? "year" : "month")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              interval === "year" ? "bg-blue-600" : "bg-gray-200"
            }`}
            aria-label={`Switch to ${interval === "month" ? "yearly" : "monthly"} billing`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                interval === "year" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                interval === "year" ? "text-slate-900" : "text-slate-600"
              }`}
            >
              Yearly
            </span>
            {interval === "year" && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const planConfig = getSubscriptionConfig(plan);
            const price = getPrice(plan);
            const yearlyDiscount = getYearlyDiscount(plan);
            const isPopular = plan === "premium";
            const currentBadge = getCurrentPlanBadge(plan, interval);
            const trialNote = getTrialEligibilityNote(plan);

            return (
              <div
                key={plan}
                className={`relative p-4 rounded-lg border transition-all ${getPlanCardBorder(plan, interval)}`}
              >
                {currentBadge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {currentBadge}
                  </div>
                )}

                {!currentBadge && isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white border-blue-600 text-xs font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${getPlanBgColor(plan)} rounded-lg flex items-center justify-center border ${getPlanBorderColor(plan)}`}
                    >
                      {getPlanIcon(plan)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {planConfig.name}
                      </div>
                      <div className="text-slate-600 text-sm">
                        <span className="font-semibold text-lg text-slate-900">
                          {price.display}
                        </span>
                        {plan !== "free" && (
                          <>
                            /month
                            {yearlyDiscount > 0 && (
                              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                                Save {yearlyDiscount}%
                              </Badge>
                            )}
                            {interval === "year" && (
                              <div className="text-xs text-slate-500">
                                Billed ${price.yearly} annually
                              </div>
                            )}
                          </>
                        )}
                        {trialNote}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-3">
                    {planConfig.description}
                  </p>
                  <ul className="space-y-2">
                    {planConfig.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unified Button - replaces both SwitchPlanButton and UpgradeButton */}
                <PlanButton
                  plan={plan}
                  interval={interval}
                  currentPlan={currentPlan}
                  currentInterval={currentInterval}
                  currentStatus={currentStatus}
                  isLoggedIn={isLoggedIn}
                  isCancelled={cancelAtPeriodEnd}
                  isTrialActive={isTrialActive}
                  trialDaysRemaining={trialDaysRemaining}
                  hasUsedTrial={hasUsedTrial}
                  onError={onError}
                  onSuccess={onSuccess}
                  className="w-full h-9"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="text-center">
            <p className="text-xs text-slate-600">
              Need a custom plan?{" "}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              No setup fees
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              24/7 support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
