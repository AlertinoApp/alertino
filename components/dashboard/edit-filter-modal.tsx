"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateFilterAction } from "@/lib/actions/filter-actions";
import { Filter } from "@/types/filters";
import { filterSchema } from "@/schemas/filters";

interface EditFilterModalProps {
  filter: Filter;
  isOpen: boolean;
  onClose: () => void;
}

export function EditFilterModal({
  filter,
  isOpen,
  onClose,
}: EditFilterModalProps) {
  const [formData, setFormData] = useState({
    city: filter.city || "",
    max_price: filter.max_price.toString(),
    min_rooms: filter.min_rooms.toString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    city?: string;
    max_price?: string;
    min_rooms?: string;
  }>({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const parsed = filterSchema.safeParse({
      city: formData.city,
      max_price: Number(formData.max_price),
      min_rooms: Number(formData.min_rooms),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });

      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const serverData = new FormData();
      serverData.append("filterId", filter.id);
      serverData.append("city", formData.city);
      serverData.append("max_price", formData.max_price);
      serverData.append("min_rooms", formData.min_rooms);

      await updateFilterAction(serverData);
      onClose();
    } catch (error) {
      console.error("Failed to update filter:", error);
      setErrors({ city: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Filter</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="filterId" value={filter.id} />

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              className={`w-full ${errors.city ? "border-red-500 focus-visible:ring-red-300" : ""}`}
            />

            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_price">Maximum Price (PLN)</Label>
            <Input
              id="max_price"
              name="max_price"
              type="number"
              value={formData.max_price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, max_price: e.target.value }))
              }
              className={`w-full ${errors.max_price ? "border-red-500 focus-visible:ring-red-300" : ""}`}
            />

            {errors.max_price && (
              <p className="text-red-500 text-sm">{errors.max_price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_rooms">Minimum Rooms</Label>
            <Input
              id="min_rooms"
              name="min_rooms"
              type="number"
              value={formData.min_rooms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, min_rooms: e.target.value }))
              }
              min="1"
              className={`w-full ${errors.min_rooms ? "border-red-500 focus-visible:ring-red-300" : ""}`}
            />

            {errors.min_rooms && (
              <p className="text-red-500 text-sm">{errors.min_rooms}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update Filter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
