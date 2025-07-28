import { Filter } from "@/types/filters";
import type { Listing } from "@/types/listings";
import { scraperManager } from "./scraper.manager";
import { normalize } from "../utils";
import { exampleListings } from "../data/example-listings";

// Flag to switch between test mode and real scraping
const USE_REAL_SCRAPING = process.env.NEXT_PUBLIC_NODE_ENV === "production";

export async function getMatchedListings(filter: Filter): Promise<Listing[]> {
  console.log(
    `🔍 Getting matched listings for ${filter.city} (Real scraping: ${USE_REAL_SCRAPING})`
  );

  if (USE_REAL_SCRAPING) {
    try {
      // Use ScraperManager to scrape from all sources
      console.log(`🌐 Scraping real data for ${filter.city} from all sources`);

      const listings = await scraperManager.scrapeListings(filter);

      console.log(
        `✅ Found ${listings.length} matching listings from real sources`
      );
      return listings;
    } catch (error) {
      console.error(
        `❌ Error scraping real data, falling back to example data:`,
        error
      );

      // Fallback to test data in case of error
      return getExampleMatchedListings(filter);
    }
  } else {
    // Use test data
    console.log(`🧪 Using example data for testing`);
    return getExampleMatchedListings(filter);
  }
}

/**
 * Original function with test data
 */
function getExampleMatchedListings(filter: Filter): Listing[] {
  return exampleListings.filter(
    (l) =>
      normalize(l.city) === normalize(filter.city) &&
      l.price <= filter.max_price &&
      l.rooms >= filter.min_rooms
  );
}

/**
 * Test specific source (for debugging)
 */
export async function scrapeFromSpecificSource(
  source: string,
  city: string,
  maxPrice?: number,
  minRooms?: number
) {
  console.log(`🎯 Scraping only from ${source} for ${city}`);

  const config = {
    city,
    maxPrice,
    minRooms,
    maxResults: 10,
    propertyType: "apartment" as const,
    listingType: "rent" as const,
  };

  return await scraperManager.scrapeFromSource(source, config);
}

/**
 * Scraper management functions
 */
export const scraperControls = {
  // Enable/disable scraping globally
  setEnabled: (enabled: boolean) => scraperManager.setEnabled(enabled),

  // Enable/disable specific scraper
  setScraperEnabled: (name: string, enabled: boolean) =>
    scraperManager.setScraperEnabled(name, enabled),

  // Get scraper information
  getScrapersInfo: () => scraperManager.getScrapersInfo(),

  // Clear cache
  clearCache: () => scraperManager.clearCache(),

  // Test all scrapers
  testAll: (city?: string) => scraperManager.testAllScrapers(city),
};
