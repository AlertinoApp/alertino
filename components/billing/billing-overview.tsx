import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Building2,
  Zap,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import type { Subscription } from "@/types/subscription";
import { createPortalSessionAction } from "@/lib/actions/subscription-actions";
import { getPlanConfig } from "@/lib/stripe/plans";

interface BillingOverviewProps {
  subscription: Subscription;
  filtersCount: number;
}

export function BillingOverview({
  subscription,
  filtersCount,
}: BillingOverviewProps) {
  const currentPlan = subscription?.plan || "free";
  const planConfig = getPlanConfig(currentPlan);
  const planInterval = subscription?.interval || "";
  const subscriptionStatus = subscription?.status || "inactive";
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "premium":
        return <Crown className="w-6 h-6 text-blue-600" />;
      case "business":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-slate-600" />;
    }
  };

  const getPriceDisplay = () => {
    if (currentPlan === "free") return null;

    const price =
      planInterval === "year"
        ? planConfig.price.yearly
        : planConfig.price.monthly;

    return (
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-900">${price}</div>
        <div className="text-sm font-normal text-slate-600">
          per {planInterval}
        </div>
      </div>
    );
  };

  const getStatusBadge = () => {
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

  const getPrimaryAction = () => {
    if (currentPlan === "free") {
      return {
        label: "Upgrade Plan",
        href: "/pricing",
        icon: Crown,
        variant: "default" as const,
        className: "bg-blue-600 hover:bg-blue-700",
        isForm: false,
      };
    }

    return {
      label: "Manage Subscription",
      href: "#",
      icon: Settings,
      variant: "default" as const,
      className: "bg-slate-900 hover:bg-slate-800",
      isForm: true,
    };
  };

  const primaryAction = getPrimaryAction();
  const PrimaryIcon = primaryAction.icon;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
              {getPlanIcon()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 capitalize">
                {planConfig.name} Plan
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
              </div>
            </div>
          </div>
          {getPriceDisplay()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                    {subscriptionStatus === "canceled"
                      ? "Access Until"
                      : "Next Billing"}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {currentPeriodEnd.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                    {filtersCount} {currentPlan === "free" ? "/ 3" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Action */}
        <div className="flex gap-3">
          {primaryAction.isForm ? (
            <form action={createPortalSessionAction}>
              <Button
                type="submit"
                className={`h-11 ${primaryAction.className}`}
              >
                <PrimaryIcon className="w-4 h-4 mr-2" />
                {primaryAction.label}
              </Button>
            </form>
          ) : (
            <Button asChild className={`h-11 ${primaryAction.className}`}>
              <Link href={primaryAction.href}>
                <PrimaryIcon className="w-4 h-4 mr-2" />
                {primaryAction.label}
              </Link>
            </Button>
          )}
        </div>

        {/* Status Alerts */}
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
                  Your payment is overdue. Please update your payment method to
                  continue using premium features.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscriptionStatus === "canceled" && currentPeriodEnd && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-red-900 mb-1">
                  Subscription Canceled
                </div>
                <p className="text-red-800 text-sm">
                  Your subscription will end on{" "}
                  {currentPeriodEnd.toLocaleDateString()}. You can reactivate
                  anytime before then to continue using premium features.
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
                  Your trial ends on {currentPeriodEnd.toLocaleDateString()}.
                  Upgrade now to continue enjoying premium features.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
