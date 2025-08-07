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
        iconColor: "text-orange-600",
        bgColor: "bg-orange-100",
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
              iconColor: "text-blue-600",
              bgColor: "bg-blue-100",
            };
          case "pro":
            return {
              iconColor: "text-purple-600",
              bgColor: "bg-purple-100",
            };
          default:
            return {
              iconColor: "text-slate-600",
              bgColor: "bg-slate-100",
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
        "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-lg shadow-sm",
    },
  ];

  // Configure secondary actions
  const secondaryActions: StatusPageAction[] = [
    {
      href: "/account-settings?tab=billing",
      label: "View Billing",
      icon: Settings,
      variant: "outline",
      className: "bg-white border-slate-200 hover:bg-slate-50 font-medium",
    },
    isTrialActive
      ? {
          href: "/pricing",
          label: "View Plans",
          icon: Crown,
          variant: "outline",
          className: "bg-white border-slate-200 hover:bg-slate-50 font-medium",
        }
      : {
          href: "/contact",
          label: "Get Support",
          variant: "outline",
          className: "bg-white border-slate-200 hover:bg-slate-50 font-medium",
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
