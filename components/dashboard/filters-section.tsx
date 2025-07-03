"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FilterIcon } from "lucide-react";
import { FilterCard } from "./filter-card";
import { AddFilterModal } from "./add-filter-modal";
import { PLANS } from "@/lib/stripe/plans";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { Filter } from "@/types/filters";

interface FiltersSectionProps {
  filters: Filter[];
  userId: string;
  currentPlan?: string;
  filtersCount?: number;
}

export function FiltersSection({
  filters,
  userId,
  currentPlan = "free",
  filtersCount = 0,
}: FiltersSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeFilters = filters.filter((filter) => filter.is_active !== false);
  const inactiveFilters = filters.filter(
    (filter) => filter.is_active === false
  );

  const plan = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;
  const maxFilters = plan.maxFilters;
  const isAtLimit = maxFilters !== -1 && filtersCount >= maxFilters;

  const handleUpgrade = () => {
    window.location.href = "/pricing";
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Filters
            </h2>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {activeFilters.length} Active
              </Badge>
              {inactiveFilters.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 border-gray-200"
                >
                  {inactiveFilters.length} Inactive
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Manage your apartment search criteria
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isAtLimit}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Filter
        </Button>
      </div>

      {filters.length > 0 ? (
        <div className="space-y-6">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FilterIcon className="w-4 h-4 mr-2" />
                Active Filters ({activeFilters.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeFilters.map((filter) => (
                  <FilterCard key={filter.id} filter={filter} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Filters */}
          {inactiveFilters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <FilterIcon className="w-4 h-4 mr-2" />
                Inactive Filters ({inactiveFilters.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveFilters.map((filter) => (
                  <FilterCard key={filter.id} filter={filter} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No filters yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first filter to start receiving apartment alerts
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Filter
          </Button>
        </div>
      )}

      <AddFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
      {isAtLimit && <UpgradePrompt onUpgrade={handleUpgrade} />}
    </section>
  );
}
