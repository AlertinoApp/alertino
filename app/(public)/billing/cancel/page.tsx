import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getUserTrialInfo, getUserSubscription } from "@/lib/stripe/helpers";
import { getPlanConfig } from "@/lib/stripe/plans";

export default async function BillingCancelPage() {
  // Get user data to provide personalized messaging
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let trialInfo = null;
  let subscription = null;
  let isLoggedIn = false;

  if (session) {
    isLoggedIn = true;
    try {
      [trialInfo, subscription] = await Promise.all([
        getUserTrialInfo(session.user.id),
        getUserSubscription(session.user.id),
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const isTrialActive = trialInfo?.isActive || false;
  const trialDaysRemaining = trialInfo?.daysRemaining || null;
  const hasUsedTrial = trialInfo?.hasUsedTrial || false;
  const currentPlan = subscription?.plan || "free";

  // Determine the context of the cancellation
  const getPageContext = () => {
    if (isTrialActive) {
      return {
        type: "trial_conversion_cancelled",
        title: "Trial Conversion Cancelled",
        description: `Good news! Your ${getPlanConfig(currentPlan).name} trial is still active.`,
        icon: Timer,
        iconColor: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    } else if (!isLoggedIn) {
      return {
        type: "guest_checkout_cancelled",
        title: "Payment Cancelled",
        description:
          "No worries! You can try again anytime or continue exploring our features.",
        icon: XCircle,
        iconColor: "text-gray-600",
        bgColor: "bg-gray-100",
      };
    } else if (currentPlan === "free" && hasUsedTrial) {
      return {
        type: "upgrade_cancelled",
        title: "Upgrade Cancelled",
        description: "You can upgrade to a premium plan anytime you're ready.",
        icon: XCircle,
        iconColor: "text-gray-600",
        bgColor: "bg-gray-100",
      };
    } else if (currentPlan === "free" && !hasUsedTrial) {
      return {
        type: "trial_start_cancelled",
        title: "Trial Start Cancelled",
        description:
          "You're still eligible for a free trial! No credit card required.",
        icon: Gift,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    } else {
      return {
        type: "plan_change_cancelled",
        title: "Plan Change Cancelled",
        description: "Your current subscription remains unchanged.",
        icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
      };
    }
  };

  const context = getPageContext();
  const ContextIcon = context.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
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
                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                  {trialDaysRemaining !== null
                    ? `${trialDaysRemaining} days left`
                    : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-orange-800">
                You can continue enjoying {getPlanConfig(currentPlan).name}{" "}
                features
                {trialDaysRemaining !== null &&
                  trialDaysRemaining > 0 &&
                  ` for ${trialDaysRemaining} more days`}
                . Convert to a paid plan anytime to continue after your trial
                ends.
              </p>
            </div>
          )}

          {/* Benefits Reminder */}
          {(context.type === "trial_conversion_cancelled" ||
            context.type === "trial_start_cancelled" ||
            context.type === "upgrade_cancelled") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Crown className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">
                  {isTrialActive
                    ? "Already enjoying Premium?"
                    : "Still interested in Premium?"}
                </h3>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                {isTrialActive
                  ? "Convert your trial to continue enjoying premium features without interruption."
                  : hasUsedTrial
                    ? "Upgrade anytime to unlock all premium features."
                    : "Premium features are waiting for you. Start your free trial with no commitment required."}
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                {!hasUsedTrial && !isTrialActive && (
                  <li>• 14-day free trial</li>
                )}
                <li>• Cancel anytime</li>
                <li>• No setup fees</li>
                <li>• Immediate access to all features</li>
              </ul>
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
            ) : isLoggedIn ? (
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
            ) : (
              <>
                <Button
                  asChild
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/pricing">
                    <Crown className="w-4 h-4 mr-2" />
                    View Plans
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Plan Comparison CTA */}
          {isLoggedIn && currentPlan === "free" && !isTrialActive && (
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Want to compare all available plans?
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/pricing"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Compare Plans →
                </Link>
              </Button>
            </div>
          )}

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

          {/* Reassurance Message */}
          {context.type === "trial_conversion_cancelled" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-800 font-medium mb-1">
                    No worries about cancelling!
                  </p>
                  <p className="text-sm text-green-700">
                    Your trial data and settings are preserved. You can convert
                    to a paid plan anytime before your trial expires without
                    losing anything.
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
