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
    const type = searchParams.get("type");

    if (success) {
      setAlert({
        type: "success",
        title: getSuccessTitle(success, type),
        message: getSuccessMessage(success, type),
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

  const getSuccessTitle = (success: string, type?: string | null): string => {
    if (type) {
      switch (type) {
        case "trial_started":
          return "Trial Started";
        case "subscription_created":
          return "Subscription Activated";
        case "plan_changed":
          return "Plan Updated";
        default:
          return "Success";
      }
    }

    switch (success) {
      case "true":
        return "Subscription Activated";
      default:
        return "Success";
    }
  };

  const getSuccessMessage = (success: string, type?: string | null): string => {
    if (type) {
      switch (type) {
        case "trial_started":
          return "Your free trial has started! You now have access to premium features for 14 days.";
        case "subscription_created":
          return "Your subscription has been activated successfully! Welcome to premium features.";
        case "plan_changed":
          return "Your subscription has been updated successfully in Stripe.";
        default:
          return "Operation completed successfully.";
      }
    }

    switch (success) {
      case "true":
        return "Your subscription has been activated successfully!";
      default:
        return "Operation completed successfully.";
    }
  };

  const getErrorTitle = (type: string): string => {
    switch (type) {
      case "already_subscribed":
        return "Already Subscribed";
      case "invalid_plan":
        return "Invalid Plan";
      case "no_subscription":
        return "No Subscription Found";
      case "no_stripe_history":
        return "No Billing History";
      case "portal_session_failed":
        return "Portal Access Failed";
      case "checkout_failed":
        return "Payment Failed";
      case "stripe_error":
        return "Payment Error";
      default:
        return "Error";
    }
  };

  const getErrorMessage = (type: string): string => {
    switch (type) {
      case "already_subscribed":
        return "You already have an active subscription. Use the manage subscription button to make changes.";
      case "invalid_plan":
        return "Invalid subscription plan selected. Please choose a valid plan.";
      case "no_subscription":
        return "No subscription found. Please select a plan to get started.";
      case "no_stripe_history":
        return "No billing history found. Please subscribe to a plan first to access subscription management.";
      case "portal_session_failed":
        return "Unable to access subscription management. Please try again or contact support.";
      case "checkout_failed":
        return "Payment processing failed. Please check your payment method and try again.";
      case "stripe_error":
        return "A payment processing error occurred. Please try again or use a different payment method.";
      default:
        return "An error occurred. Please try again or contact support if the problem persists.";
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
      case "trial_active":
        return "Trial Active";
      case "past_due":
        return "Payment Overdue";
      default:
        return "Notice";
    }
  };

  const getWarningMessage = (type: string): string => {
    switch (type) {
      case "subscription_ending":
        return "Your subscription will end soon. Use the manage subscription button to reactivate.";
      case "payment_failed":
        return "Your last payment failed. Please update your payment method to avoid service interruption.";
      case "trial_ending":
        return "Your trial period is ending soon. Subscribe to continue using premium features.";
      case "trial_active":
        return "You're currently on a trial. Manage your subscription through Stripe when ready to upgrade.";
      case "past_due":
        return "Your subscription payment is overdue. Please update your payment method immediately.";
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
    url.searchParams.delete("reason");
    url.searchParams.delete("type");
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
