"use client";

import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Crown,
  Settings,
  XCircle,
  LogIn,
  Loader2,
} from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import {
  subscribeToAction,
  managePlanAction,
} from "@/lib/actions/subscription-actions";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

interface PlanButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan?: SubscriptionPlan;
  currentInterval?: SubscriptionInterval;
  currentStatus?: string;
  isLoggedIn?: boolean;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
  isCancelled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function PlanButton({
  plan,
  interval,
  currentPlan = "free",
  currentInterval = "month",
  currentStatus = "active",
  isLoggedIn = false,
  isTrialActive = false,
  trialDaysRemaining = null,
  hasUsedTrial = false,
  isCancelled = false,
  className,
  size = "default",
  onError,
}: PlanButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const planConfig = getSubscriptionConfig(plan);

  // Helper functions for state detection
  const isCurrentConfiguration = () => {
    // For free plan, ignore interval since free doesn't have intervals
    if (plan === "free" && currentPlan === "free") {
      return true;
    }
    return currentPlan === plan && currentInterval === interval;
  };

  const isFirstTimeSubscription = () => {
    return currentPlan === "free" && plan !== "free";
  };

  const isIntervalChange = () => {
    // Free plan doesn't have intervals, so no interval changes possible
    if (plan === "free" || currentPlan === "free") {
      return false;
    }
    return currentPlan === plan && currentInterval !== interval;
  };

  const isFreeDowngrade = () => {
    return plan === "free" && currentPlan !== "free" && !isCancelled;
  };

  const isPlanChange = () => {
    return currentPlan !== plan && plan !== "free";
  };

  const hasExistingSubscription = () => {
    return currentPlan !== "free";
  };

  const handleAction = () => {
    // If user is not logged in
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // If it's the current configuration and not cancelled, do nothing
    if (isCurrentConfiguration() && !isCancelled) {
      return;
    }

    startTransition(async () => {
      try {
        // If user is on free plan and wants to subscribe to a paid plan
        if (isFirstTimeSubscription()) {
          await subscribeToAction(plan, interval);
          return;
        }

        // For all other cases (upgrades, downgrades, cancellations, trial management)
        // redirect to Stripe portal
        await managePlanAction();
      } catch (error) {
        console.error("Plan action failed:", error);
        onError?.(`Failed to ${getActionType()}. Please try again.`);
        router.refresh();
      }
    });
  };

  const getActionType = () => {
    if (isFirstTimeSubscription()) return "subscribe";
    if (hasExistingSubscription()) return "manage subscription";
    return "get started";
  };

  const getButtonText = () => {
    // If user is not logged in
    if (!isLoggedIn) {
      if (plan === "free") {
        return "Get Started Free";
      }
      return `Try ${planConfig.name} Free`;
    }

    // Handle cancelled subscription cases
    if (isCancelled) {
      if (isCurrentConfiguration()) {
        return "Cancelled - Expires at period end";
      }

      if (isFirstTimeSubscription()) {
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
        return !hasUsedTrial
          ? `Start ${planName} Trial`
          : `Subscribe to ${planName}`;
      }

      if (isPlanChange()) {
        return `Switch to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
      }

      if (isIntervalChange()) {
        return interval === "year" ? "Switch to Yearly" : "Switch to Monthly";
      }

      return "Reactivate Plan";
    }

    // If it's the current configuration
    if (isCurrentConfiguration()) {
      if (isTrialActive && trialDaysRemaining) {
        return `Trial (${trialDaysRemaining} days left)`;
      }
      return "Current Plan";
    }

    // If user is on free plan and selecting a paid plan (first time subscription)
    if (isFirstTimeSubscription()) {
      // Show trial text if user is eligible for trial
      if (!hasUsedTrial) {
        return `Start ${planConfig.name} Trial`;
      }
      return `Get ${planConfig.name}`;
    }

    // For existing subscribers wanting to change plans
    if (isFreeDowngrade()) {
      return "Cancel Subscription";
    }

    if (isIntervalChange()) {
      return interval === "year" ? "Switch to Yearly" : "Switch to Monthly";
    }

    if (isPlanChange()) {
      const planOrder = { free: 0, basic: 1, pro: 2 };
      const isUpgrade = planOrder[plan] > planOrder[currentPlan];
      return `${isUpgrade ? "Upgrade" : "Switch"} to ${planConfig.name}`;
    }

    return `Change to ${planConfig.name}`;
  };

  const getButtonIcon = () => {
    if (isPending) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    // Don't display any icon on current plan
    if (isCurrentConfiguration()) {
      return null;
    }

    // Special case for free plan downgrades or reactivations
    if (plan === "free" && currentPlan !== "free") {
      if (isCancelled) {
        return <Settings className="w-4 h-4" />; // Reactivate
      } else {
        return <XCircle className="w-4 h-4" />; // Cancel Subscription
      }
    }

    // Show login icon for non-logged in users on paid plans
    if (!isLoggedIn && plan !== "free") {
      return <LogIn className="w-4 h-4" />;
    }

    // Show RefreshCw for interval changes
    if (isIntervalChange()) {
      return <RefreshCw className="w-4 h-4" />;
    }

    // Show settings icon for switching between paid plans
    if (isPlanChange()) {
      return <Settings className="w-4 h-4" />;
    }

    // Show crown for first time subscriptions
    if (isFirstTimeSubscription()) {
      return <Crown className="w-4 h-4" />;
    }

    return null;
  };

  const getButtonVariant = () => {
    // Current plan styling
    if (isCurrentConfiguration()) {
      return "outline";
    }

    // Always use outline for free plan
    if (plan === "free") {
      return "outline";
    }

    // Cancel subscription should be destructive on hover
    if (isFreeDowngrade()) {
      return "outline";
    }

    // Highlight first time subscriptions and trial states
    if (
      isFirstTimeSubscription() ||
      (isTrialActive && !isCurrentConfiguration())
    ) {
      return "default";
    }

    return "outline";
  };

  const isButtonDisabled = () => {
    if (isPending) return true;
    // Current plan is disabled (but not cancelled plans), except for free plan when not logged in
    if (isCurrentConfiguration()) {
      // Allow free plan button to be active when user is not logged in
      if (plan === "free" && !isLoggedIn) {
        return false;
      }
      return true;
    }
    return false;
  };

  const getConsistentStyling = () => {
    // Current free plan styling when logged in - disabled and outline (not green)
    if (isCurrentConfiguration() && plan === "free" && isLoggedIn) {
      return "cursor-default";
    }

    // Free plan when not logged in - should be active/clickable
    if (plan === "free" && !isLoggedIn) {
      return "";
    }

    // Current paid plan styling - disabled and green
    if (
      isCurrentConfiguration() &&
      plan !== "free" &&
      currentStatus === "active"
    ) {
      return "bg-green-100 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-700 cursor-default";
    }

    // Cancel subscription hover destructive
    if (isFreeDowngrade()) {
      return "hover:bg-red-50 hover:border-red-300 hover:text-red-700";
    }

    // Free plan - always outlined, no special styling for not logged in users
    if (plan === "free") {
      return "";
    }

    // Basic plan - blue with white text
    if (plan === "basic") {
      return "bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 hover:border-blue-700";
    }

    // Pro plan - dark slate with white text
    if (plan === "pro") {
      return "bg-slate-900 hover:bg-slate-800 text-white hover:text-white border-slate-800 hover:border-slate-900";
    }

    return "";
  };

  // Trial styling override
  const getTrialStyling = () => {
    if (isTrialActive && isCurrentConfiguration()) {
      return "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white hover:text-white cursor-default";
    }
    return "";
  };

  const trialStyling = getTrialStyling();
  const consistentStyling = getConsistentStyling();

  // Use trial styling if present, otherwise use consistent styling
  const finalStyling = trialStyling || consistentStyling;
  const combinedClassName = `${className || ""} ${finalStyling}`.trim();

  return (
    <Button
      onClick={handleAction}
      disabled={isButtonDisabled()}
      size={size}
      className={combinedClassName}
      variant={getButtonVariant()}
    >
      {getButtonIcon()}
      {getButtonIcon() && <span className="ml-2">{getButtonText()}</span>}
      {!getButtonIcon() && <span>{getButtonText()}</span>}
    </Button>
  );
}
