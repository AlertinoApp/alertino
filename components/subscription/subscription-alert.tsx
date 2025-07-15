"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface AlertMessage {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
}

export function SubscriptionAlerts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const warning = searchParams.get("warning");

    if (success) {
      setAlert({
        type: "success",
        title: getSuccessTitle(success),
        message: getSuccessMessage(success),
      });
    } else if (error) {
      setAlert({
        type: "error",
        title: getErrorTitle(error),
        message: getErrorMessage(error),
      });
    } else if (warning) {
      setAlert({
        type: "warning",
        title: getWarningTitle(warning),
        message: getWarningMessage(warning),
      });
    }
  }, [searchParams]);

  const getSuccessTitle = (type: string): string => {
    switch (type) {
      case "true":
        return "Subscription Activated";
      case "downgrade_scheduled":
        return "Downgrade Scheduled";
      case "downgraded_to_free":
        return "Downgraded to Free";
      case "subscription_updated":
        return "Subscription Updated";
      case "subscription_cancelled":
        return "Subscription Cancelled";
      default:
        return "Success";
    }
  };

  const getSuccessMessage = (type: string): string => {
    switch (type) {
      case "true":
        return "Your subscription has been activated successfully!";
      case "downgrade_scheduled":
        return "Your subscription will be downgraded to free at the end of your current billing period.";
      case "downgraded_to_free":
        return "Your subscription has been downgraded to the free plan.";
      case "subscription_updated":
        return "Your subscription has been updated successfully.";
      case "subscription_cancelled":
        return "You'll continue to have access until the end of your billing period.";
      default:
        return "Operation completed successfully.";
    }
  };

  const getErrorTitle = (type: string): string => {
    switch (type) {
      case "already_subscribed":
        return "Already Subscribed";
      case "no_subscription":
        return "No Subscription Found";
      case "downgrade_failed":
        return "Downgrade Failed";
      case "checkout_failed":
        return "Payment Failed";
      case "invalid_plan":
        return "Invalid Plan";
      case "stripe_error":
        return "Payment Error";
      default:
        return "Error";
    }
  };

  const getErrorMessage = (type: string): string => {
    switch (type) {
      case "already_subscribed":
        return "You already have an active subscription. Please manage your subscription through the billing portal.";
      case "no_subscription":
        return "No subscription found. Please select a plan to get started.";
      case "downgrade_failed":
        return "Failed to downgrade your subscription. Please try again or contact support.";
      case "checkout_failed":
        return "Payment processing failed. Please try again.";
      case "invalid_plan":
        return "Invalid subscription plan selected.";
      case "stripe_error":
        return "A payment processing error occurred. Please try again.";
      default:
        return "An error occurred. Please try again or contact support.";
    }
  };

  const getWarningTitle = (type: string): string => {
    switch (type) {
      case "subscription_ending":
        return "Subscription Ending Soon";
      case "payment_failed":
        return "Payment Failed";
      case "trial_ending":
        return "Trial Ending Soon";
      default:
        return "Notice";
    }
  };

  const getWarningMessage = (type: string): string => {
    switch (type) {
      case "subscription_ending":
        return "Your subscription will end soon. Renew to continue enjoying premium features.";
      case "payment_failed":
        return "Your last payment failed. Please update your payment method to avoid service interruption.";
      case "trial_ending":
        return "Your trial period is ending soon. Upgrade to continue using premium features.";
      default:
        return "Please note the following information about your subscription.";
    }
  };

  const dismissAlert = () => {
    setAlert(null);
    // Clean up URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("error");
    url.searchParams.delete("warning");
    router.replace(url.pathname + (url.search ? `?${url.searchParams}` : ""));
  };

  const getAlertIcon = () => {
    switch (alert?.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />;
      case "warning":
        return (
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
        );
      default:
        return null;
    }
  };

  const getAlertStyles = () => {
    switch (alert?.type) {
      case "success":
        return "from-green-50 to-emerald-50 border-green-200";
      case "error":
        return "from-red-50 to-rose-50 border-red-200";
      case "warning":
        return "from-yellow-50 to-amber-50 border-yellow-200";
      default:
        return "";
    }
  };

  const getTitleColor = () => {
    switch (alert?.type) {
      case "success":
        return "text-green-900";
      case "error":
        return "text-red-900";
      case "warning":
        return "text-yellow-900";
      default:
        return "";
    }
  };

  const getTextColor = () => {
    switch (alert?.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      default:
        return "";
    }
  };

  const getIconBgColor = () => {
    switch (alert?.type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  };

  if (!alert) return null;

  return (
    <Card className={`bg-gradient-to-r ${getAlertStyles()} shadow-sm mb-6`}>
      <CardContent className="p-4 sm:p-6 relative">
        {/* Close Button - Upper Right on mobile only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissAlert}
          className={`${getTextColor()} hover:bg-white/50 absolute top-2 right-2 z-10 sm:hidden`}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          {/* Main Content */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {getAlertIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${getTitleColor()} mb-1`}>
                {alert.title}
              </h3>
              <p className={`${getTextColor()} text-sm leading-relaxed`}>
                {alert.message}
              </p>
            </div>
          </div>

          {/* Inline Close Button for desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissAlert}
            className={`${getTextColor()} hover:bg-white/50 flex-shrink-0 ml-4`}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden pr-8">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 ${getIconBgColor()} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {getAlertIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${getTitleColor()} mb-1 text-sm`}>
                {alert.title}
              </h3>
              <p className={`${getTextColor()} text-xs leading-relaxed`}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
