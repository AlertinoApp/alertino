import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XCircle,
  ArrowLeft,
  Crown,
  HelpCircle,
  Timer,
  CheckCircle,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { createClientForServer } from "@/app/utils/supabase/server";
import { getSubscriptionConfig } from "@/lib/stripe/plans";
import { getUserSubscription } from "@/lib/stripe/database";
import { getUserTrialInfo } from "@/lib/stripe/subscription";

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
        icon: Timer,
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
  const ContextIcon = context.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full my-4">
        <CardHeader className="text-center pb-4">
          <div
            className={`w-20 h-20 mx-auto mb-6 ${context.bgColor} rounded-full flex items-center justify-center`}
          >
            <ContextIcon className={`w-10 h-10 ${context.iconColor}`} />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            {context.title}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {context.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trial Active Banner */}
          {isTrialActive && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Timer className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="font-semibold text-orange-900">
                    Your trial is still active!
                  </span>
                </div>
              </div>
              <p className="text-sm text-orange-800">
                You can continue enjoying {planConfig.name} features for your
                remaining trial period. Convert to a paid plan anytime to
                continue after your trial ends.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isTrialActive ? (
              <>
                <Button
                  asChild
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Link href="/billing">
                    <Crown className="w-4 h-4 mr-2" />
                    Convert Trial
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Trial
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/pricing">
                    <Crown className="w-4 h-4 mr-2" />
                    {hasUsedTrial ? "Upgrade Now" : "Try Premium Free"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/billing">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Billing
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Support Section */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              {context.type === "trial_conversion_cancelled"
                ? "Need help with your trial or have questions about converting?"
                : "Have questions about our plans or need assistance?"}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
