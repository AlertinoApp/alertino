"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Zap, ArrowRight } from "lucide-react";
import { getPlanConfig } from "@/lib/stripe/plans";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
  Subscription,
} from "@/types/subscription";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const plans: SubscriptionPlan[] = ["free", "premium", "business"];

interface PricingSectionProps {
  user?: User | null;
  subscription?: Subscription | null;
}

export function PricingSection({ user, subscription }: PricingSectionProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");
  const router = useRouter();
  const isLoggedIn = !!user;
  const currentPlan = subscription?.plan || "free";

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

  const getPlanGradient = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "premium":
        return "from-blue-50 to-blue-100/50";
      case "business":
        return "from-purple-50 to-purple-100/50";
      default:
        return "from-slate-50 to-slate-100/50";
    }
  };

  const getPlanBorderColor = (
    plan: SubscriptionPlan,
    isPopular: boolean,
    isCurrent: boolean
  ) => {
    if (isCurrent) return "border-green-500 shadow-green-100";
    if (isPopular) return "border-blue-500 shadow-blue-100";
    return "border-slate-200 hover:border-slate-300";
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

    return {
      monthlyEquivalent,
      yearlyDiscount,
      yearly: planConfig.price.yearly,
    };
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan === "free") {
      return isLoggedIn ? "Manage Plan" : "Get Started Free";
    }

    if (currentPlan === plan) {
      return "Manage Plan";
    }

    if (currentPlan === "free") {
      return `Upgrade to ${getPlanConfig(plan).name}`;
    }

    return "Choose Plan";
  };

  const getButtonVariant = (plan: SubscriptionPlan, isPopular: boolean) => {
    if (plan === "free") {
      return "outline";
    }
    return isPopular ? "default" : "outline";
  };

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      // Store intended plan in session/local storage for post-login redirect
      sessionStorage.setItem("intended_plan", plan);
      sessionStorage.setItem("intended_interval", interval);
      router.push("/login?redirect=/billing");
    } else {
      // Redirect to billing page with plan parameters
      const params = new URLSearchParams({
        plan,
        interval,
      });
      router.push(`/billing?${params.toString()}`);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your apartment hunting needs. Start free
            and upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
            <span
              className={`text-sm font-medium px-3 py-1 ${
                interval === "month" ? "text-slate-900" : "text-slate-600"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setInterval(interval === "month" ? "year" : "month")
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                interval === "year" ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  interval === "year" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium px-3 py-1 ${
                  interval === "year" ? "text-slate-900" : "text-slate-600"
                }`}
              >
                Yearly
              </span>
              {interval === "year" && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Save up to 20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const planConfig = getPlanConfig(plan);
            const priceData = getPrice(plan);
            const isPopular = plan === "premium";
            const isCurrent = currentPlan === plan;

            return (
              <Card
                key={index}
                className={`relative hover:shadow-xl transition-all duration-300 ${getPlanBorderColor(
                  plan,
                  isPopular,
                  isCurrent
                )} ${
                  isPopular && !isCurrent
                    ? "scale-105 shadow-xl"
                    : isCurrent
                      ? "shadow-lg"
                      : "hover:shadow-lg"
                }`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getPlanGradient(plan)} opacity-30`}
                />

                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-600 text-white shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-green-600 text-white shadow-lg">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-sm border shadow-sm">
                    {getPlanIcon(plan)}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {planConfig.name}
                    </h3>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {planConfig.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-slate-900">
                        ${priceData.monthlyEquivalent}
                      </span>
                      <span className="text-slate-500 ml-2">/month</span>
                      {priceData.yearlyDiscount > 0 && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                          Save {priceData.yearlyDiscount}%
                        </Badge>
                      )}
                    </div>
                    {interval === "year" && planConfig.price.monthly > 0 && (
                      <p className="text-sm text-slate-500 mt-2">
                        Billed ${priceData.yearly} annually
                      </p>
                    )}
                  </div>

                  {/* Call-to-action button */}
                  <Button
                    variant={getButtonVariant(plan, isPopular)}
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full h-12 font-semibold transition-all duration-200 group ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        : plan === "free"
                          ? "border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
                          : "border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {getButtonText(plan)}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        What&apos;s included:
                      </h4>
                      <ul className="space-y-3">
                        {planConfig.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-slate-600 text-sm leading-relaxed">
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

        {/* Login CTA for non-logged users */}
        {!isLoggedIn && (
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>{" "}
              to manage your subscription.
            </p>
          </div>
        )}

        {/* Enterprise CTA */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
            <CardContent className="p-8 relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Need something custom?
              </h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Looking for enterprise features, custom integrations, or have
                specific requirements? Let&apos;s talk about a solution tailored
                to your needs.
              </p>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transition-all duration-200"
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
