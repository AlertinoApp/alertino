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
import { addFilterAction } from "@/lib/actions/filter-actions";
import { filterSchema } from "@/schemas/filters";
import { toast } from "sonner";

interface AddFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function AddFilterModal({
  isOpen,
  onClose,
  userId,
}: AddFilterModalProps) {
  const [formData, setFormData] = useState({
    city: "",
    max_price: "",
    min_rooms: "",
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
      toast("❌ Validation error", {
        description: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    const loadingToast = toast.loading("Adding new filter...", {
      description: "Saving your criteria to start finding apartments.",
    });

    try {
      const serverData = new FormData();
      serverData.append("userId", userId);
      serverData.append("city", formData.city);
      serverData.append("max_price", formData.max_price);
      serverData.append("min_rooms", formData.min_rooms);

      await addFilterAction(serverData);
      toast.dismiss(loadingToast);
      toast("✅ Filter added", {
        description: "Your new filter is active and ready to find apartments.",
      });

      onClose();
      setFormData({ city: "", max_price: "", min_rooms: "" });
    } catch (error) {
      console.error("Failed to add filter:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to add filter", {
        description:
          "Something went wrong while saving your filter. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Filter</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="e.g. Warszawa"
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
              placeholder="e.g. 3000"
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
              placeholder="e.g. 2"
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
              {isSubmitting ? "Adding..." : "Add Filter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
