"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Receipt, FileText } from "lucide-react";

// Mock data - replace with real data from your backend
const billingHistory = [
  {
    id: "inv_001",
    date: "2024-01-01",
    amount: 19.0,
    status: "paid",
    description: "Premium Plan - January 2024",
    invoice_url: "#",
  },
  {
    id: "inv_002",
    date: "2023-12-01",
    amount: 19.0,
    status: "paid",
    description: "Premium Plan - December 2023",
    invoice_url: "#",
  },
  {
    id: "inv_003",
    date: "2023-11-01",
    amount: 19.0,
    status: "paid",
    description: "Premium Plan - November 2023",
    invoice_url: "#",
  },
  {
    id: "inv_004",
    date: "2023-10-01",
    amount: 19.0,
    status: "pending",
    description: "Premium Plan - October 2023",
    invoice_url: "#",
  },
];

export function BillingHistory() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium text-xs">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 font-medium text-xs">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 font-medium text-xs">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-slate-600" />
          </div>
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-2">
              No billing history yet
            </h3>
            <p className="text-slate-600 text-sm">
              Your invoices will appear here once you subscribe
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <Receipt className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">
                      {invoice.description}
                    </div>
                    <div className="text-slate-600 text-xs mt-0.5">
                      {new Date(invoice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-slate-900 text-sm">
                      ${invoice.amount.toFixed(2)}
                    </div>
                    <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-200"
                    onClick={() => {
                      // Handle download invoice
                      console.log("Download invoice:", invoice.id);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
