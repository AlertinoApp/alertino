// Configuration for filter features and capabilities
export interface FilterFeature {
  id: string;
  name: string;
  description: string;
  type: "basic" | "advanced";
  availableFor: ("free" | "basic" | "pro")[];
}

export const FILTER_FEATURES: FilterFeature[] = [
  // Basic filters (available to all plans)
  {
    id: "city",
    name: "City Selection",
    description: "Choose from major Polish cities",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "listing_type",
    name: "Listing Type",
    description: "For rent or for sale",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "property_type",
    name: "Property Type",
    description: "Apartment, house, room, studio, loft, or commercial",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "price_range",
    name: "Price Range",
    description: "Set minimum and maximum price",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "rooms_range",
    name: "Number of Rooms",
    description: "Set minimum and maximum number of rooms",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "area_range",
    name: "Area Range",
    description: "Set minimum and maximum area in square meters",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "active_status",
    name: "Active Status",
    description: "Enable/disable filter",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
];

// Helper functions
export function getBasicFilters(): FilterFeature[] {
  return FILTER_FEATURES.filter((feature) => feature.type === "basic");
}

export function getAdvancedFilters(): FilterFeature[] {
  return FILTER_FEATURES.filter((feature) => feature.type === "advanced");
}

export function getFiltersForPlan(
  plan: "free" | "basic" | "pro"
): FilterFeature[] {
  return FILTER_FEATURES.filter((feature) =>
    feature.availableFor.includes(plan)
  );
}

export function canAccessFeature(
  featureId: string,
  plan: "free" | "basic" | "pro"
): boolean {
  const feature = FILTER_FEATURES.find((f) => f.id === featureId);
  return feature ? feature.availableFor.includes(plan) : false;
}

export function getFeatureUpgradeMessage(featureId: string): string {
  const feature = FILTER_FEATURES.find((f) => f.id === featureId);
  if (!feature) return "Feature not found";

  if (feature.type === "advanced") {
    return `Upgrade to Basic or Pro to access ${feature.name}`;
  }

  return "Feature available on all plans";
}
