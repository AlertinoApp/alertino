"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Zap } from "lucide-react";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
  Subscription,
} from "@/types/subscription";
import { UpgradeButton } from "./upgrade-button";
import { getPlanConfig } from "@/lib/stripe/plans";

interface PricingCardProps {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  subscription?: Subscription | null;
  popular?: boolean;
}

export function PricingCard({
  plan,
  interval,
  subscription,
  popular = false,
}: PricingCardProps) {
  const planConfig = getPlanConfig(plan);
  const currentPlan = subscription?.plan || "free";

  const getPlanIcon = () => {
    switch (plan) {
      case "premium":
        return <Crown className="w-6 h-6 text-blue-600" />;
      case "business":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-slate-600" />;
    }
  };

  const getPrice = () => {
    const price =
      interval === "month" ? planConfig.price.monthly : planConfig.price.yearly;

    if (price === 0) return "Free";

    const yearlyDiscount =
      interval === "year"
        ? Math.round(
            (1 - planConfig.price.yearly / 12 / planConfig.price.monthly) * 100
          )
        : 0;

    return (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-slate-600">/{interval}</span>
        {yearlyDiscount > 0 && (
          <Badge variant="secondary" className="ml-2">
            Save {yearlyDiscount}%
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className={`relative ${popular ? "border-blue-500 shadow-lg" : ""}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border">
            {getPlanIcon()}
          </div>
        </div>

        <CardTitle className="text-xl">{planConfig.name}</CardTitle>

        <div className="mt-4">{getPrice()}</div>
      </CardHeader>

      <CardContent className="space-y-6">
        <UpgradeButton
          plan={plan}
          interval={interval}
          currentPlan={currentPlan}
          className="w-full"
        />

        <div className="space-y-3">
          {planConfig.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
