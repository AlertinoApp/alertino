"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { generateAlerts } from "@/lib/actions/alert-actions";
import { toast } from "sonner";

interface ActionsSectionProps {
  activeFiltersCount?: number;
}

export function ActionsSection({
  activeFiltersCount = 0,
}: ActionsSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const handleRunAlerts = async () => {
    setIsRunning(true);

    // Enhanced loading toast with more context
    const loadingToast = toast.loading("🔍 Searching for new apartments...", {
      description: `Scanning ${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} across all listing sources`,
    });

    try {
      const result = await generateAlerts();
      setLastRun(new Date());

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Enhanced success scenarios with detailed metrics
      if (result.createdCount > 0) {
        // Different messaging based on count
        if (result.createdCount === 1) {
          toast("🎉 Found 1 new apartment!", {
            description: `1 new listing found${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        } else if (result.createdCount <= 5) {
          toast(`🎉 Found ${result.createdCount} new apartments!`, {
            description: `${result.createdCount} new listi§ngs from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""}${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        } else {
          toast(`🔥 Jackpot! Found ${result.createdCount} new apartments!`, {
            description: `${result.createdCount} new listings from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""}${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        }
      } else if (result.checkedCount > 0) {
        // Show different messages based on duplicates
        if (result.duplicatesSkipped > 0) {
          toast("🔁 No new apartments found", {
            description: `Checked ${result.checkedCount} listing${result.checkedCount > 1 ? "s" : ""} but found ${result.duplicatesSkipped} duplicate${result.duplicatesSkipped > 1 ? "s" : ""} we've already alerted you about`,
          });
        } else {
          toast("🔁 No new apartments this time", {
            description: `Checked ${result.checkedCount} listing${result.checkedCount > 1 ? "s" : ""} from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""}, but no new matches found`,
          });
        }
      } else {
        toast("🚫 No listings available right now", {
          description: `Processed ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""} but no listings found from your selected sources`,
        });
      }
    } catch (error) {
      console.error("Failed to generate alerts:", error);
      toast("❌ Failed to generate alerts", {
        description:
          "Something went wrong while checking for new apartments. Please try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getButtonText = () => {
    if (isRunning) return "Running...";
    if (activeFiltersCount === 0) return "Create Filter First";
    return "Run Alerts";
  };

  const getButtonDescription = () => {
    if (activeFiltersCount === 0)
      return "You need at least one filter to search for apartments";
    return "Search for new apartments matching your filters";
  };

  const isButtonDisabled = isRunning || activeFiltersCount === 0;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Run your alerts to find new apartment listings
        </p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Run Alerts Now
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {getButtonDescription()}
              </p>

              {/* Enhanced status indicators */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="font-medium">Active filters:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      activeFiltersCount > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {activeFiltersCount}
                  </span>
                  {activeFiltersCount === 0 && (
                    <span className="ml-2 text-xs text-red-600">
                      (Required)
                    </span>
                  )}
                </div>

                {lastRun && (
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Last run: {lastRun.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                onClick={handleRunAlerts}
                disabled={isButtonDisabled}
                className={`px-6 sm:px-8 transition-all duration-200 ${
                  isButtonDisabled
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:scale-105"
                } text-white`}
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {getButtonText()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
