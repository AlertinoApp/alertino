"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MapPin, DollarSign, Home } from "lucide-react";
import { deleteFilterAction } from "@/lib/actions/filter-actions";
import { EditFilterModal } from "./edit-filter-modal";

interface Filter {
  id: string;
  city: string;
  max_price: number;
  min_rooms: number;
  created_at: string;
}

interface FilterCardProps {
  filter: Filter;
}

export function FilterCard({ filter }: FilterCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this filter?")) {
      setIsDeleting(true);
      await deleteFilterAction(filter.id);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Active
            </Badge>
            <div className="flex space-x-2">
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium capitalize">{filter.city}</span>
            </div>

            <div className="flex items-center text-gray-700">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              <span>Max {filter.max_price.toLocaleString()} PLN</span>
            </div>

            <div className="flex items-center text-gray-700">
              <Home className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                Min {filter.min_rooms} room{filter.min_rooms !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Created {new Date(filter.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <EditFilterModal
        filter={filter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
