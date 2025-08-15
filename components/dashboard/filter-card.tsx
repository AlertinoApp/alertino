"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, MapPin, DollarSign, Home } from "lucide-react";
import { EditFilterModal } from "./edit-filter-modal";
import { DeleteFilterDialog } from "./delete-filter-modal";
import { toggleFilterStatus } from "@/lib/actions/filter-actions";
import { toast } from "sonner";
import { Filter } from "@/types/filters";

interface FilterCardProps {
  filter: Filter;
}

export function FilterCard({ filter }: FilterCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isActive, setIsActive] = useState(filter.is_active ?? true);

  const handleToggleStatus = async (checked: boolean) => {
    setIsToggling(true);

    try {
      await toggleFilterStatus(filter.id, checked);
      setIsActive(checked);

      if (checked) {
        toast("🎯 Filter activated!", {
          description: `We'll start monitoring new listings for "${filter.city}" right away.`,
        });
      } else {
        toast("⏸️ Filter deactivated", {
          description: `We'll stop checking new listings for "${filter.city}".`,
        });
      }
    } catch (error) {
      console.error("Failed to toggle filter status:", error);
      toast("❌ Failed to update filter status", {
        description:
          "Something went wrong while updating this filter. Please try again.",
      });
      // Revert the optimistic update
      setIsActive(!checked);
    } finally {
      // Always reset loading state
      setIsToggling(false);
    }
  };

  return (
    <>
      <Card
        className={`hover:shadow-md transition-all duration-200 bg-card ${!isActive ? "opacity-75 bg-muted" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                }
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isToggling}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isToggling}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                disabled={isToggling}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`flex items-center ${!isActive ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <span className="font-semibold text-lg">{filter.name}</span>
            </div>

            <div
              className={`flex items-center ${!isActive ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span className="font-medium capitalize">{filter.city}</span>
            </div>

            <div
              className={`flex items-center ${!isActive ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span>Max {filter.max_price.toLocaleString()} PLN</span>
            </div>

            <div
              className={`flex items-center ${!isActive ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <Home className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span>
                Min {filter.min_rooms} room{filter.min_rooms !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created {new Date(filter.created_at).toLocaleDateString()}
              </p>
              {isToggling ? (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                  Updating...
                </p>
              ) : !isActive ? (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Not monitoring
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditFilterModal
        filter={filter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <DeleteFilterDialog
        filterId={filter.id}
        filterName={filter.name}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
