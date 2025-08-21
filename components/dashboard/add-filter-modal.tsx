"use client";

import { useEffect, useState } from "react";
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
import { getSubscriptionConfig } from "@/lib/stripe/plans";
import { Badge } from "@/components/ui/badge";

interface AddFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPlan?: "free" | "basic" | "pro";
  filtersCount?: number;
}

export function AddFilterModal({
  isOpen,
  onClose,
  userId,
  currentPlan = "free",
  filtersCount = 0,
}: AddFilterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    max_price: "",
    min_rooms: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    city?: string;
    max_price?: string;
    min_rooms?: string;
  }>({});

  // Get subscription limits
  const subscriptionConfig = getSubscriptionConfig(currentPlan);
  const maxFilters = subscriptionConfig.limits.filtersLimit;
  const isAtLimit = maxFilters !== -1 && filtersCount >= maxFilters;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const parsed = filterSchema.safeParse({
      name: formData.name || `Filter ${filtersCount + 1}`,
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
      serverData.append("name", formData.name || `Filter ${filtersCount + 1}`);
      serverData.append("city", formData.city);
      serverData.append("max_price", formData.max_price);
      serverData.append("min_rooms", formData.min_rooms);

      await addFilterAction(serverData);
      toast.dismiss(loadingToast);
      toast("✅ Filter added", {
        description: "Your new filter is active and ready to find apartments.",
      });

      onClose();
      setFormData({ name: "", city: "", max_price: "", min_rooms: "" });
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

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setFormData({ name: "", city: "", max_price: "", min_rooms: "" });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Filter</DialogTitle>
          {maxFilters !== -1 && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {filtersCount}/{maxFilters} filters used
              </Badge>
              {isAtLimit && (
                <Badge variant="destructive" className="text-xs">
                  Limit reached
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-2">
            <Label htmlFor="name">Filter Name (Optional)</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={`e.g. ${filtersCount + 1 > 1 ? `Warsaw ${filtersCount + 1}` : "Warsaw Apartments"}`}
              className={`w-full ${errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate a name
            </p>
          </div>

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
              className={`w-full ${errors.city ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.city && (
              <p className="text-destructive text-sm">{errors.city}</p>
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
              className={`w-full ${errors.max_price ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.max_price && (
              <p className="text-destructive text-sm">{errors.max_price}</p>
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
              className={`w-full ${errors.min_rooms ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.min_rooms && (
              <p className="text-destructive text-sm">{errors.min_rooms}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAtLimit}
              className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 ${isAtLimit ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
            >
              {isSubmitting
                ? "Adding..."
                : isAtLimit
                  ? "Limit Reached"
                  : "Add Filter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
