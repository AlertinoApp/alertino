import { createClientForServer } from "@/app/utils/supabase/server";
import { getSubscriptionConfig } from "@/lib/stripe/plans";
import { getUserSubscription } from "@/lib/stripe/database";
import { getUserTrialInfo } from "@/lib/stripe/subscription";
import {
  StatusPageLayout,
  StatusPageAction,
} from "@/components/layout/status-page-layout";
import {
  XCircle,
  ArrowLeft,
  Crown,
  HelpCircle,
  CheckCircle,
  Gift,
} from "lucide-react";

export default async function BillingCancelPage() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Must be authenticated to reach cancel page
  if (!session) {
    throw new Error("Not authenticated");
  }

  let subscription = null;
  let previousTrialInfo = null;

  try {
    [subscription, previousTrialInfo] = await Promise.all([
      getUserSubscription(session.user.id),
      getUserTrialInfo(session.user.id),
    ]);
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }

  const currentPlan = subscription?.plan || "free";
  const planConfig = getSubscriptionConfig(currentPlan);
  const subscriptionStatus = subscription?.status || "active";
  const hasUsedTrial = previousTrialInfo?.hasUsedTrial || false;
  const isTrialActive = subscriptionStatus === "trialing";

  const getPageContext = () => {
    // Trial conversion cancelled
    if (isTrialActive) {
      return {
        type: "trial_conversion_cancelled",
        title: "Trial Conversion Cancelled",
        description: `Good news! Your ${planConfig.name} trial is still active.`,
        icon: CheckCircle,
        iconColor: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    }

    // Active subscription - plan change cancelled
    if (subscription && subscriptionStatus === "active") {
      return {
        type: "plan_change_cancelled",
        title: "Plan Change Cancelled",
        description: `Your current ${planConfig.name} subscription remains unchanged.`,
        icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
      };
    }

    // Free plan - upgrade cancelled
    if (!subscription || currentPlan === "free") {
      if (hasUsedTrial) {
        return {
          type: "upgrade_cancelled",
          title: "Upgrade Cancelled",
          description:
            "You can upgrade to a premium plan anytime you're ready.",
          icon: XCircle,
          iconColor: "text-gray-600",
          bgColor: "bg-gray-100",
        };
      } else {
        return {
          type: "trial_start_cancelled",
          title: "Trial Start Cancelled",
          description: "You're still eligible for a free trial!",
          icon: Gift,
          iconColor: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      }
    }

    // Unexpected state - throw error
    throw new Error("Invalid billing state");
  };

  const context = getPageContext();

  // Configure primary actions
  const primaryActions: StatusPageAction[] = isTrialActive
    ? [
        {
          href: "/account-settings?tab=billing",
          label: "Convert Trial",
          icon: Crown,
          className:
            "flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium h-12 rounded-lg shadow-sm",
        },
        {
          href: "/dashboard",
          label: "Continue Trial",
          icon: ArrowLeft,
          variant: "outline",
          className:
            "flex-1 bg-white border-slate-200 hover:bg-slate-50 font-medium h-12 rounded-lg",
        },
      ]
    : [
        {
          href: "/pricing",
          label: hasUsedTrial ? "Upgrade Now" : "Try Basic Free",
          icon: Crown,
          className:
            "flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-lg shadow-sm",
        },
        {
          href: "/account-settings?tab=billing",
          label: "Back to Billing",
          icon: ArrowLeft,
          variant: "outline",
          className:
            "flex-1 bg-white border-slate-200 hover:bg-slate-50 font-medium h-12 rounded-lg",
        },
      ];

  // Configure support
  const supportText =
    context.type === "trial_conversion_cancelled"
      ? "Need help with your trial or have questions about converting?"
      : "Have questions about our plans or need assistance?";

  const supportAction: StatusPageAction = {
    href: "/contact",
    label: "Contact Support",
    icon: HelpCircle,
    variant: "ghost",
    className: "text-blue-600 hover:text-blue-700 font-medium",
  };

  return (
    <StatusPageLayout
      title={context.title}
      description={context.description}
      icon={context.icon}
      iconColor={context.iconColor}
      iconBgColor={context.bgColor}
      backgroundGradient="from-gray-50 via-white to-gray-50"
      contentClassName="p-8 text-center max-w-2xl mx-auto"
      primaryActions={primaryActions}
      supportText={supportText}
      supportAction={supportAction}
    />
  );
}
