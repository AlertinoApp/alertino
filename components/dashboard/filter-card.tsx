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
          description: `We’ll start monitoring new listings for "${filter.city}" right away.`,
        });
      } else {
        toast("⏸️ Filter deactivated", {
          description: `We’ll stop checking new listings for "${filter.city}".`,
        });
      }
    } catch (error) {
      console.error("Failed to toggle filter status:", error);
      toast("❌ Failed to update filter status", {
        description:
          "Something went wrong while updating this filter. Please try again.",
      });
    }
  };

  return (
    <>
      <Card
        className={`hover:shadow-md transition-all duration-200 ${!isActive ? "opacity-75 bg-gray-50" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
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
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`flex items-center ${!isActive ? "text-gray-500" : "text-gray-700"}`}
            >
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium capitalize">{filter.city}</span>
            </div>

            <div
              className={`flex items-center ${!isActive ? "text-gray-500" : "text-gray-700"}`}
            >
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              <span>Max {filter.max_price.toLocaleString()} PLN</span>
            </div>

            <div
              className={`flex items-center ${!isActive ? "text-gray-500" : "text-gray-700"}`}
            >
              <Home className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                Min {filter.min_rooms} room{filter.min_rooms !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Created {new Date(filter.created_at).toLocaleDateString()}
              </p>
              {!isActive && (
                <p className="text-xs text-orange-600 font-medium">
                  Not monitoring
                </p>
              )}
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
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
