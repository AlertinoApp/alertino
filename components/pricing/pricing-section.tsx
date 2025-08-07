"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

type SubscriptionInterval = "month" | "year";

interface PricingSectionProps {}

export function PricingSection({}: PricingSectionProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
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
      description: "Everything you need to find your apartment",
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
      description: "For power users who need maximum flexibility",
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
        <div className="mb-16">
          <h2 className="text-left text-2xl font-semibold mb-8 text-slate-900">
            Individual Plans
          </h2>

          {/* Interval Toggle */}
          <div className="flex justify-center mb-12">
            <div className="relative flex w-fit overflow-hidden rounded-md border border-slate-200">
              <button
                onClick={() => setInterval("month")}
                className={`relative z-10 flex items-center justify-center px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors duration-300 ${
                  interval === "month"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("year")}
                className={`relative z-10 flex items-center justify-center px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors duration-300 ${
                  interval === "year"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Yearly (save 20%)
              </button>
              <span
                className={`absolute top-0 z-[1] rounded-md bg-white border border-slate-200 transition-all duration-400 ease-out h-full ${
                  interval === "year" ? "left-[50%] w-[50%]" : "left-0 w-[50%]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-6">
          {plans.map((plan, index) => {
            const price = getPrice(plan);

            return (
              <div key={index} className="list-none">
                <div className="relative h-full rounded-2xl md:rounded-3xl">
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:rounded-3xl md:p-8 lg:p-6 xl:p-8">
                    <div className="relative flex flex-col gap-3.5 md:gap-4">
                      <h2 className="text-base md:text-xl font-semibold">
                        {plan.name}
                      </h2>

                      <p className="text-5xl leading-tight font-semibold flex items-baseline gap-1 md:gap-2">
                        {plan.name === "Free" ? (
                          "Free"
                        ) : (
                          <>
                            ${Math.round(price)}
                            <span className="text-sm md:text-base font-normal text-slate-400">
                              /mo
                            </span>
                          </>
                        )}
                      </p>

                      <hr className="border-slate-200" />

                      <div className="flex flex-col gap-4 mt-2 mb-3">
                        <p className="text-sm md:text-base mb-0 flex items-center gap-2 font-semibold text-slate-400">
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
                              <Check className="w-3 h-3 text-slate-600 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="relative">
                      <Button
                        asChild
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium p-3 md:px-4 md:py-3.5 text-sm md:text-base"
                      >
                        <Link href="/login">
                          {plan.name === "Free"
                            ? "Get Started"
                            : `Get ${plan.name}`}
                        </Link>
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
