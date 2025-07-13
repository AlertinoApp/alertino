"use client";

import { Button } from "@/components/ui/button";
import { Crown, Loader2, LogIn } from "lucide-react";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from "@/lib/actions/subscription-actions";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";
import { useTransition } from "react";
import { getPlanConfig } from "@/lib/stripe/plans";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentPlan?: SubscriptionPlan;
  isLoggedIn?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function UpgradeButton({
  plan,
  interval,
  currentPlan = "free",
  isLoggedIn = false,
  className,
  size = "default",
}: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const planConfig = getPlanConfig(plan);
  const router = useRouter();

  const isCurrentPlan = currentPlan === plan;
  const isDowngrade =
    (currentPlan === "business" && (plan === "premium" || plan === "free")) ||
    (currentPlan === "premium" && plan === "free");

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

    // Handle free plan - downgrade functionality
    if (plan === "free") {
      startTransition(async () => {
        await createPortalSessionAction();
      });
      return;
    }

    // Handle paid plans
    startTransition(async () => {
      const priceId =
        interval === "month"
          ? planConfig.stripePriceIds.monthly
          : planConfig.stripePriceIds.yearly;

      await createCheckoutSessionAction(priceId);
    });
  };

  const getButtonText = () => {
    // If user is not logged in
    if (!isLoggedIn) {
      if (plan === "free") {
        return "Get Started Free";
      }
      return `Start ${planConfig.name} Trial`;
    }

    // If it's the current plan
    if (isCurrentPlan) {
      return "Current Plan";
    }

    // If user is logged in and selecting free plan from a paid plan
    if (plan === "free" && currentPlan !== "free") {
      return "Downgrade to Free";
    }

    // If user is on free plan and selecting a paid plan
    if (currentPlan === "free" && plan !== "free") {
      return `Upgrade to ${planConfig.name}`;
    }

    // For other cases (paid plan to paid plan)
    return `${isDowngrade ? "Downgrade" : "Upgrade"} to ${planConfig.name}`;
  };

  const getButtonIcon = () => {
    if (!isLoggedIn && plan !== "free") {
      return <LogIn className="w-4 h-4 mr-2" />;
    }

    if (isPending) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    }

    if (!isCurrentPlan && plan !== "free") {
      return <Crown className="w-4 h-4 mr-2" />;
    }

    return null;
  };

  return (
    <Button
      onClick={handleAction}
      disabled={isPending || (isLoggedIn && isCurrentPlan)}
      size={size}
      className={className}
      variant={
        isCurrentPlan ? "outline" : plan === "free" ? "outline" : "default"
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
