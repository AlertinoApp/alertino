"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Subscription } from "@/types/subscription";

interface PlanComparisonProps {
  subscription: Subscription;
}

const plans = [
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 19,
    yearlyPrice: 190, // ~15.83/month when billed yearly
    icon: Crown,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: [
      "Unlimited filters",
      "Priority notifications",
      "All cities",
      "Export to CSV",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 49,
    yearlyPrice: 490, // ~40.83/month when billed yearly
    icon: Building2,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: [
      "Everything in Premium",
      "Team features",
      "API access",
      "Priority support",
    ],
  },
];

export function PlanComparison({ subscription }: PlanComparisonProps) {
  const [isYearly, setIsYearly] = useState(false);
  const currentPlan = subscription?.plan || "free";

  // Don't show plan comparison for paid users - they can use the main pricing page
  if (currentPlan !== "free") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
            Need a Different Plan?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-2">
              You&apos;re on the {currentPlan} plan
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Want to explore other options or change your billing cycle?
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-600" />
          </div>
          Upgrade Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 p-1 bg-slate-100 rounded-lg">
          <span
            className={`text-sm font-medium ${!isYearly ? "text-slate-900" : "text-slate-600"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isYearly ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isYearly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${isYearly ? "text-slate-900" : "text-slate-600"}`}
            >
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquivalent = isYearly
              ? Math.round((plan.yearlyPrice / 12) * 100) / 100
              : price;

            return (
              <div
                key={plan.id}
                className={`relative p-4 rounded-lg border transition-all border-slate-200 hover:border-slate-300 hover:shadow-sm`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-4">
                    <Badge className="bg-blue-600 text-white border-blue-600 text-xs font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${plan.bgColor} rounded-lg flex items-center justify-center border ${plan.borderColor}`}
                    >
                      <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {plan.name}
                      </div>
                      <div className="text-slate-600 text-sm">
                        <span className="font-semibold text-lg text-slate-900">
                          ${monthlyEquivalent}
                        </span>
                        /month
                        {isYearly && (
                          <div className="text-xs text-slate-500">
                            Billed ${price} yearly
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.popular ? "default" : "outline"}
                  size="sm"
                  className={`w-full h-9 ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-slate-200 bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <Link
                    href={`/pricing?plan=${plan.id}&billing=${isYearly ? "yearly" : "monthly"}`}
                  >
                    Upgrade to {plan.name}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            Need a custom plan?{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact us
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
