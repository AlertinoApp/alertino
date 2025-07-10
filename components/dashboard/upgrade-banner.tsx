"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, X, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeBannerProps {
  filtersCount: number;
}

export function UpgradeBanner({ filtersCount }: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Show banner if user has 2+ filters (approaching limit) or if they have 0 filters (new user)
  const shouldShow = filtersCount >= 2 || filtersCount === 0;

  if (isDismissed || !shouldShow) return null;

  const isNearLimit = filtersCount >= 2;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                {isNearLimit
                  ? "Approaching Filter Limit"
                  : "Unlock Premium Features"}
              </h3>
              <p className="text-blue-800 text-sm">
                {isNearLimit
                  ? `You're using ${filtersCount}/3 filters. Upgrade for unlimited filters and premium features.`
                  : "Get unlimited filters, priority notifications, and access to all Polish cities."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/pricing">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
