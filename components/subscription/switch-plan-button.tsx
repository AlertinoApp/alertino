"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Crown, Settings, XCircle } from "lucide-react";
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

interface SwitchPlanButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan: SubscriptionPlan;
  currentInterval: SubscriptionInterval;
  currentStatus?: string;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
  isCancelled?: boolean;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function SwitchPlanButton({
  plan,
  interval,
  currentPlan,
  currentInterval,
  isTrialActive = false,
  trialDaysRemaining = null,
  hasUsedTrial = false,
  isCancelled = false,
  className,
  onError,
}: SwitchPlanButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitch = () => {
    startTransition(async () => {
      try {
        // If user is on free plan and wants to subscribe
        if (currentPlan === "free" && plan !== "free") {
          await subscribeToAction(plan, interval);
          return;
        }

        // For all other cases (upgrades, downgrades, cancellations, trial management)
        // redirect to Stripe portal
        await managePlanAction();
      } catch (error) {
        console.error("Plan switch failed:", error);
        onError?.(`Failed to switch plan. Please try again.`);
        router.refresh();
      }
    });
  };

  // Determine if the button should be disabled
  const isCurrentConfiguration = () => {
    return currentPlan === plan && currentInterval === interval;
  };

  const isFirstTimeSubscription = () => {
    return currentPlan === "free" && plan !== "free";
  };

  const isIntervalChange = () => {
    return currentPlan === plan && currentInterval !== interval;
  };

  const isFreeDowngrade = () => {
    return plan === "free" && currentPlan !== "free";
  };

  const isPlanChange = () => {
    return currentPlan !== plan && plan !== "free";
  };

  const getButtonText = () => {
    // Handle cancelled subscription cases
    if (isCancelled) {
      if (isCurrentConfiguration()) {
        return "Cancelled - Expires at period end";
      }
      // If switching to a different plan/interval while cancelled
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

    // Normal active subscription cases
    if (isCurrentConfiguration()) {
      if (isTrialActive && trialDaysRemaining) {
        return `Current Trial (${trialDaysRemaining} days left)`;
      }
      return "Current Plan";
    }

    if (isFirstTimeSubscription()) {
      const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
      // Show trial text if user is eligible for trial
      if (!hasUsedTrial) {
        return `Start ${planName} Trial`;
      }
      return `Subscribe to ${planName}`;
    }

    // All other changes go through Stripe portal
    if (isFreeDowngrade()) {
      return "Cancel Subscription";
    }

    if (isIntervalChange()) {
      return interval === "year" ? "Switch to Yearly" : "Switch to Monthly";
    }

    if (isPlanChange()) {
      return `Switch to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    }

    return "Change Plan";
  };

  const getButtonIcon = () => {
    // Show cancelled icon for cancelled current plan
    if (isCancelled && isCurrentConfiguration()) {
      return <XCircle className="w-4 h-4" />;
    }

    if (isFirstTimeSubscription()) {
      return <Crown className="w-4 h-4" />;
    }

    // For existing subscribers, show settings icon since they'll go to portal
    if (currentPlan !== "free" && !isCurrentConfiguration()) {
      return <Settings className="w-4 h-4" />;
    }

    return <RefreshCw className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (isCurrentConfiguration()) {
      if (isCancelled) {
        return "destructive";
      }
      return "outline";
    }

    if (isFirstTimeSubscription()) {
      return "default";
    }

    return "outline";
  };

  const isButtonDisabled = () => {
    // Disable if pending
    if (isPending) return true;

    // Disable if it's the current configuration and not cancelled
    if (isCurrentConfiguration() && !isCancelled) return true;

    return false;
  };

  return (
    <Button
      onClick={handleSwitch}
      disabled={isButtonDisabled()}
      className={className}
      variant={getButtonVariant()}
    >
      {isPending ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        getButtonIcon()
      )}
      {getButtonText()}
    </Button>
  );
}
