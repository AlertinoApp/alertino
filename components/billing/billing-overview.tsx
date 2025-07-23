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
  Settings,
  Clock,
  XCircle,
  Timer,
  Gift,
  CreditCard,
  Star,
} from "lucide-react";
import type { Subscription } from "@/types/subscription";
import { createPortalSessionAction } from "@/lib/actions/subscription-actions";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

interface BillingOverviewProps {
  subscription: Subscription | null;
  filtersCount: number;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
  isTrialActive?: boolean;
  userId?: string;
}

export function BillingOverview({
  subscription,
  filtersCount,
  trialDaysRemaining = null,
  hasUsedTrial = false,
  isTrialActive = false,
}: BillingOverviewProps) {
  const currentPlan = subscription?.plan || "free";
  const planConfig = getSubscriptionConfig(currentPlan);
  const planInterval = subscription?.interval || "month";
  const subscriptionStatus = subscription?.status || "inactive";
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;
  const canceledAt = subscription?.canceled_at
    ? new Date(subscription.canceled_at)
    : null;
  const trialEnd = subscription?.trial_end
    ? new Date(subscription.trial_end)
    : null;

  // Use the passed isTrialActive prop, but fallback to subscription status
  const effectivelyOnTrial = isTrialActive || subscriptionStatus === "trialing";

  // Determine if subscription is effectively active (including grace period and trial)
  const isEffectivelyActive = () => {
    if (subscriptionStatus === "active") return true;
    if (effectivelyOnTrial) return true;
    if (subscriptionStatus === "canceled" && currentPeriodEnd) {
      return new Date() < currentPeriodEnd; // Still in grace period
    }
    return false;
  };

  // Check if we have Stripe subscription data
  const hasStripeSubscription = Boolean(subscription?.stripe_subscription_id);

  // Check if user is on free plan and hasn't used trial
  const isFreeWithoutTrial =
    currentPlan === "free" && !hasUsedTrial && !effectivelyOnTrial;

  // Check if user is on free plan and has used trial
  const isFreeWithUsedTrial =
    currentPlan === "free" && hasUsedTrial && !effectivelyOnTrial;

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

    // Show different pricing for trial vs paid
    if (effectivelyOnTrial) {
      return (
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">Free</div>
          <div className="text-sm font-normal text-slate-600">Trial Period</div>
        </div>
      );
    }

    const price =
      planInterval === "year"
        ? planConfig.pricing.yearly
        : planConfig.pricing.monthly;

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
    // Handle trial status first
    if (effectivelyOnTrial) {
      return (
        <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-medium">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5" />
          Free Trial
        </Badge>
      );
    }

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
      case "past_due":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5" />
            Payment Required
          </Badge>
        );
      case "incomplete":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5" />
            Setup Required
          </Badge>
        );
      case "incomplete_expired":
        return (
          <Badge className="bg-red-50 text-yellow-700 border-yellow-200 font-medium">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5" />
            Setup Expired
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
            Unpaid
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
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
            Active
          </Badge>
        );
    }
  };

  const getBillingDateLabel = () => {
    if (effectivelyOnTrial) {
      return "Trial Ends";
    }
    if (cancelAtPeriodEnd && subscriptionStatus === "active") {
      return "Cancels On";
    }
    if (subscriptionStatus === "canceled" && isEffectivelyActive()) {
      return "Access Until";
    }
    if (currentPlan === "free") {
      return "Billing Status";
    }
    return "Next Billing";
  };

  const getBillingDate = () => {
    if (effectivelyOnTrial && trialEnd) {
      return trialEnd;
    }
    return currentPeriodEnd;
  };

  const billingDate = getBillingDate();

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
                {effectivelyOnTrial &&
                  trialDaysRemaining &&
                  trialDaysRemaining > 0 && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                      <Timer className="w-3 h-3 mr-1" />
                      {trialDaysRemaining} days left
                    </Badge>
                  )}
              </div>
            </div>
          </div>
          {getPriceDisplay()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                {effectivelyOnTrial ? (
                  <Timer className="w-4 h-4 text-blue-600" />
                ) : currentPlan === "free" ? (
                  <Calendar className="w-4 h-4 text-slate-400" />
                ) : (
                  <Calendar className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">
                  {getBillingDateLabel()}
                </div>
                <div className="text-slate-600 text-sm">
                  {billingDate
                    ? billingDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No billing required"}
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

        {/* Manage Subscription (Stripe Portal) */}
        {hasStripeSubscription && (
          <div className="border-t border-slate-200 pt-4">
            <form action={createPortalSessionAction}>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11 border-slate-300 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing & Payment Methods
              </Button>
            </form>
          </div>
        )}

        {/* Free Plan - No Trial Used */}
        {isFreeWithoutTrial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900 mb-1">
                  Free Trial Available
                </div>
                <p className="text-blue-800 text-sm">
                  Start your 14-day free trial to unlock unlimited filters,
                  advanced analytics, and priority support. No credit card
                  required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Free Plan - Trial Already Used */}
        {isFreeWithUsedTrial && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-purple-900 mb-1">
                  Upgrade to Premium
                </div>
                <p className="text-purple-800 text-sm">
                  You&apos;ve experienced our premium features during your
                  trial. Upgrade now to regain access to unlimited filters and
                  advanced features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {effectivelyOnTrial && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-orange-900 mb-1">
                  Free Trial Active
                </div>
                <p className="text-orange-800 text-sm">
                  {trialEnd && (
                    <>
                      Your trial ends on {trialEnd.toLocaleDateString()}.
                      {trialDaysRemaining && trialDaysRemaining > 0 && (
                        <>
                          {" "}
                          You have {trialDaysRemaining} days remaining to enjoy
                          premium features.
                        </>
                      )}
                      {trialDaysRemaining && trialDaysRemaining <= 3 && (
                        <>
                          {" "}
                          Upgrade now to continue enjoying premium features
                          without interruption.
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

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
                    {currentPeriodEnd.toLocaleDateString()}. You can reactivate
                    anytime before then by updating your subscription settings.
                  </p>
                  {canceledAt && (
                    <p className="text-orange-700 text-xs mt-1">
                      Canceled on {canceledAt.toLocaleDateString()}
                    </p>
                  )}
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
                    until {currentPeriodEnd.toLocaleDateString()}. You can
                    reactivate anytime before then to continue your
                    subscription.
                  </p>
                  {canceledAt && (
                    <p className="text-amber-700 text-xs mt-1">
                      Canceled on {canceledAt.toLocaleDateString()}
                    </p>
                  )}
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
                  Your subscription has ended and you&apos;ve been moved to the
                  free plan. You can upgrade anytime to restore premium
                  features.
                </p>
                {canceledAt && (
                  <p className="text-red-700 text-xs mt-1">
                    Canceled on {canceledAt.toLocaleDateString()}
                  </p>
                )}
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
                  Your payment is overdue. Please update your payment method to
                  continue using premium features.
                </p>
              </div>
            </div>
          </div>
        )}

        {(subscriptionStatus === "incomplete" ||
          subscriptionStatus === "incomplete_expired") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-yellow-900 mb-1">
                  {subscriptionStatus === "incomplete_expired"
                    ? "Setup Expired"
                    : "Setup Required"}
                </div>
                <p className="text-yellow-800 text-sm">
                  {subscriptionStatus === "incomplete_expired"
                    ? "Your subscription setup has expired. Please try again to activate your subscription."
                    : "Your subscription setup is incomplete. Please complete the payment process to activate your subscription."}
                </p>
              </div>
            </div>
          </div>
        )}

        {subscriptionStatus === "unpaid" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-red-900 mb-1">
                  Payment Failed
                </div>
                <p className="text-red-800 text-sm">
                  Multiple payment attempts have failed. Please update your
                  payment method immediately to restore access.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
