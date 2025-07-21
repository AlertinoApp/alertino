import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Crown,
  Building2,
  Zap,
  Gift,
  Timer,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { createClientForServer } from "@/app/utils/supabase/server";
import { getUserTrialInfo, getUserSubscription } from "@/lib/stripe/helpers";
import { getPlanConfig } from "@/lib/stripe/plans";

export default async function BillingSuccessPage() {
  // Get user data to provide personalized messaging
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let subscription = null;
  let previousTrialInfo = null;

  if (session) {
    try {
      [subscription, previousTrialInfo] = await Promise.all([
        getUserSubscription(session.user.id),
        getUserTrialInfo(session.user.id),
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const currentPlan = subscription?.plan || "free";
  const planConfig = getPlanConfig(currentPlan);
  const subscriptionStatus = subscription?.status || "active";
  const currentInterval = subscription?.interval;
  const hasUsedTrial = previousTrialInfo?.hasUsedTrial || false;

  // Determine the type of success based on subscription state
  const getSuccessContext = () => {
    if (!subscription) {
      return {
        type: "unknown",
        title: "Payment Successful!",
        subtitle: "Your subscription is now active.",
        description:
          "Thank you for your purchase. You can now enjoy all premium features.",
      };
    }

    // Check if this was a trial conversion
    if (hasUsedTrial && subscriptionStatus === "active") {
      return {
        type: "trial_conversion",
        title: `Welcome to ${planConfig.name}!`,
        subtitle: "Trial successfully converted to paid subscription",
        description: `Your ${planConfig.name} subscription is now active. Continue enjoying all the features you've been using during your trial.`,
      };
    }

    // Check if this is a new subscription with trial
    if (subscriptionStatus === "trialing") {
      return {
        type: "trial_started",
        title: `${planConfig.name} Trial Started!`,
        subtitle: "Your 14-day free trial is now active",
        description: `Enjoy full access to ${planConfig.name} features for 14 days. No charges until your trial ends.`,
      };
    }

    // Regular paid subscription
    if (subscriptionStatus === "active") {
      return {
        type: "subscription_active",
        title: `Welcome to ${planConfig.name}!`,
        subtitle: "Your subscription is now active",
        description: `Thank you! Your ${planConfig.name} subscription is active and you can now enjoy all premium features.`,
      };
    }

    // Fallback
    return {
      type: "generic",
      title: "Payment Successful!",
      subtitle: "Your subscription has been updated",
      description:
        "Thank you for your purchase. Your account has been updated successfully.",
    };
  };

  const context = getSuccessContext();

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "premium":
        return <Crown className="w-8 h-8 text-blue-600" />;
      case "business":
        return <Building2 className="w-8 h-8 text-purple-600" />;
      default:
        return <Zap className="w-8 h-8 text-slate-600" />;
    }
  };

  const getIconAndColor = () => {
    switch (context.type) {
      case "trial_started":
        return {
          icon: <Gift className="w-8 h-8 text-orange-600" />,
          bgColor: "bg-orange-100",
        };
      case "trial_conversion":
        return {
          icon: getPlanIcon(),
          bgColor: currentPlan === "premium" ? "bg-blue-100" : "bg-purple-100",
        };
      case "subscription_active":
        return {
          icon: getPlanIcon(),
          bgColor:
            currentPlan === "premium"
              ? "bg-blue-100"
              : currentPlan === "business"
                ? "bg-purple-100"
                : "bg-slate-100",
        };
      default:
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          bgColor: "bg-green-100",
        };
    }
  };

  const { icon, bgColor } = getIconAndColor();

  const getFeatureHighlights = () => {
    const features = planConfig.features.slice(0, 3); // Show top 3 features
    return features;
  };

  const getNextSteps = () => {
    switch (context.type) {
      case "trial_started":
        return [
          { text: "Explore all premium features", action: "dashboard" },
          { text: "Set up your preferences", action: "settings" },
          { text: "View trial details", action: "billing" },
        ];
      case "trial_conversion":
        return [
          { text: "Continue where you left off", action: "dashboard" },
          { text: "Manage your subscription", action: "billing" },
          { text: "Explore additional features", action: "features" },
        ];
      default:
        return [
          { text: "Start using premium features", action: "dashboard" },
          { text: "View billing details", action: "billing" },
          { text: "Contact support if needed", action: "support" },
        ];
    }
  };

  const nextSteps = getNextSteps();
  const features = getFeatureHighlights();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full shadow-sm border-0">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div
            className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            {icon}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {context.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-medium text-gray-700 mb-4">
            {context.subtitle}
          </p>

          {/* Status Badge */}
          {subscription && (
            <div className="flex justify-center mb-6">
              {subscriptionStatus === "trialing" ? (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-sm px-3 py-1">
                  <Timer className="w-4 h-4 mr-1" />
                  Free Trial Active
                </Badge>
              ) : subscriptionStatus === "active" ? (
                <Badge className="bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Subscription Active
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-sm px-3 py-1">
                  {subscriptionStatus.charAt(0).toUpperCase() +
                    subscriptionStatus.slice(1)}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {context.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Link href="/dashboard">
                {context.type === "trial_started"
                  ? "Start Exploring"
                  : "Go to Dashboard"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/billing">
                  <Settings className="w-4 h-4 mr-2" />
                  Billing
                </Link>
              </Button>

              {context.type === "trial_started" && (
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/pricing">
                    <Crown className="w-4 h-4 mr-2" />
                    Plans
                  </Link>
                </Button>
              )}

              {context.type !== "trial_started" && (
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/contact">Support</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Trial Specific Info */}
          {context.type === "trial_started" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <Timer className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    Trial Information
                  </p>
                  <p className="text-sm text-orange-800">
                    Your trial will automatically end in 14 days. You can
                    convert to a paid subscription anytime to continue using
                    premium features without interruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial Conversion Success */}
          {context.type === "trial_conversion" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Trial Converted Successfully
                  </p>
                  <p className="text-sm text-green-800">
                    All your trial data and settings have been preserved. You
                    can continue exactly where you left off with full access to
                    all features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
