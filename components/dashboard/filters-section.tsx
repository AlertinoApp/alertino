"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterCard } from "./filter-card";
import { AddFilterModal } from "./add-filter-modal";

interface Filter {
  id: string;
  city: string;
  max_price: number;
  min_rooms: number;
  created_at: string;
}

interface FiltersSectionProps {
  filters: Filter[];
  userId: string;
}

export function FiltersSection({ filters, userId }: FiltersSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Filters</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your apartment search criteria
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Filter
        </Button>
      </div>

      {filters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <FilterCard key={filter.id} filter={filter} />
          ))}
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
    </section>
  );
}
