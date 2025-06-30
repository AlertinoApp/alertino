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

interface Filter {
  id: string;
  city: string;
  max_price: number;
  min_rooms: number;
  created_at: string;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await updateFilterAction(formData);
    setIsSubmitting(false);
    onClose();
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
              defaultValue={filter.city}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_price">Maximum Price (PLN)</Label>
            <Input
              id="max_price"
              name="max_price"
              type="number"
              defaultValue={filter.max_price}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_rooms">Minimum Rooms</Label>
            <Input
              id="min_rooms"
              name="min_rooms"
              type="number"
              defaultValue={filter.min_rooms}
              required
              min="1"
              className="w-full"
            />
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
