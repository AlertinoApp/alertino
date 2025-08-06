"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calendar,
  Eye,
  ExternalLink,
  Crown,
  Wallet,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Subscription, TrialInfo } from "@/types/subscription";
import { managePlanAction } from "@/lib/actions/subscription-actions";
import { toast } from "sonner";

interface BillingTabProps {
  user: SupabaseUser;
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
}

export function BillingTab({ subscription, trialInfo }: BillingTabProps) {
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

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "basic":
        return "39 PLN";
      case "pro":
        return "99 PLN";
      default:
        return "Free";
    }
  };

  const handleManageSubscription = async () => {
    try {
      await managePlanAction();
    } catch (error) {
      console.error("Failed to open Stripe portal:", error);

      // Check if it's the specific error about no subscription
      if (
        error instanceof Error &&
        error.message.includes("No active subscription")
      ) {
        toast("❌ No subscription found", {
          description:
            "Please subscribe to a plan first to manage your billing.",
        });
      } else {
        toast("❌ Failed to open billing portal", {
          description: "Please try again shortly.",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Subscription</CardTitle>
                <p className="text-sm text-slate-600">
                  Manage your billing and subscription
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={!subscription?.stripe_customer_id}
            >
              <Eye className="w-4 h-4 mr-2" />
              {subscription?.stripe_customer_id
                ? "Manage Subscription"
                : "No Active Subscription"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg">
                      {isTrialActive
                        ? `${getPlanName(currentPlan)} Trial`
                        : getPlanName(currentPlan)}
                    </h3>
                    {isTrialActive && (
                      <Badge variant="secondary" className="text-xs">
                        {trialDaysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {getPlanPrice(currentPlan)} per month
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Next billing</p>
                <p className="font-medium">
                  {subscription?.current_period_end
                    ? new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Method</CardTitle>
                <p className="text-sm text-slate-600">
                  Manage your payment information
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-slate-600">Expires 12/25</p>
              </div>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Invoice */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Upcoming Invoice</CardTitle>
              <p className="text-sm text-slate-600">
                Next billing cycle details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 border-0 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start">
                <p className="text-sm text-slate-500 py-2 tracking-tight">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  • Upcoming invoice
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-medium tracking-tight">
                    {currentPlan === "free"
                      ? "$0.00"
                      : currentPlan === "basic"
                        ? "39 PLN"
                        : "99 PLN"}
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-sm">
                <thead className="text-sm text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-right font-medium">Cost</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="h-9">
                    <td className="px-3 py-2.5 text-left text-slate-600 font-bold">
                      Subtotal:
                    </td>
                    <td
                      colSpan={3}
                      className="px-3 py-2.5 text-right text-slate-600 font-bold"
                    >
                      {currentPlan === "free"
                        ? "$0.00"
                        : currentPlan === "basic"
                          ? "39 PLN"
                          : "99 PLN"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Billing History</CardTitle>
                <p className="text-sm text-slate-600">
                  View and download your invoices
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-0 bg-slate-50 p-6 flex flex-col gap-4">
            <div className="overflow-x-auto flex flex-col gap-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="p-2">Date</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 hover:bg-slate-100">
                    <td className="p-2">05 Aug 2024</td>
                    <td className="p-2 capitalize">paid</td>
                    <td className="p-2 text-right">99 PLN</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" className="h-6">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-100">
                    <td className="p-2">05 Jul 2024</td>
                    <td className="p-2 capitalize">paid</td>
                    <td className="p-2 text-right">99 PLN</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" className="h-6">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
