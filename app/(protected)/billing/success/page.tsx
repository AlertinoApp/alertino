import { createClientForServer } from "@/app/utils/supabase/server";
import { getSubscriptionConfig } from "@/lib/stripe/plans";
import { getUserSubscription } from "@/lib/stripe/database";
import {
  StatusPageLayout,
  StatusPageAction,
} from "@/components/layout/status-page-layout";
import {
  ArrowRight,
  Crown,
  Building2,
  Zap,
  Gift,
  Settings,
} from "lucide-react";

export default async function BillingSuccessPage() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Must be authenticated to reach success page
  if (!session) {
    throw new Error("Authentication required");
  }

  let subscription = null;

  try {
    [subscription] = await Promise.all([getUserSubscription(session.user.id)]);
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }

  // Must have subscription after successful payment
  if (!subscription) {
    throw new Error("Subscription not found after payment");
  }

  const currentPlan = subscription.plan;
  const planConfig = getSubscriptionConfig(currentPlan);
  const subscriptionStatus = subscription.status;
  const isTrialActive = subscriptionStatus === "trialing";

  const getSuccessContext = () => {
    // Trial started
    if (isTrialActive) {
      return {
        type: "trial_started",
        title: `${planConfig.name} Trial Started!`,
        description: `Enjoy full access to ${planConfig.name} features for 14 days. No charges until your trial ends.`,
        icon: Gift,
        iconColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
      };
    }

    // Active subscription
    if (subscriptionStatus === "active") {
      const getPlanIcon = () => {
        switch (currentPlan) {
          case "basic":
            return Crown;
          case "pro":
            return Building2;
          default:
            return Zap;
        }
      };

      const getPlanColors = () => {
        switch (currentPlan) {
          case "basic":
            return {
              iconColor: "text-emerald-600 dark:text-emerald-400",
              bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
            };
          case "pro":
            return {
              iconColor: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-100 dark:bg-purple-900/30",
            };
          default:
            return {
              iconColor: "text-foreground",
              bgColor: "bg-muted",
            };
        }
      };

      const planIcon = getPlanIcon();
      const planColors = getPlanColors();

      return {
        type: "subscription_active",
        title: `Welcome to ${planConfig.name}!`,
        description: `Thank you! Your ${planConfig.name} subscription is active and you can now enjoy all premium features.`,
        icon: planIcon,
        iconColor: planColors.iconColor,
        bgColor: planColors.bgColor,
      };
    }

    // Invalid subscription state
    throw new Error("Invalid subscription state");
  };

  const context = getSuccessContext();

  // Configure primary action
  const primaryActions: StatusPageAction[] = [
    {
      href: "/dashboard",
      label: isTrialActive ? "Start Exploring" : "Go to Dashboard",
      icon: ArrowRight,
      className:
        "w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium h-12 rounded-lg shadow-sm",
    },
  ];

  // Configure secondary actions
  const secondaryActions: StatusPageAction[] = [
    {
      href: "/account-settings?tab=billing",
      label: "View Billing",
      icon: Settings,
      variant: "outline",
      className: "bg-card border-border hover:bg-muted font-medium",
    },
    isTrialActive
      ? {
          href: "/pricing",
          label: "View Plans",
          icon: Crown,
          variant: "outline",
          className: "bg-card border-border hover:bg-muted font-medium",
        }
      : {
          href: "/contact",
          label: "Get Support",
          variant: "outline",
          className: "bg-card border-border hover:bg-muted font-medium",
        },
  ];

  return (
    <StatusPageLayout
      title={context.title}
      description={context.description}
      icon={context.icon}
      iconColor={context.iconColor}
      iconBgColor={context.bgColor}
      contentClassName="p-8 text-center max-w-2xl mx-auto"
      primaryActions={primaryActions}
      secondaryActions={secondaryActions}
    />
  );
}
