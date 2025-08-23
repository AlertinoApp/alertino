"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Clock,
  Activity,
  Settings2,
  BarChart3,
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

  return (
    <section className="space-y-6">
      {/* Main Action Card */}
      <Card className="py-0! bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 overflow-hidden relative">
        <CardContent className="p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Search for New Apartments
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getButtonDescription()}
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Subscription Limits */}
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <Badge variant="outline" className="text-xs">
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Auto-scraping:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {getScrapingIntervalDisplay(currentPlan)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Searches left:
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      getRemainingSearchesCount(
                        currentPlan,
                        searchesUsedToday
                      ) === 0
                        ? "bg-destructive/10 text-destructive border-destructive/20"
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
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  <Badge
                    variant={activeFiltersCount > 0 ? "default" : "destructive"}
                    className={
                      activeFiltersCount > 0
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600"
                        : ""
                    }
                  >
                    {activeFiltersCount}
                  </Badge>
                </div>

                {lastRun && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Last run:
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {getTimeSinceLastRun()}
                    </span>
                  </div>
                )}

                {lastResult && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Last result:
                    </div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {lastResult.found} found
                    </span>
                  </div>
                )}
              </div>

              {/* Progress indicator when running */}
              {isRunning && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{currentStep}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out rounded-full"
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
                className={`mb-2 px-8 py-3 text-lg font-medium transition-all duration-200 w-full ${
                  isButtonDisabled
                    ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                    : "bg-gradient-to-r dark:text-white from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-102 shadow-lg hover:shadow-xl transition-all duration-300"
                }  min-w-[160px]`}
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    {getButtonText()}
                  </>
                )}
              </Button>
              {/* Filter Selector */}
              {filters.length > 1 && (
                <div className="flex items-center gap-2">
                  <MultiSelect
                    options={filterOptions}
                    value={selectedFilters}
                    onValueChange={setSelectedFilters}
                    placeholder="Choose filters to search"
                    className="w-full"
                    maxSelected={activeFiltersCount}
                  />
                  {selectedFilters.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFilters([])}
                      className="h-10 px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
