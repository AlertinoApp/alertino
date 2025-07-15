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
      <CardContent className="p-4 sm:p-6 relative">
        {/* Close Button - Upper Right on mobile only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 absolute top-2 right-2 z-10 sm:hidden"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          {/* Main Content */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 mb-1">
                {isNearLimit
                  ? "Approaching Filter Limit"
                  : "Unlock Premium Features"}
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {isNearLimit
                  ? `You're using ${filtersCount}/3 filters. Upgrade for unlimited filters and premium features.`
                  : "Get unlimited filters, priority notifications, and access to all Polish cities."}
              </p>
            </div>
          </div>

          {/* Action Buttons for desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden pr-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                {isNearLimit
                  ? "Approaching Filter Limit"
                  : "Unlock Premium Features"}
              </h3>
              <p className="text-blue-800 text-xs leading-relaxed">
                {isNearLimit
                  ? `You're using ${filtersCount}/3 filters. Upgrade for unlimited filters and premium features.`
                  : "Get unlimited filters, priority notifications, and access to all Polish cities."}
              </p>
            </div>
          </div>

          {/* Action Button for mobile */}
          <div className="flex justify-start">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-xs px-3"
            >
              <Link href="/pricing">
                <Zap className="w-3 h-3 mr-1" />
                <span className="hidden xs:inline">Upgrade Now</span>
                <span className="xs:hidden">Upgrade</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
