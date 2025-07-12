"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getSubscriptionConfig,
  getUpgradeMessage,
} from "@/lib/subscription-utils";
import {
  Settings,
  ArrowRight,
  Sparkles,
  Check,
  TrendingUp,
  Crown,
  Building2,
  Zap,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { Subscription, SubscriptionPlan } from "@/types/subscription";

interface SubscriptionSectionProps {
  subscription?: Subscription;
  filtersCount?: number;
}

export function SubscriptionSection({
  subscription,
  filtersCount = 0,
}: SubscriptionSectionProps) {
  const subscriptionPlan = (subscription?.plan as SubscriptionPlan) || "free";
  const config = getSubscriptionConfig(subscriptionPlan);
  const upgradeMessage = getUpgradeMessage(subscriptionPlan);
  const subscriptionStatus = subscription?.status || "inactive";
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;

  // Determine if subscription is effectively active (including grace period)
  const isEffectivelyActive = () => {
    if (subscriptionStatus === "active") return true;
    if (subscriptionStatus === "trialing") return true;
    if (subscriptionStatus === "canceled" && currentPeriodEnd) {
      return new Date() < currentPeriodEnd;
    }
    return false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanIcon = () => {
    switch (subscriptionPlan) {
      case "premium":
        return <Crown className="w-5 h-5 text-blue-600" />;
      case "business":
        return <Building2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = () => {
    // Handle cancel at period end scenario
    if (cancelAtPeriodEnd && subscriptionStatus === "active") {
      return (
        <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-medium">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5" />
          Canceling Soon
        </Badge>
      );
    }

    // Handle canceled but still in grace period
    if (subscriptionStatus === "canceled" && isEffectivelyActive()) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5" />
          Grace Period
        </Badge>
      );
    }

    switch (subscriptionStatus) {
      case "active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
            Active
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
            Free Trial
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5" />
            Payment Required
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 font-medium">
            Free Plan
          </Badge>
        );
    }
  };

  const getBillingDateLabel = () => {
    if (cancelAtPeriodEnd && subscriptionStatus === "active") {
      return "Cancels On";
    }
    if (subscriptionStatus === "canceled" && isEffectivelyActive()) {
      return "Access Until";
    }
    if (subscriptionStatus === "trialing") {
      return "Trial Ends";
    }
    return "Next Billing";
  };

  const nextTierFeatures =
    subscriptionPlan === "free"
      ? getSubscriptionConfig("premium").features.slice(0, 3)
      : subscriptionPlan === "premium"
        ? getSubscriptionConfig("business").features.slice(0, 3)
        : [];

  const nextTierPlan = subscriptionPlan === "free" ? "premium" : "business";
  const nextTierConfig = getSubscriptionConfig(nextTierPlan);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
              {getPlanIcon()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 capitalize">
                {config.name} Plan
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <div className="space-y-6">
            {/* Subscription Details */}
            {currentPeriodEnd && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">
                        {getBillingDateLabel()}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {formatDate(subscription.current_period_end)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">
                        Active Filters
                      </div>
                      <div className="text-slate-600 text-sm">
                        {filtersCount}{" "}
                        {subscriptionPlan === "free" ? "/ 3" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Status Alerts */}
            {cancelAtPeriodEnd &&
              subscriptionStatus === "active" &&
              currentPeriodEnd && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-orange-900 mb-1">
                        Subscription Ending Soon
                      </div>
                      <p className="text-orange-800 text-sm">
                        Your subscription will end on{" "}
                        {currentPeriodEnd.toLocaleDateString()}. You can
                        reactivate anytime before then.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {subscriptionStatus === "canceled" &&
              isEffectivelyActive() &&
              currentPeriodEnd && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-amber-900 mb-1">
                        Grace Period Active
                      </div>
                      <p className="text-amber-800 text-sm">
                        Your subscription was canceled but you still have access
                        until {currentPeriodEnd.toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {subscriptionStatus === "canceled" && !isEffectivelyActive() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-red-900 mb-1">
                      Subscription Ended
                    </div>
                    <p className="text-red-800 text-sm">
                      Your subscription has ended and you&apos;ve been moved to
                      the free plan. You can upgrade anytime to restore premium
                      features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscriptionStatus === "past_due" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900 mb-1">
                      Payment Required
                    </div>
                    <p className="text-amber-800 text-sm">
                      Your payment is overdue. Please update your payment method
                      to continue using premium features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscriptionStatus === "trialing" && currentPeriodEnd && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900 mb-1">
                      Free Trial Active
                    </div>
                    <p className="text-blue-800 text-sm">
                      Your trial ends on {currentPeriodEnd.toLocaleDateString()}
                      . Upgrade now to continue enjoying premium features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Suggestion for non-Business plans */}
            {subscriptionPlan !== "business" && (
              <div
                className={`${nextTierConfig.color.bg} border ${nextTierConfig.color.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp
                      className={`w-4 h-4 ${nextTierConfig.color.accent}`}
                    />
                  </div>
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
                      {nextTierFeatures.map((feature, index) => (
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
                <Crown className="w-4 h-4 mr-2" />
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
