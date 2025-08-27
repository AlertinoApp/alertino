import type { Listing } from "@/types/listings";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function deduplicateListings(listings: Listing[]): Listing[] {
  const seen = new Set<string>();
  const unique: Listing[] = [];

  for (const listing of listings) {
    const normalizedLink = normalizeUrl(listing.link);

    if (!seen.has(normalizedLink)) {
      seen.add(normalizedLink);
      unique.push(listing);
    }
  }

  console.log(`🔄 Removed ${listings.length - unique.length} duplicates`);
  return unique;
}

export function filterListings(
  listings: Listing[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRooms?: number;
    maxRooms?: number;
    minArea?: number;
    maxArea?: number;
    propertyType?: string;
    listingType?: string;
    excludeKeywords?: string[];
  }
): Listing[] {
  return listings.filter((listing) => {
    // Price filtering
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;

    // Room filtering
    if (filters.minRooms && listing.rooms < filters.minRooms) return false;
    if (filters.maxRooms && listing.rooms > filters.maxRooms) return false;

    // Area filtering
    if (filters.minArea && listing.area < filters.minArea) return false;
    if (filters.maxArea && listing.area > filters.maxArea) return false;

    // Property type filtering
    if (filters.propertyType && listing.property_type !== filters.propertyType)
      return false;

    // Listing type filtering
    if (filters.listingType && listing.listing_type !== filters.listingType)
      return false;

    // Keyword exclusion
    const titleLower = listing.title.toLowerCase();
    if (filters.excludeKeywords) {
      for (const keyword of filters.excludeKeywords) {
        if (titleLower.includes(keyword.toLowerCase())) return false;
      }
    }

    return true;
  });
}

export function logScrapingStats(
  city: string,
  totalFound: number,
  validListings: number,
  duplicatesRemoved: number,
  timeMs: number
): void {
  const successRate =
    totalFound > 0 ? Math.round((validListings / totalFound) * 100) : 0;

  console.log(`
📊 Scraping Stats for ${city}:
  ⏱️  Time taken: ${timeMs}ms
  🔍 Total found: ${totalFound}
  ✅ Valid listings: ${validListings}
  🔄 Duplicates removed: ${duplicatesRemoved}
  📈 Success rate: ${successRate}%
  📦 Final count: ${validListings}
  `);
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "fbclid",
      "gclid",
    ];
    trackingParams.forEach((param) => urlObj.searchParams.delete(param));

    return urlObj.toString();
  } catch {
    return url;
  }
}
