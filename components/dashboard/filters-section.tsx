"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FilterIcon,
  Eye,
  EyeOff,
  MapPin,
  DollarSign,
  Home,
} from "lucide-react";
import { FilterCard } from "./filter-card";
import { AddFilterModal } from "./add-filter-modal";
import type { Filter } from "@/types/filters";
import type { SubscriptionPlan } from "@/types/subscription";
import { getSubscriptionConfig } from "@/lib/stripe/plans";

interface FiltersSectionProps {
  filters: Filter[];
  userId: string;
  currentPlan?: SubscriptionPlan;
  filtersCount?: number;
}

type ViewMode = "all" | "active" | "inactive";

export function FiltersSection({
  filters,
  userId,
  currentPlan = "free",
  filtersCount = 0,
}: FiltersSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const activeFilters = filters.filter((filter) => filter.is_active !== false);
  const inactiveFilters = filters.filter(
    (filter) => filter.is_active === false
  );

  const subscriptionConfig = getSubscriptionConfig(currentPlan);
  const maxFilters = subscriptionConfig.limits.filtersLimit;
  const isAtLimit = maxFilters !== -1 && filtersCount >= maxFilters;

  const getFiltersToShow = () => {
    switch (viewMode) {
      case "active":
        return activeFilters;
      case "inactive":
        return inactiveFilters;
      default:
        // Sort filters: active first, then inactive
        return [...activeFilters, ...inactiveFilters];
    }
  };

  const filtersToShow = getFiltersToShow();

  return (
    <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <FilterIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Search Filters
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your apartment search criteria
                </p>
              </div>
            </div>

            {/* Filter Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge
                variant="secondary"
                className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600"
              >
                <Eye className="w-3 h-3 mr-1" />
                {activeFilters.length} Active
              </Badge>

              {inactiveFilters.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground border-border"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  {inactiveFilters.length} Inactive
                </Badge>
              )}
            </div>

            {maxFilters !== -1 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{subscriptionConfig.name} plan</span>
                  <span>
                    {filtersCount}/{maxFilters}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isAtLimit ? "bg-destructive" : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min((filtersCount / maxFilters) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {filters.length > 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode(viewMode === "all" ? "active" : "all")
                }
              >
                {viewMode === "all" ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Inactive
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Inactive
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={isAtLimit}
              className={`${
                isAtLimit
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAtLimit ? "Limit Reached" : "Add Filter"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6">
        {filtersToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtersToShow.map((filter) => (
              <FilterCard key={filter.id} filter={filter} />
            ))}
          </div>
        ) : filters.length === 0 ? (
          /* Empty State - No filters at all */
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-3">
              Create Your First Filter
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Set up search criteria to automatically find apartments that match
              your preferences. You can filter by city, price range, and number
              of rooms.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="text-center p-4 bg-muted rounded-lg">
                <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Choose Cities</div>
                <div className="text-xs text-muted-foreground">
                  Warsaw, Krakow, Gdansk...
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Set Budget</div>
                <div className="text-xs text-muted-foreground">
                  Maximum price range
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Home className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Room Count</div>
                <div className="text-xs text-muted-foreground">
                  Minimum rooms needed
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Filter
            </Button>
          </div>
        ) : (
          /* Empty State - No filters in current view */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              {viewMode === "active" ? (
                <Eye className="w-8 h-8 text-muted-foreground" />
              ) : (
                <EyeOff className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">No {viewMode} filters</h3>
            <p className="text-muted-foreground mb-4">
              {viewMode === "active"
                ? "All your filters are currently inactive. Activate some filters to start receiving alerts."
                : "You don't have any inactive filters."}
            </p>
            <Button
              variant="outline"
              onClick={() => setViewMode("all")}
              className="text-muted-foreground"
            >
              View All Filters
            </Button>
          </div>
        )}
      </div>

      <AddFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        currentPlan={currentPlan}
        filtersCount={filtersCount}
      />
    </section>
  );
}
