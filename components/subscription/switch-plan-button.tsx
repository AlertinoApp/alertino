"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, RefreshCw, X } from "lucide-react";
import { useTransition } from "react";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { switchSubscriptionPlanAction } from "@/lib/actions/subscription-actions";

interface SwitchPlanButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan: SubscriptionPlan;
  currentInterval: SubscriptionInterval;
  className?: string;
}

export function SwitchPlanButton({
  plan,
  interval,
  currentPlan,
  currentInterval,
  className,
}: SwitchPlanButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitch = () => {
    startTransition(async () => {
      await switchSubscriptionPlanAction(plan, interval);
    });
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

  const getButtonText = () => {
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
    return "Switch Plan";
  };

  const getButtonIcon = () => {
    if (isFreeDowngrade()) {
      return <X className="w-4 h-4" />;
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
    if (isFreeDowngrade()) {
      return "outline";
    }
    if (isPlanUpgrade()) {
      return "default";
    }
    return "outline";
  };

  return (
    <Button
      onClick={handleSwitch}
      disabled={isPending}
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
