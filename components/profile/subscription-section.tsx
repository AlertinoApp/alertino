"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getSubscriptionConfig,
  getUpgradeMessage,
  type SubscriptionPlan,
} from "@/lib/subscription-utils";
import {
  Settings,
  ArrowRight,
  Sparkles,
  Check,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Subscription } from "@/types/subscription";
import { SubscriptionBadge } from "../ui/subscription-badge";

interface SubscriptionSectionProps {
  subscription?: Subscription;
}

export function SubscriptionSection({
  subscription,
}: SubscriptionSectionProps) {
  const subscriptionPlan = (subscription?.plan as SubscriptionPlan) || "free";
  const config = getSubscriptionConfig(subscriptionPlan);
  const upgradeMessage = getUpgradeMessage(subscriptionPlan);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nextTierFeatures =
    subscriptionPlan === "free"
      ? getSubscriptionConfig("premium").features.slice(0, 5)
      : subscriptionPlan === "premium"
        ? getSubscriptionConfig("business").features.slice(0, 4)
        : [];

  const premiumConfig = getSubscriptionConfig("premium");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <config.icon className={`w-5 h-5 ${config.color.accent}`} />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <div className="space-y-6">
            {/* Current Plan Info */}
            <div
              className={`${config.color.bg} rounded-lg p-4 border ${config.color.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <SubscriptionBadge plan={subscriptionPlan} size="md" />
                <div className="text-right">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">
                    {subscription.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 font-medium">
                    Next Billing
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Usage</span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {config.limits.filters === "unlimited"
                      ? "Unlimited"
                      : `${config.limits.filters} filters`}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Your Plan Includes:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {config.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                <Link href="/billing">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-slate-200 bg-transparent"
              >
                <Link href="/pricing">View All Plans</Link>
              </Button>
            </div>

            {/* Upgrade Suggestion for non-Business plans */}
            {subscriptionPlan !== "business" && (
              <div
                className={`${getSubscriptionConfig(subscriptionPlan === "free" ? "premium" : "business").color.bg} border ${getSubscriptionConfig(subscriptionPlan === "free" ? "premium" : "business").color.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <TrendingUp
                    className={`w-5 h-5 ${getSubscriptionConfig(subscriptionPlan === "free" ? "premium" : "business").color.accent} mt-0.5`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {subscriptionPlan === "free"
                        ? "Upgrade to Premium"
                        : "Upgrade to Business"}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {upgradeMessage}
                    </p>
                    <div className="space-y-1">
                      {nextTierFeatures.slice(0, 3).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Free Plan Promotion */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {upgradeMessage}
                  </p>
                  <div className="space-y-2">
                    {getSubscriptionConfig("premium")
                      .features.slice(0, 5)
                      .map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            >
              <Link href="/pricing">
                {premiumConfig.icon && (
                  <premiumConfig.icon className="w-4 h-4 mr-2" />
                )}
                Upgrade to Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
