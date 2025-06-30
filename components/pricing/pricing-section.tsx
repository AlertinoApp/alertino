"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started with apartment hunting",
    features: [
      "Up to 3 active filters",
      "Email notifications",
      "Basic apartment alerts",
      "Warsaw & Krakow coverage",
      "Community support",
    ],
    limitations: [
      "Limited to 3 filters",
      "Standard notification speed",
      "Basic support only",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "gray",
  },
  {
    name: "Pro",
    icon: Crown,
    price: { monthly: 19, yearly: 190 },
    description: "For serious apartment hunters who need more flexibility",
    features: [
      "Unlimited filters",
      "Priority notifications (5min delay)",
      "All Polish cities coverage",
      "Advanced filter options",
      "Email & SMS notifications",
      "Priority support",
      "Export alerts to CSV",
      "Custom notification schedules",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true,
    color: "blue",
  },
  {
    name: "Business",
    icon: Building2,
    price: { monthly: 49, yearly: 490 },
    description: "For real estate professionals and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 5 users)",
      "API access",
      "White-label notifications",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    color: "purple",
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();

  const handleGetStarted = (planName: string) => {
    if (planName === "Free") {
      router.push("/login");
    } else if (planName === "Business") {
      router.push("/contact");
    } else {
      router.push("/login"); // In real app, this would go to checkout
    }
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
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isYearly ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-500"}`}
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-xl transition-all duration-300 ${
                plan.popular
                  ? "ring-2 ring-blue-500 shadow-lg scale-105"
                  : "hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    plan.color === "blue"
                      ? "bg-blue-100"
                      : plan.color === "purple"
                        ? "bg-purple-100"
                        : "bg-gray-100"
                  }`}
                >
                  <plan.icon
                    className={`w-6 h-6 ${
                      plan.color === "blue"
                        ? "text-blue-600"
                        : plan.color === "purple"
                          ? "text-purple-600"
                          : "text-gray-600"
                    }`}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{isYearly ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${plan.price.monthly}/month billed annually
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleGetStarted(plan.name)}
                  className={`w-full h-12 font-semibold ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      What&apos;s included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
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
          ))}
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
                onClick={() => router.push("/contact")}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
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
