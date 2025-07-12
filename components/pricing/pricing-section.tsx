"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Zap } from "lucide-react";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { getPlanConfig } from "@/lib/stripe/plans";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
  Subscription,
} from "@/types/subscription";
import { User } from "@supabase/supabase-js";

const plans: SubscriptionPlan[] = ["free", "premium", "business"];

interface PricingSectionProps {
  user: User;
  subscription: Subscription;
}

export function PricingSection({ user, subscription }: PricingSectionProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");
  const currentPlan = subscription?.plan || "free";
  const isLoggedIn = !!user;

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "premium":
        return <Crown className="w-6 h-6 text-blue-600" />;
      case "business":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-slate-600" />;
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    const planConfig = getPlanConfig(plan);
    const isYearly = interval === "year";
    const monthlyEquivalent = isYearly
      ? Math.round((planConfig.price.yearly / 12) * 100) / 100
      : planConfig.price.monthly;

    const yearlyDiscount =
      interval === "year"
        ? Math.round(
            (1 - planConfig.price.yearly / 12 / planConfig.price.monthly) * 100
          )
        : 0;

    return (
      <div className="flex items-baseline justify-center">
        <span className="text-4xl font-bold text-gray-900">
          ${monthlyEquivalent}
        </span>
        <span className="text-gray-500 ml-2">/month</span>
        {yearlyDiscount > 0 && (
          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
            Save {yearlyDiscount}%
          </Badge>
        )}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your apartment hunting needs. Start free
            and upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <Card className="inline-block p-1">
            <CardContent className="flex p-1">
              <Button
                variant={interval === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInterval("month")}
              >
                Monthly
              </Button>
              <Button
                variant={interval === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInterval("year")}
              >
                Yearly
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const planConfig = getPlanConfig(plan);
            const isPopular = plan === "premium";

            return (
              <Card
                key={index}
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  isPopular
                    ? "border-blue-500 shadow-lg scale-105"
                    : "hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center bg-slate-50 border">
                    {getPlanIcon(plan)}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {planConfig.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6">{planConfig.description}</p>

                  <div className="mb-6">
                    {getPrice(plan)}
                    {interval === "year" && planConfig.price.monthly > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Billed ${planConfig.price.yearly} annually
                      </p>
                    )}
                  </div>

                  <UpgradeButton
                    plan={plan}
                    interval={interval}
                    currentPlan={currentPlan}
                    isLoggedIn={isLoggedIn}
                    className={`w-full h-12 font-semibold ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : ""
                    }`}
                  />
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        What&apos;s included:
                      </h4>
                      <ul className="space-y-2">
                        {planConfig.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Need something custom?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Looking for enterprise features, custom integrations, or have
                specific requirements? Let&apos;s talk about a solution tailored
                to your needs.
              </p>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open("/contact", "_blank")}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
