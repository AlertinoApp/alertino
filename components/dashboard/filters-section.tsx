"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FilterIcon,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  DollarSign,
  Home,
} from "lucide-react";
import { FilterCard } from "./filter-card";
import { AddFilterModal } from "./add-filter-modal";
import type { Filter } from "@/types/filters";
import type { SubscriptionPlan } from "@/types/subscription";
import { getEnhancedSubscriptionConfig } from "@/lib/stripe/plans";

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
  const [showStats, setShowStats] = useState(false);

  const activeFilters = filters.filter((filter) => filter.is_active !== false);
  const inactiveFilters = filters.filter(
    (filter) => filter.is_active === false
  );

  const subscriptionConfig = getEnhancedSubscriptionConfig(currentPlan);
  const maxFilters = subscriptionConfig.limits.filtersLimit;
  const isAtLimit = maxFilters !== -1 && filtersCount >= maxFilters;

  // Calculate filter statistics
  const filterStats = {
    avgPrice:
      activeFilters.length > 0
        ? Math.round(
            activeFilters.reduce((sum, f) => sum + f.max_price, 0) /
              activeFilters.length
          )
        : 0,
    avgRooms:
      activeFilters.length > 0
        ? Math.round(
            (activeFilters.reduce((sum, f) => sum + f.min_rooms, 0) /
              activeFilters.length) *
              10
          ) / 10
        : 0,
    uniqueCities: [...new Set(activeFilters.map((f) => f.city))].length,
    mostExpensive: activeFilters.reduce(
      (max, f) => (f.max_price > max ? f.max_price : max),
      0
    ),
    cheapest: activeFilters.reduce(
      (min, f) => (f.max_price < min && f.max_price > 0 ? f.max_price : min),
      Infinity
    ),
  };

  const getFiltersToShow = () => {
    switch (viewMode) {
      case "active":
        return activeFilters;
      case "inactive":
        return inactiveFilters;
      default:
        return filters;
    }
  };

  const filtersToShow = getFiltersToShow();

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FilterIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Filters
                </h2>
                <p className="text-sm text-gray-600">
                  Manage your apartment search criteria
                </p>
              </div>
            </div>

            {/* Filter Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Eye className="w-3 h-3 mr-1" />
                {activeFilters.length} Active
              </Badge>

              {inactiveFilters.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 border-gray-200"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  {inactiveFilters.length} Inactive
                </Badge>
              )}

              {filterStats.uniqueCities > 0 && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {filterStats.uniqueCities}{" "}
                  {filterStats.uniqueCities === 1 ? "City" : "Cities"}
                </Badge>
              )}

              {maxFilters !== -1 && (
                <Badge
                  variant="outline"
                  className={`${
                    isAtLimit
                      ? "text-red-600 border-red-200 bg-red-50"
                      : "text-gray-600 border-gray-200"
                  }`}
                >
                  {filtersCount}/{maxFilters} Used
                </Badge>
              )}
            </div>

            {maxFilters !== -1 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{subscriptionConfig.name} plan</span>
                  <span>
                    {filtersCount}/{maxFilters}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isAtLimit ? "bg-red-500" : "bg-blue-500"
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
            {activeFilters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowStats(!showStats)}
                className="text-gray-600"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {showStats ? "Hide" : "Show"} Stats
              </Button>
            )}

            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={isAtLimit}
              className={`${
                isAtLimit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAtLimit ? "Limit Reached" : "Add Filter"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Statistics */}
      {showStats && activeFilters.length > 0 && (
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            Filter Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filterStats.avgPrice.toLocaleString()}
              </div>
              <div className="text-xs text-blue-700">Avg Max Price (PLN)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filterStats.avgRooms}
              </div>
              <div className="text-xs text-green-700">Avg Min Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filterStats.uniqueCities}
              </div>
              <div className="text-xs text-purple-700">Unique Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filterStats.cheapest === Infinity
                  ? "0"
                  : (
                      filterStats.mostExpensive - filterStats.cheapest
                    ).toLocaleString()}
              </div>
              <div className="text-xs text-orange-700">Price Range</div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      {(activeFilters.length > 0 || inactiveFilters.length > 0) && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="text-xs"
            >
              All ({filters.length})
            </Button>
            <Button
              variant={viewMode === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("active")}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Active ({activeFilters.length})
            </Button>
            {inactiveFilters.length > 0 && (
              <Button
                variant={viewMode === "inactive" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("inactive")}
                className="text-xs"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Inactive ({inactiveFilters.length})
              </Button>
            )}
          </div>
        </div>
      )}

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
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Create Your First Filter
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Set up search criteria to automatically find apartments that match
              your preferences. You can filter by city, price range, and number
              of rooms.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Choose Cities
                </div>
                <div className="text-xs text-gray-600">
                  Warsaw, Krakow, Gdansk...
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Set Budget
                </div>
                <div className="text-xs text-gray-600">Maximum price range</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Home className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Room Count
                </div>
                <div className="text-xs text-gray-600">
                  Minimum rooms needed
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Filter
            </Button>
          </div>
        ) : (
          /* Empty State - No filters in current view */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {viewMode === "active" ? (
                <Eye className="w-8 h-8 text-gray-400" />
              ) : (
                <EyeOff className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {viewMode} filters
            </h3>
            <p className="text-gray-600 mb-4">
              {viewMode === "active"
                ? "All your filters are currently inactive. Activate some filters to start receiving alerts."
                : "You don't have any inactive filters."}
            </p>
            <Button
              variant="outline"
              onClick={() => setViewMode("all")}
              className="text-gray-600"
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
