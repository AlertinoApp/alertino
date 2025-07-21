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
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { User } from "@supabase/supabase-js";
import { SwitchPlanButton } from "../subscription/switch-plan-button";
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
    return currentPlan === plan && currentInterval === checkInterval;
  };

  const isPlanChange = (plan: SubscriptionPlan) => {
    return currentPlan !== plan;
  };

  const isIntervalChange = (checkInterval: SubscriptionInterval) => {
    return currentInterval !== checkInterval;
  };

  const isAnyChange = (
    plan: SubscriptionPlan,
    checkInterval: SubscriptionInterval
  ) => {
    return isPlanChange(plan) || isIntervalChange(checkInterval);
  };

  const getCurrentPlanBadge = (
    plan: SubscriptionPlan,
    checkInterval: SubscriptionInterval
  ) => {
    // Only show trial badge if it's the current plan AND interval
    if (
      isTrialActive &&
      currentPlan === plan &&
      currentInterval === checkInterval
    ) {
      return (
        <Badge className="bg-orange-600 text-white border-orange-600 text-xs font-medium flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Trial{" "}
          {trialDaysRemaining !== null && `(${trialDaysRemaining} days left)`}
        </Badge>
      );
    }

    // Only show current plan badge if it's the exact plan and interval
    if (
      currentPlan === plan &&
      currentInterval === checkInterval &&
      !isTrialActive &&
      isSubscriptionActive()
    ) {
      return (
        <Badge className="bg-green-600 text-white border-green-600 text-xs font-medium">
          Current Plan
        </Badge>
      );
    }

    // Show if subscription is canceled but still active (exact plan and interval)
    if (
      currentPlan === plan &&
      currentInterval === checkInterval &&
      subscription?.status === "canceled" &&
      isSubscriptionActive()
    ) {
      return (
        <Badge className="bg-amber-600 text-white border-amber-600 text-xs font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Ending Soon
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
        {subscription?.status === "canceled" && isSubscriptionActive() && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Subscription ending soon
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Your subscription is scheduled to end on{" "}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString()
                : "your next billing date"}
              . Reactivate to continue using premium features.
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
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
            const isCurrent = isCurrentPlanAndInterval(plan, interval);
            const needsChange =
              (hasActiveSubscription || isTrialActive) &&
              isAnyChange(plan, interval);
            const currentBadge = getCurrentPlanBadge(plan, interval);
            const trialNote = getTrialEligibilityNote(plan);

            return (
              <div
                key={plan}
                className={`relative p-4 rounded-lg border transition-all ${
                  isCurrent
                    ? isTrialActive
                      ? "border-orange-500 bg-orange-50/50"
                      : subscription?.status === "canceled"
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-green-500 bg-green-50/50"
                    : isPopular
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {currentBadge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {currentBadge}
                  </div>
                )}

                {!currentBadge && !isCurrent && isPopular && (
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

                {/* Button Logic */}
                {isCurrent &&
                !isTrialActive &&
                subscription?.status === "active" ? (
                  <div className="w-full h-9 bg-green-100 border border-green-200 rounded-md flex items-center justify-center text-sm font-medium text-green-800">
                    Current Plan
                  </div>
                ) : isCurrent && isTrialActive ? (
                  <div className="w-full h-9 bg-orange-100 border border-orange-200 rounded-md flex items-center justify-center text-sm font-medium text-orange-800">
                    <Timer className="w-4 h-4 mr-2" />
                    Trial Active
                  </div>
                ) : isCurrent && subscription?.status === "canceled" ? (
                  <div className="w-full h-9 bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center text-sm font-medium text-amber-800">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Ending Soon
                  </div>
                ) : (hasActiveSubscription || isTrialActive) && needsChange ? (
                  <SwitchPlanButton
                    plan={plan}
                    interval={interval}
                    currentPlan={currentPlan}
                    currentInterval={currentInterval}
                    currentStatus={currentStatus}
                    isTrialActive={isTrialActive}
                    trialDaysRemaining={trialDaysRemaining}
                    hasUsedTrial={hasUsedTrial}
                    onError={onError}
                    onSuccess={onSuccess}
                    className={`w-full h-9 ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white hover:text-white!"
                        : ""
                    }`}
                  />
                ) : (
                  <UpgradeButton
                    plan={plan}
                    interval={interval}
                    currentPlan={currentPlan}
                    currentStatus={currentStatus}
                    isLoggedIn={isLoggedIn}
                    isTrialActive={isTrialActive}
                    trialDaysRemaining={trialDaysRemaining}
                    hasUsedTrial={hasUsedTrial}
                    onError={onError}
                    onSuccess={onSuccess}
                    className={`w-full h-9 ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white hover:text-white!"
                        : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            Need a custom plan?{" "}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
