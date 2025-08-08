"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createCheckoutSessionAction } from "@/lib/actions/subscription-actions";
import { toast } from "sonner";
import { getPriceId } from "@/lib/stripe/utils";
import type { SubscriptionPlan } from "@/types/subscription";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubscriptionInterval = "month" | "year";

interface PricingSectionProps {
  user?: User | null;
  trialInfo?: {
    isEligible: boolean;
    daysRemaining: number | null;
    isActive: boolean;
    hasUsedTrial: boolean;
  } | null;
}

export function PricingSection({ user, trialInfo }: PricingSectionProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");
  const router = useRouter();
  const isLoggedIn = !!user;
  const canStartTrial = trialInfo?.isEligible ?? false;

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Hunt your apartment with basic features",
      features: [
        "3 active filters",
        "10 searches per day",
        "Email notifications (weekly summary)",
        "Basic filters only",
      ],
    },
    {
      name: "Basic",
      price: { monthly: 39, yearly: 312 }, // 20% discount
      description: "Perfect for serious apartment hunters",
      popular: true,
      features: [
        "10 active filters",
        "50 searches per day",
        "Scraping every 4 hours",
        "Email + SMS notifications",
        "Access to advanced filters",
      ],
    },
    {
      name: "Pro",
      price: { monthly: 99, yearly: 792 }, // 20% discount
      description: "Maximum power and flexibility",
      features: [
        "Unlimited filters",
        "200 searches per day",
        "Scraping every 1 hour",
        "Email + SMS notifications",
        "Access to advanced filters",
        "Priority support",
      ],
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    return interval === "year" ? plan.price.yearly / 12 : plan.price.monthly;
  };

  return (
    <section className="py-20">
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

          {/* Interval Toggle */}
          <div className="flex justify-center mb-12">
            <Tabs
              value={interval}
              onValueChange={(value) =>
                setInterval(value as SubscriptionInterval)
              }
              className="w-fit"
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 shadow-sm">
                <TabsTrigger
                  value="month"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Yearly (save 20%)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-6">
          {plans.map((plan, index) => {
            const price = getPrice(plan);

            return (
              <div key={index} className="list-none">
                <div className="relative h-full rounded-2xl md:rounded-3xl">
                  <div
                    className={`relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border ${plan.popular ? "border-blue-500 shadow-blue-100" : "border-slate-200"} bg-white p-6 md:rounded-3xl md:p-8 lg:p-6 xl:p-8`}
                  >
                    <div className="relative flex flex-col gap-3.5 md:gap-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-semibold">
                          {plan.name}
                        </h2>
                        {plan.popular && (
                          <Badge className="bg-blue-600 text-white">
                            Most Popular
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm md:text-base text-slate-600">
                        {plan.description}
                      </p>

                      <p className="text-5xl leading-tight font-semibold flex items-baseline gap-1 md:gap-2">
                        {plan.name === "Free" ? (
                          "Free"
                        ) : (
                          <>
                            $<NumberTicker value={Math.round(price)} />
                            <span className="text-sm md:text-base font-normal text-slate-400">
                              /mo
                            </span>
                          </>
                        )}
                      </p>

                      <hr className="border-slate-200" />

                      <div className="flex flex-col gap-4 mt-2 mb-3">
                        <p className="text-sm md:text-base mb-0 flex items-center gap-2 font-semibold text-slate-600">
                          {index === 0
                            ? "Includes"
                            : `Everything in ${plans[index - 1].name}, plus`}
                        </p>

                        <ul className="text-sm md:text-base flex flex-col gap-1.5 md:gap-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="text-sm md:text-base mb-0 flex items-center gap-2 text-slate-700"
                            >
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="relative">
                      <Button
                        onClick={async () => {
                          if (isLoggedIn) {
                            if (plan.name === "Free") {
                              router.push("/dashboard");
                              return;
                            }
                            try {
                              const planType =
                                plan.name.toLowerCase() as SubscriptionPlan;
                              // Only Basic plan can have trial
                              if (planType === "basic" && canStartTrial) {
                                const priceId = getPriceId("basic", interval);
                                await createCheckoutSessionAction(priceId);
                              } else if (planType === "pro") {
                                const priceId = getPriceId("pro", interval);
                                await createCheckoutSessionAction(priceId);
                              } else {
                                const priceId = getPriceId("basic", interval);
                                await createCheckoutSessionAction(priceId);
                              }
                            } catch (error) {
                              console.error(
                                "Failed to create checkout session:",
                                error
                              );
                              toast.error(
                                "Failed to redirect to checkout. Please try again."
                              );
                            }
                          } else {
                            router.push("/login");
                          }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium p-3 md:px-4 md:py-3.5 text-sm md:text-base"
                      >
                        {plan.name === "Free"
                          ? "Get Started"
                          : plan.name === "Basic" && canStartTrial
                            ? "Start Basic Trial"
                            : `Get ${plan.name}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
