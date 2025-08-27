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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateFilterAction } from "@/lib/actions/filter-actions";
import { Filter } from "@/types/filters";
import { filterSchema } from "@/schemas/filters";
import { toast } from "sonner";
import { getAllCityNames } from "@/lib/data/cities";

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
    name: filter.name || "",
    city: filter.city || "",
    listing_type: filter.listing_type || "rent",
    property_type: filter.property_type || "apartment",
    min_price: filter.min_price?.toString() || "",
    max_price: filter.max_price?.toString() || "",
    min_rooms: filter.min_rooms?.toString() || "",
    max_rooms: filter.max_rooms?.toString() || "",
    min_area: filter.min_area?.toString() || "",
    max_area: filter.max_area?.toString() || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    city?: string;
    listing_type?: string;
    property_type?: string;
    min_price?: string;
    max_price?: string;
    min_rooms?: string;
    max_rooms?: string;
    min_area?: string;
    max_area?: string;
  }>({});

  // Get cities for MultiSelect
  const cities = getAllCityNames();
  const cityOptions = cities.map((city) => ({ label: city, value: city }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const parsed = filterSchema.safeParse({
      name: formData.name,
      city: formData.city,
      listing_type: formData.listing_type as "rent" | "sale",
      property_type: formData.property_type as
        | "apartment"
        | "house"
        | "room"
        | "studio"
        | "loft"
        | "commercial",
      min_price: Number(formData.min_price),
      max_price: Number(formData.max_price),
      min_rooms: Number(formData.min_rooms),
      max_rooms: Number(formData.max_rooms),
      min_area: Number(formData.min_area),
      max_area: Number(formData.max_area),
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

    const loadingToast = toast.loading("Updating filter...", {
      description: "Applying your changes to this filter.",
    });

    try {
      const serverData = new FormData();
      serverData.append("filterId", filter.id);
      serverData.append("name", formData.name);
      serverData.append("city", formData.city);
      serverData.append("listing_type", formData.listing_type);
      serverData.append("property_type", formData.property_type);
      serverData.append("min_price", formData.min_price);
      serverData.append("max_price", formData.max_price);
      serverData.append("min_rooms", formData.min_rooms);
      serverData.append("max_rooms", formData.max_rooms);
      serverData.append("min_area", formData.min_area);
      serverData.append("max_area", formData.max_area);

      await updateFilterAction(serverData);
      toast.dismiss(loadingToast);
      toast("✅ Filter updated", {
        description: "Your filter has been successfully updated.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update filter:", error);
      toast.dismiss(loadingToast);
      toast("❌ Update failed", {
        description: "An error occurred while updating. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setFormData({
        name: filter.name || "",
        city: filter.city || "",
        listing_type: filter.listing_type || "rent",
        property_type: filter.property_type || "apartment",
        min_price: filter.min_price?.toString() || "",
        max_price: filter.max_price?.toString() || "",
        min_rooms: filter.min_rooms?.toString() || "",
        max_rooms: filter.max_rooms?.toString() || "",
        min_area: filter.min_area?.toString() || "",
        max_area: filter.max_area?.toString() || "",
      });
    }
  }, [isOpen, filter]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Filter</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="filterId" value={filter.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Filter Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`w-full ${errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, city: value }))
                }
              >
                <SelectTrigger
                  className={`w-full ${errors.city ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-destructive text-sm">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listing_type">Listing Type *</Label>
              <Select
                value={formData.listing_type}
                onValueChange={(value: "rent" | "sale") =>
                  setFormData((prev) => ({ ...prev, listing_type: value }))
                }
              >
                <SelectTrigger
                  className={`w-full ${errors.listing_type ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
              {errors.listing_type && (
                <p className="text-destructive text-sm">
                  {errors.listing_type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(
                  value:
                    | "apartment"
                    | "house"
                    | "room"
                    | "studio"
                    | "loft"
                    | "commercial"
                ) => {
                  setFormData((prev) => ({
                    ...prev,
                    property_type: value,
                  }));
                }}
              >
                <SelectTrigger
                  className={`w-full ${errors.property_type ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              {errors.property_type && (
                <p className="text-destructive text-sm">
                  {errors.property_type}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Minimum Price (PLN) *</Label>
              <Input
                id="min_price"
                name="min_price"
                type="number"
                min={1}
                value={formData.min_price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    min_price: e.target.value,
                  }))
                }
                placeholder="e.g. 1000"
                className={`w-full ${errors.min_price ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.min_price && (
                <p className="text-destructive text-sm">{errors.min_price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_price">Maximum Price (PLN) *</Label>
              <Input
                id="max_price"
                name="max_price"
                type="number"
                value={formData.max_price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_price: e.target.value,
                  }))
                }
                placeholder="e.g. 3000"
                min="1"
                className={`w-full ${errors.max_price ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.max_price && (
                <p className="text-destructive text-sm">{errors.max_price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_rooms">Minimum Rooms *</Label>
              <Input
                id="min_rooms"
                name="min_rooms"
                type="number"
                value={formData.min_rooms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    min_rooms: e.target.value,
                  }))
                }
                placeholder="e.g. 2"
                min="1"
                className={`w-full ${errors.min_rooms ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.min_rooms && (
                <p className="text-destructive text-sm">{errors.min_rooms}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_rooms">Maximum Rooms *</Label>
              <Input
                id="max_rooms"
                name="max_rooms"
                type="number"
                value={formData.max_rooms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_rooms: e.target.value,
                  }))
                }
                placeholder="e.g. 4"
                min="1"
                className={`w-full ${errors.max_rooms ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.max_rooms && (
                <p className="text-destructive text-sm">{errors.max_rooms}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_area">Minimum Area (m²) *</Label>
              <Input
                id="min_area"
                name="min_area"
                type="number"
                min={1}
                value={formData.min_area}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    min_area: e.target.value,
                  }))
                }
                placeholder="e.g. 30"
                className={`w-full ${errors.min_area ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.min_area && (
                <p className="text-destructive text-sm">{errors.min_area}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_area">Maximum Area (m²) *</Label>
              <Input
                id="max_area"
                name="max_area"
                type="number"
                value={formData.max_area}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_area: e.target.value,
                  }))
                }
                placeholder="e.g. 80"
                min="1"
                className={`w-full ${errors.max_area ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.max_area && (
                <p className="text-destructive text-sm">{errors.max_area}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? "Updating..." : "Update Filter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
