"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Zap, Sparkles } from "lucide-react";
import { useState } from "react";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { getPlanConfig } from "@/lib/stripe/plans";
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { User } from "@supabase/supabase-js";

const plans: SubscriptionPlan[] = ["free", "premium", "business"];

interface PlanComparisonProps {
  user: User;
  subscription: Subscription;
}

export function PlanComparison({ subscription, user }: PlanComparisonProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");
  const currentPlan = subscription?.plan || "free";

  const isLoggedIn = !!user;

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
    const planConfig = getPlanConfig(plan);

    const isYearly = interval === "year";
    const monthlyEquivalent = isYearly
      ? Math.round((planConfig.price.yearly / 12) * 100) / 100
      : planConfig.price.monthly;

    return {
      display: `$${monthlyEquivalent}`,
      monthly: planConfig.price.monthly,
      yearly: planConfig.price.yearly,
      monthlyEquivalent,
    };
  };

  const getYearlyDiscount = (plan: SubscriptionPlan) => {
    const planConfig = getPlanConfig(plan);
    return interval === "year"
      ? Math.round(
          (1 - planConfig.price.yearly / 12 / planConfig.price.monthly) * 100
        )
      : 0;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-600" />
          </div>
          Choose Your Plan
        </CardTitle>
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
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              interval === "year" ? "bg-blue-600" : "bg-gray-200"
            }`}
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
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const planConfig = getPlanConfig(plan);
            const price = getPrice(plan);
            const yearlyDiscount = getYearlyDiscount(plan);
            const isPopular = plan === "premium";
            const isCurrentPlan = currentPlan === plan;

            return (
              <div
                key={plan}
                className={`relative p-4 rounded-lg border transition-all ${
                  isPopular
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {isPopular && (
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
                        <>
                          /month
                          {yearlyDiscount > 0 && (
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                              Save {yearlyDiscount}%
                            </Badge>
                          )}
                          {plan !== "free" && interval === "year" && (
                            <div className="text-xs text-slate-500">
                              Billed ${price.yearly} annually
                            </div>
                          )}
                        </>
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

                <UpgradeButton
                  plan={plan}
                  interval={interval}
                  currentPlan={currentPlan}
                  isLoggedIn={isLoggedIn}
                  className={`w-full h-9 ${
                    isPopular ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                  }`}
                />
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
