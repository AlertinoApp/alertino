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
  const [billingSummary, setBillingSummary] = useState<{
    totalInvoices: number;
    totalPaid: number;
    currency: string;
    lastInvoiceDate?: number;
  } | null>(null);

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
        setBillingSummary(data.billingSummary);
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
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Current Subscription
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Manage your billing and subscription
                  </p>
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-9 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Method</CardTitle>
                <p className="text-sm text-slate-600">
                  Your saved payment methods
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Skeleton */}
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
                    Your recent invoices and payments
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
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
              disabled={!subscription?.stripe_subscription_id}
            >
              <Eye className="w-4 h-4 mr-2" />
              {subscription?.stripe_subscription_id
                ? "Manage Subscription"
                : "No Active Subscription"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
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
            {paymentMethods.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
              >
                <Eye className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.card
                          ? `${method.card.brand.toUpperCase()} •••• ${method.card.last4}`
                          : method.type}
                      </p>
                      {method.card && (
                        <p className="text-sm text-slate-600">
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
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 mb-2">
                No payment methods found
              </p>
              <p className="text-xs text-slate-400">
                Add a payment method to manage your subscription
              </p>
            </div>
          )}
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
          {invoices.length > 0 ? (
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
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-200 hover:bg-slate-100"
                      >
                        <td className="p-2">{formatDate(invoice.created)}</td>
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
                        <td className="p-2 text-right font-medium">
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
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {billingSummary && (
                <div className="flex items-center justify-between border-slate-200">
                  <div className="text-sm text-slate-600">
                    Total paid:{" "}
                    <span className="font-medium">
                      {formatCurrency(
                        billingSummary.totalPaid,
                        billingSummary.currency
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {billingSummary.totalInvoices} invoice
                    {billingSummary.totalInvoices !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 mb-2">No billing history</p>
              <p className="text-xs text-slate-400">
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
