"use client";

import { Button } from "@/components/ui/button";
import { Crown, Loader2, LogIn, Timer, Settings } from "lucide-react";
import {
  subscribeToAction,
  managePlanAction,
} from "@/lib/actions/subscription-actions";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

interface UpgradeButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan?: SubscriptionPlan;
  currentStatus?: string;
  isLoggedIn?: boolean;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
  hasUsedTrial?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function UpgradeButton({
  plan,
  interval,
  currentPlan = "free",
  isLoggedIn = false,
  isTrialActive = false,
  trialDaysRemaining = null,
  hasUsedTrial = false,
  className,
  size = "default",
  onError,
}: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const planConfig = getSubscriptionConfig(plan);
  const router = useRouter();

  const isCurrentPlan = currentPlan === plan;
  const isFirstTimeSubscription = currentPlan === "free" && plan !== "free";
  const hasExistingSubscription = currentPlan !== "free";

  const handleAction = () => {
    // If user is not logged in
    if (!isLoggedIn) {
      if (plan === "free") {
        router.push("/login");
        return;
      }
      // For paid plans, redirect to signup/login
      router.push("/login");
      return;
    }

    // If user is logged in and it's their current plan
    if (isCurrentPlan) {
      return;
    }

    startTransition(async () => {
      try {
        // If user is on free plan and wants to subscribe to a paid plan
        if (isFirstTimeSubscription) {
          await subscribeToAction(plan, interval);
          return;
        }

        // For all other cases (existing subscribers wanting to change plans)
        // redirect to Stripe portal for management
        if (hasExistingSubscription) {
          await managePlanAction();
          return;
        }

        // This should not happen, but fallback
        onError?.("Unable to process request. Please try again.");
      } catch (error) {
        console.error("Action failed:", error);
        onError?.(`Failed to ${getActionType()}. Please try again.`);
        router.refresh();
      }
    });
  };

  const getActionType = () => {
    if (isFirstTimeSubscription) return "subscribe";
    if (hasExistingSubscription) return "manage subscription";
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

    // If it's the current plan
    if (isCurrentPlan) {
      if (isTrialActive && trialDaysRemaining) {
        return `Trial (${trialDaysRemaining} days left)`;
      }
      return "Current Plan";
    }

    // If user is on free plan and selecting a paid plan (first time subscription)
    if (isFirstTimeSubscription) {
      // Show trial text if user is eligible for trial
      if (!hasUsedTrial) {
        return `Start ${planConfig.name} Trial`;
      }
      return `Get ${planConfig.name}`;
    }

    // If user has existing subscription and wants to change
    if (hasExistingSubscription) {
      if (plan === "free") {
        return "Cancel Subscription";
      }

      const planOrder = { free: 0, premium: 1, business: 2 };
      const isUpgrade = planOrder[plan] > planOrder[currentPlan];
      return `${isUpgrade ? "Upgrade" : "Switch"} to ${planConfig.name}`;
    }

    return `Get ${planConfig.name}`;
  };

  const getButtonIcon = () => {
    if (!isLoggedIn && plan !== "free") {
      return <LogIn className="w-4 h-4 mr-2" />;
    }

    if (isPending) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    }

    // Show timer icon for active trial
    if (isCurrentPlan && isTrialActive) {
      return <Timer className="w-4 h-4 mr-2" />;
    }

    // Show crown for first time subscriptions
    if (isFirstTimeSubscription) {
      return <Crown className="w-4 h-4 mr-2" />;
    }

    // Show settings icon for existing subscribers (they'll go to portal)
    if (hasExistingSubscription && !isCurrentPlan) {
      return <Settings className="w-4 h-4 mr-2" />;
    }

    if (!isCurrentPlan && plan !== "free") {
      return <Crown className="w-4 h-4 mr-2" />;
    }

    return null;
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) {
      return "outline";
    }

    // Highlight first time subscriptions
    if (isFirstTimeSubscription) {
      return "default";
    }

    return "default";
  };

  return (
    <Button
      onClick={handleAction}
      disabled={isPending || (isLoggedIn && isCurrentPlan)}
      size={size}
      className={className}
      variant={getButtonVariant()}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
