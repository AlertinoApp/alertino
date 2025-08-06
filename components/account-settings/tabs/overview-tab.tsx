"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Clock, Filter, Bell } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Subscription, TrialInfo } from "@/types/subscription";
import type { Profile } from "@/types/users";
import { subscribeToAction } from "@/lib/actions/subscription-actions";
import { toast } from "sonner";

interface OverviewTabProps {
  user: SupabaseUser;
  profile: Profile | null;
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
  filtersCount: number;
  alertsCount: number;
}

export function OverviewTab({ subscription, trialInfo }: OverviewTabProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = subscription?.plan || "free";
  const isTrialActive = trialInfo?.isActive || false;
  const trialDaysRemaining = trialInfo?.daysRemaining || 0;

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic";
      case "pro":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "free":
        return "3 active filters, 10 searches per day, email notifications.";
      case "basic":
        return "10 active filters, 50 searches per day, email + SMS notifications.";
      case "pro":
        return "Unlimited filters, 200 searches per day, scraping every 1 hour, and access to advanced features.";
      default:
        return "";
    }
  };

  const handleStartBasicNow = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Starting Basic plan...", {
      description: "Redirecting to checkout.",
    });

    try {
      await subscribeToAction("basic", "month");
      toast.dismiss(loadingToast);
      setIsUpgradeModalOpen(false);
    } catch (error) {
      console.error("Failed to start Basic plan:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to start Basic plan", {
        description: "Please try again shortly.",
      });
      setIsLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Upgrading to Pro...", {
      description: "Redirecting to checkout.",
    });

    try {
      await subscribeToAction("pro", "month");
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Failed to upgrade to Pro:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to upgrade to Pro", {
        description: "Please try again shortly.",
      });
      setIsLoading(false);
    }
  };

  const renderPlanCards = () => {
    if (currentPlan === "free") {
      // Show 3 cards for free plan users
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Plan Card */}
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 justify-between h-full">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium">Free Plan</div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-600">
                      {getPlanDescription("free")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Plan Card */}
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">Basic</div>
                  <div className="text-sm text-slate-600">
                    {getPlanDescription("basic")}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-fit !py-1 rounded-md !px-2 !text-sm !text-white !bg-gray-900 hover:!bg-gray-800 disabled:opacity-50 mt-4"
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  Start 14-day trial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">Pro</div>
                  <div className="text-sm text-slate-600">
                    {getPlanDescription("pro")}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-fit !py-1 rounded-md !px-2 !text-sm !text-white !bg-gray-900 hover:!bg-gray-800 disabled:opacity-50 mt-4"
                  onClick={handleUpgradeToPro}
                  disabled={isLoading}
                >
                  {isLoading ? "Redirecting..." : "Upgrade to Pro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      // Show 2 cards for basic/pro plan users
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium">
                      {isTrialActive
                        ? `${getPlanName(currentPlan)} Trial`
                        : getPlanName(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <Badge variant="secondary" className="text-xs">
                        {trialDaysRemaining} Days Left
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {getPlanDescription(currentPlan)}
                    </div>
                    {isTrialActive && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Your subscription will start on{" "}
                        {new Date(
                          Date.now() + trialDaysRemaining * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                        .
                      </div>
                    )}
                  </div>
                </div>

                {/* Button section - always at bottom */}
                {isTrialActive && currentPlan === "basic" && (
                  <div className="pt-4">
                    <Button
                      className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                      onClick={() => setIsUpgradeModalOpen(true)}
                    >
                      Start Basic Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-0 shadow-sm h-full py-0">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col h-full">
                {/* Content section - takes available space */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-base font-medium dark:text-gray-100">
                    Pro
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getPlanDescription("pro")}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-fit py-1 rounded-md px-2 text-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    onClick={handleUpgradeToPro}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting..." : "Upgrade to Pro"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Cards Grid */}
      {renderPlanCards()}

      {/* Invite Team Section */}
      <Card className="border-0 shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Invite Team Members</h2>
          <p className="max-w-md text-slate-500 text-sm">
            Accelerate your team with admin controls, analytics, and
            enterprise-grade security
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs transition duration-150 ease hover:bg-white/[0.04] mx-auto"
        >
          <Users className="w-4 h-4 mr-2" />
          Invite Your Team
        </Button>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Filter created</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New alert found</p>
                <p className="text-xs text-slate-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Subscription updated</p>
                <p className="text-xs text-slate-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-medium sm:text-2xl">
              Start Basic Now
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                Get immediate access to advanced filters and all Basic features.
              </p>
              <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                This will end your trial period, and your payment method on file
                will be charged.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 h-11 sm:h-10"
                onClick={() => setIsUpgradeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:flex-1 h-11 sm:h-10 !text-white !bg-gray-900 hover:!bg-gray-800 border-gray-900 hover:border-gray-800"
                onClick={handleStartBasicNow}
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start Basic Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
