"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Clock,
  Activity,
  TrendingUp,
  Settings2,
  BarChart3,
  Calendar,
  Target,
  Search,
} from "lucide-react";
import { generateAlerts } from "@/lib/actions/alert-actions";
import { toast } from "sonner";
import {
  getScrapingIntervalDisplay,
  getRemainingSearchesCount,
  getDailySearchLimit,
} from "@/lib/utils/subscription-utils";

interface ActionsSectionProps {
  activeFiltersCount?: number;
  totalAlertsCount?: number;
  newAlertsToday?: number;
  lastRunDate?: Date | null;
  currentPlan?: "free" | "basic" | "pro";
  searchesUsedToday?: number;
  filters?: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
}

// Mock progress steps - replace with your actual process steps
const PROGRESS_STEPS = [
  { step: 1, label: "Initializing search..." },
  { step: 2, label: "Connecting to listing sources..." },
  { step: 3, label: "Processing filters..." },
  { step: 4, label: "Scanning apartment listings..." },
  { step: 5, label: "Checking for duplicates..." },
  { step: 6, label: "Finalizing results..." },
];

export function ActionsSection({
  activeFiltersCount = 0,
  totalAlertsCount = 0,
  newAlertsToday = 0,
  lastRunDate = null,
  currentPlan = "free",
  searchesUsedToday = 0,
  filters = [],
}: ActionsSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [lastRun, setLastRun] = useState<Date | null>(lastRunDate);
  const [lastResult, setLastResult] = useState<{
    found: number;
    checked: number;
    duplicates: number;
  } | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Convert filters to the format expected by MultiSelect
  const filterOptions = filters
    .filter((f) => f.is_active)
    .map((filter) => ({
      value: filter.id,
      label: filter.name,
    }));

  // Simulate progress updates - replace with real progress tracking
  const simulateProgress = async () => {
    setProgress(0);

    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      const step = PROGRESS_STEPS[i];
      setCurrentStep(step.label);

      // Simulate time for each step
      const stepDuration = i === 3 ? 3000 : 1000; // Step 4 (scanning) takes longer
      const progressIncrement = 100 / PROGRESS_STEPS.length;
      const startProgress = i * progressIncrement;

      // Animate progress within each step
      const animationDuration = stepDuration;
      const animationSteps = 20;
      const stepIncrement = progressIncrement / animationSteps;

      for (let j = 0; j < animationSteps; j++) {
        await new Promise((resolve) =>
          setTimeout(resolve, animationDuration / animationSteps)
        );
        setProgress(() =>
          Math.min(100, startProgress + (j + 1) * stepIncrement)
        );
      }
    }

    setProgress(100);
    setCurrentStep("Completed!");
  };

  const handleRunAlerts = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentStep("Starting scan...");

    // Use selected filters or all active filters if none selected
    const filtersToRun =
      selectedFilters.length > 0 ? selectedFilters : undefined;
    const filterCount = filtersToRun ? filtersToRun.length : activeFiltersCount;

    const loadingToast = toast.loading("🔍 Searching for new apartments...", {
      description: `Scanning ${filterCount} filter${filterCount > 1 ? "s" : ""} across all listing sources`,
    });

    try {
      const progressPromise = simulateProgress();

      const [, result] = await Promise.all([
        progressPromise,
        generateAlerts(filtersToRun),
      ]);

      const runTime = new Date();
      setLastRun(runTime);
      setLastResult({
        found: result.createdCount,
        checked: result.checkedCount,
        duplicates: result.duplicatesSkipped,
      });

      toast.dismiss(loadingToast);

      if (result.createdCount > 0) {
        if (result.createdCount === 1) {
          toast("🎉 Found 1 new apartment!", {
            description: `1 new listing found${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        } else if (result.createdCount <= 5) {
          toast(`🎉 Found ${result.createdCount} new apartments!`, {
            description: `${result.createdCount} new listings from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""}${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        } else {
          const filterNames = filtersToRun
            ? filters
                .filter((f) => filtersToRun.includes(f.id))
                .map((f) => f.name)
                .join(", ")
            : "all filters";

          toast(`🔥 Jackpot! Found ${result.createdCount} new apartments!`, {
            description: `${result.createdCount} new listings from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""} (${filterNames})${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}`,
          });
        }
      } else if (result.checkedCount > 0) {
        const filterNames = filtersToRun
          ? filters
              .filter((f) => filtersToRun.includes(f.id))
              .map((f) => f.name)
              .join(", ")
          : "all filters";

        if (result.duplicatesSkipped > 0) {
          toast("🔁 No new apartments found", {
            description: `Checked ${result.checkedCount} listing${result.checkedCount > 1 ? "s" : ""} using ${filterNames} but found ${result.duplicatesSkipped} duplicate${result.duplicatesSkipped > 1 ? "s" : ""} we've already alerted you about`,
          });
        } else {
          toast("🔁 No new apartments this time", {
            description: `Checked ${result.checkedCount} listing${result.checkedCount > 1 ? "s" : ""} from ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""} (${filterNames}), but no new matches found`,
          });
        }
      } else {
        const filterNames = filtersToRun
          ? filters
              .filter((f) => filtersToRun.includes(f.id))
              .map((f) => f.name)
              .join(", ")
          : "all filters";

        toast("🚫 No listings available right now", {
          description: `Processed ${result.filtersProcessed} filter${result.filtersProcessed > 1 ? "s" : ""} (${filterNames}) but no listings found from your selected sources`,
        });
      }
    } catch (error) {
      console.error("Failed to generate alerts:", error);
      toast.dismiss(loadingToast);

      // Check if it's a search limit error
      if (
        error instanceof Error &&
        error.message.includes("Search limit exceeded")
      ) {
        toast("🚫 Search limit exceeded", {
          description: error.message,
          action: {
            label: "Upgrade Plan",
            onClick: () => window.open("/pricing", "_blank"),
          },
        });
      } else {
        toast("❌ Failed to generate alerts", {
          description:
            "Something went wrong while checking for new apartments. Please try again.",
        });
      }
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  const getButtonText = () => {
    if (isRunning) return "Searching...";
    if (activeFiltersCount === 0) return "Create Filter First";

    if (selectedFilters.length === 0) {
      return "Search All Filters";
    } else if (selectedFilters.length === 1) {
      const filterName =
        filters.find((f) => f.id === selectedFilters[0])?.name || "Filter";
      return `Search "${filterName}"`;
    } else {
      return `Search ${selectedFilters.length} Filters`;
    }
  };

  const getButtonDescription = () => {
    if (activeFiltersCount === 0)
      return "You need at least one active filter to search for apartments";
    if (getRemainingSearchesCount(currentPlan, searchesUsedToday) === 0)
      return `You've reached your daily search limit (${searchesUsedToday}/${getDailySearchLimit(currentPlan)}). Upgrade your plan for more searches.`;

    if (selectedFilters.length === 0) {
      return "Search for new apartments using all your active filters";
    } else {
      const filterNames = selectedFilters
        .map((filterId) => filters.find((f) => f.id === filterId)?.name)
        .filter(Boolean)
        .join(", ");
      return `Search for new apartments using: ${filterNames}`;
    }
  };

  const isButtonDisabled =
    isRunning ||
    activeFiltersCount === 0 ||
    getRemainingSearchesCount(currentPlan, searchesUsedToday) === 0;

  // Calculate time since last run
  const getTimeSinceLastRun = () => {
    if (!lastRun) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastRun.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return "Just now";
    }
  };

  // Success rate calculation
  const successRate = lastResult
    ? Math.round((lastResult.found / Math.max(lastResult.checked, 1)) * 100)
    : 0;

  return (
    <section className="space-y-6">
      {/* Main Action Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Search for New Apartments
                </h3>
                {isRunning && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 animate-pulse">
                    Searching
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 mb-4">{getButtonDescription()}</p>

              {/* Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Subscription Limits */}
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Plan:</span>
                  <Badge variant="outline" className="text-xs">
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Auto-scraping:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getScrapingIntervalDisplay(currentPlan)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Searches left:</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      getRemainingSearchesCount(
                        currentPlan,
                        searchesUsedToday
                      ) === 0
                        ? "bg-red-50 text-red-700 border-red-200"
                        : ""
                    }`}
                  >
                    {getRemainingSearchesCount(currentPlan, searchesUsedToday)}
                  </Badge>
                </div>
              </div>

              {/* Action Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <Badge
                    variant={activeFiltersCount > 0 ? "default" : "destructive"}
                    className={
                      activeFiltersCount > 0
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {activeFiltersCount}
                  </Badge>
                </div>

                {lastRun && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Last run:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTimeSinceLastRun()}
                    </span>
                  </div>
                )}

                {lastResult && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Last result:</span>
                    <span className="text-sm font-medium text-green-700">
                      {lastResult.found} found
                    </span>
                  </div>
                )}
              </div>

              {/* Filter Selector */}
              {filters.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <MultiSelect
                    options={filterOptions}
                    value={selectedFilters}
                    onValueChange={setSelectedFilters}
                    placeholder="Choose filters to search (or leave empty to search all)"
                    className="flex-1"
                    maxSelected={activeFiltersCount}
                  />
                  {selectedFilters.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFilters([])}
                      className="h-10 px-3 text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}

              {/* Progress indicator when running */}
              {isRunning && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{currentStep}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </Progress>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <Button
                onClick={handleRunAlerts}
                disabled={isButtonDisabled}
                size="lg"
                className={`px-8 py-3 text-lg font-medium transition-all duration-200 ${
                  isButtonDisabled
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg"
                } text-white min-w-[160px]`}
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    {getButtonText()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAlertsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Today */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {newAlertsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {newAlertsToday > 0 && (
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  +{newAlertsToday} today
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {successRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {lastResult && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {lastResult.found} of {lastResult.checked} checked
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Filters</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeFiltersCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            {activeFiltersCount === 0 && (
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  No active filters
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Run Details */}
      {lastResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-gray-600" />
              Last Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {lastResult.checked}
                </div>
                <div className="text-sm text-blue-700">Listings Checked</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.found}
                </div>
                <div className="text-sm text-green-700">New Listings Found</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {lastResult.duplicates}
                </div>
                <div className="text-sm text-orange-700">
                  Duplicates Skipped
                </div>
              </div>
            </div>

            {lastRun && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last search completed: {lastRun.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      {activeFiltersCount === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Get Started</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Create your first filter to start searching for apartment
                  alerts. You can specify your preferred city, price range, and
                  number of rooms.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    Set price limits
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    Choose cities
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    Filter by rooms
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
