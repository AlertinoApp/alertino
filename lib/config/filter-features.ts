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
    id: "price_range",
    name: "Price Range",
    description: "Set minimum and maximum price",
    type: "basic",
    availableFor: ["free", "basic", "pro"],
  },
  {
    id: "rooms",
    name: "Number of Rooms",
    description: "Minimum number of rooms",
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

  // Advanced filters (available to Basic and Pro plans)
  {
    id: "all_cities",
    name: "All Cities",
    description: "Access to all Polish cities, not just major ones",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "detailed_price",
    name: "Detailed Price Filtering",
    description: "Price per square meter, utilities included/excluded",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "property_type",
    name: "Property Type",
    description: "Apartment, house, studio, etc.",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "floor",
    name: "Floor Number",
    description: "Specific floor or floor range",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "building_age",
    name: "Building Age",
    description: "New construction, renovated, etc.",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "furnished",
    name: "Furnished Status",
    description: "Furnished, partially furnished, unfurnished",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "parking",
    name: "Parking",
    description: "Parking space availability",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "balcony",
    name: "Balcony/Terrace",
    description: "Balcony or terrace availability",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "elevator",
    name: "Elevator",
    description: "Elevator availability",
    type: "advanced",
    availableFor: ["basic", "pro"],
  },
  {
    id: "custom_keywords",
    name: "Custom Keywords",
    description: "Search for specific keywords in listings",
    type: "advanced",
    availableFor: ["basic", "pro"],
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
