"use client";

import { useState, useEffect } from "react";
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
import { getBillingDataAction } from "@/lib/actions/billing-actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PaymentMethod, Invoice } from "@/lib/stripe/billing";
import { toast } from "sonner";

interface BillingTabProps {
  user: SupabaseUser;
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
}

export function BillingTab({ subscription, trialInfo }: BillingTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const currentPlan = subscription?.plan || "free";
  const isTrialActive = trialInfo?.isActive || false;
  const trialDaysRemaining = trialInfo?.daysRemaining || 0;

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!subscription?.stripe_subscription_id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getBillingDataAction();
        setPaymentMethods(data.paymentMethods);
        setInvoices(data.invoices);
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
        toast("❌ Failed to load billing data", {
          description: "Please try again shortly.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [subscription?.stripe_subscription_id]);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Current Subscription Skeleton */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Current Subscription
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Manage your billing and subscription
                  </p>
                </div>
              </div>
              <div className="animate-pulse w-full sm:w-auto">
                <div className="h-9 w-full sm:w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Skeleton */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Your saved payment methods
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Skeleton */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Billing History</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Your recent invoices and payments
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Subscription</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Manage your billing and subscription
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={!subscription?.stripe_subscription_id}
              className="w-full sm:w-auto"
            >
              <Eye className="w-4 h-4 mr-2" />
              {subscription?.stripe_subscription_id
                ? "Manage Subscription"
                : "No Active Subscription"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg gap-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  {getPlanPrice(currentPlan)} per month
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Next billing
              </p>
              <p className="font-medium dark:text-gray-100">
                {subscription?.current_period_end
                  ? new Date(
                      subscription.current_period_end
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Method</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Manage your payment information
                </p>
              </div>
            </div>
            {paymentMethods.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                className="w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Payment Methods List */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-gray-100">
                        {method.card
                          ? `${method.card.brand.toUpperCase()} •••• ${method.card.last4}`
                          : method.type}
                      </p>
                      {method.card && (
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          Expires{" "}
                          {method.card.expMonth.toString().padStart(2, "0")}/
                          {method.card.expYear}
                        </p>
                      )}
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {paymentMethods.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">
                No payment methods found
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Add a payment method to manage your subscription
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Billing History</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  View and download your invoices
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Invoices Table */}
          {invoices.length > 0 && (
            <div className="rounded-xl border-0 bg-slate-50 dark:bg-gray-700 p-6 flex flex-col gap-4">
              <div className="overflow-x-auto flex flex-col gap-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-gray-600 text-left">
                      <th className="p-2 dark:text-gray-100">Date</th>
                      <th className="p-2 dark:text-gray-100">Status</th>
                      <th className="p-2 text-right dark:text-gray-100">
                        Amount
                      </th>
                      <th className="p-2 text-right dark:text-gray-100">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600"
                      >
                        <td className="p-2 dark:text-gray-100">
                          {formatDate(invoice.created)}
                        </td>
                        <td className="p-2 capitalize">
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-medium dark:text-gray-100">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </td>
                        <td className="p-2 text-right">
                          {invoice.hostedInvoiceUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6"
                              onClick={() =>
                                window.open(invoice.hostedInvoiceUrl, "_blank")
                              }
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          ) : (
                            <span className="text-slate-400 dark:text-gray-500 text-xs">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {invoices.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">
                {currentPlan === "free"
                  ? "No billing history"
                  : "No billing history found"}
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                {currentPlan === "free"
                  ? "Upgrade to a paid plan to see billing history"
                  : "No invoices found for your account"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
