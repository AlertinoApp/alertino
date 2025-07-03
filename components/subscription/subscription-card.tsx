import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Building2 } from "lucide-react";
import { UpgradeButton } from "./upgrade-button";
import { ManageButton } from "./manage-button";

interface SubscriptionCardProps {
  currentPlan: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  isPaid: boolean;
}

export function SubscriptionCard({
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
}: SubscriptionCardProps) {
  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Trial
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Past Due
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Inactive
          </Badge>
        );
    }
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "premium":
        return <Crown className="w-6 h-6 text-blue-600" />;
      case "business":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlanName = () => {
    switch (currentPlan) {
      case "premium":
        return "Premium";
      case "business":
        return "Business";
      default:
        return "Free";
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          {getPlanIcon()}
          Current Plan: {getPlanName()}
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPlan === "free" ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You&apos;re currently on the free plan. Upgrade to unlock more
              features and unlimited filters.
            </p>
            <UpgradeButton planId="premium" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">
                {subscriptionStatus}
              </span>
            </div>

            {currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {subscriptionStatus === "canceled"
                    ? "Access until:"
                    : "Next billing:"}
                </span>
                <span className="font-medium">
                  {new Date(currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <ManageButton />
              {currentPlan === "premium" && (
                <UpgradeButton planId="business" variant="business" />
              )}
            </div>
          </div>
        )}

        {subscriptionStatus === "past_due" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Payment Required:</strong> Your subscription payment is
              overdue. Please update your payment method to continue using
              premium features.
            </p>
          </div>
        )}

        {subscriptionStatus === "canceled" && currentPeriodEnd && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Subscription Canceled:</strong> Your subscription will end
              on {new Date(currentPeriodEnd).toLocaleDateString()}. You can
              reactivate anytime before then.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
