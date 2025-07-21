"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Crown,
  Settings,
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

interface SwitchPlanButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan: SubscriptionPlan;
  currentInterval: SubscriptionInterval;
  currentStatus?: string;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
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

  // Determine the type of change and button text
  const isPlanUpgrade = () => {
    const planOrder = { free: 0, premium: 1, business: 2 };
    return planOrder[plan] > planOrder[currentPlan];
  };

  const isPlanDowngrade = () => {
    const planOrder = { free: 0, premium: 1, business: 2 };
    return planOrder[plan] < planOrder[currentPlan];
  };

  const isIntervalChange = () => {
    return currentPlan === plan && currentInterval !== interval;
  };

  const isFreeDowngrade = () => {
    return plan === "free" && currentPlan !== "free";
  };

  const isFirstTimeSubscription = () => {
    return currentPlan === "free" && plan !== "free";
  };

  const getButtonText = () => {
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

    if (isPlanUpgrade()) {
      return `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    }

    if (isPlanDowngrade()) {
      return `Downgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    }

    return "Change Plan";
  };

  const getButtonIcon = () => {
    if (isFirstTimeSubscription()) {
      return <Crown className="w-4 h-4" />;
    }

    // For existing subscribers, show settings icon since they'll go to portal
    if (currentPlan !== "free" && !isCurrentConfiguration()) {
      return <Settings className="w-4 h-4" />;
    }

    if (isIntervalChange()) {
      return <RefreshCw className="w-4 h-4" />;
    }

    if (isPlanUpgrade()) {
      return <ArrowUpRight className="w-4 h-4" />;
    }

    if (isPlanDowngrade()) {
      return <ArrowDownRight className="w-4 h-4" />;
    }

    return <RefreshCw className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (isCurrentConfiguration()) {
      return "outline";
    }

    if (isFirstTimeSubscription()) {
      return "default";
    }

    return "outline";
  };

  return (
    <Button
      onClick={handleSwitch}
      disabled={isPending || isCurrentConfiguration()}
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
