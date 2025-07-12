"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/subscription/pricing-card";
import type { SubscriptionInterval } from "@/types/subscription";

export default function PricingPage() {
  const [interval, setInterval] = useState<SubscriptionInterval>("month");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Select the perfect plan for your needs
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard plan="free" interval={interval} />
          <PricingCard plan="premium" interval={interval} popular />
          <PricingCard plan="business" interval={interval} />
        </div>
      </div>
    </div>
  );
}
