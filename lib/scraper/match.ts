// lib/scraper/match.ts

import { Filter } from "@/types/filters";
import type { Listing } from "@/types/listings";
import { scraperManager } from "./scraper.manager";
import { normalize } from "../utils";
import { exampleListings } from "../data/example-listings";

// Flaga do przełączania między trybem testowym a prawdziwym scrapowaniem
const USE_REAL_SCRAPING = true;

export async function getMatchedListings(filter: Filter): Promise<Listing[]> {
  console.log(
    `🔍 Getting matched listings for ${filter.city} (Real scraping: ${USE_REAL_SCRAPING})`
  );

  if (USE_REAL_SCRAPING) {
    try {
      // Użyj ScraperManager do scrapowania z wszystkich źródeł
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

      // Fallback do danych testowych w przypadku błędu
      return getExampleMatchedListings(filter);
    }
  } else {
    // Użyj danych testowych
    console.log(`🧪 Using example data for testing`);
    return getExampleMatchedListings(filter);
  }
}

/**
 * Oryginalna funkcja z danymi testowymi
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
 * Funkcja pomocnicza do ręcznego testowania scrapera
 */
export async function testRealScraping(
  city: string,
  maxPrice: number,
  minRooms: number
): Promise<Listing[]> {
  console.log(`🧪 Testing real scraping for ${city}`);

  const testFilter: Filter = {
    id: "test",
    user_id: "test-user",
    is_active: true,
    city,
    max_price: maxPrice,
    min_rooms: minRooms,
    created_at: new Date().toISOString(),
  };

  // Tymczasowo włącz prawdziwe scrapowanie
  const originalEnv = process.env.USE_REAL_SCRAPING;
  process.env.USE_REAL_SCRAPING = "true";

  try {
    const results = await getMatchedListings(testFilter);
    console.log(`📊 Test results for ${city}:`, results);
    return results;
  } finally {
    // Przywróć oryginalne ustawienie
    if (originalEnv === undefined) {
      delete process.env.USE_REAL_SCRAPING;
    } else {
      process.env.USE_REAL_SCRAPING = originalEnv;
    }
  }
}

/**
 * Testuje wszystkie dostępne scrapers
 */
export async function testAllScrapers(city: string = "Warszawa") {
  console.log(`🧪 Testing all scrapers for ${city}...`);

  const results = await scraperManager.testAllScrapers(city);

  console.log("📊 Test Results Summary:");
  for (const [source, result] of Object.entries(results)) {
    console.log(
      `  ${source}: ${result.listings.length} listings, ${result.errors.length} errors`
    );
  }

  return results;
}

/**
 * Scrapuje tylko z określonego źródła (do debugowania)
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
 * Funkcje zarządzania scraperem
 */
export const scraperControls = {
  // Włącz/wyłącz scraping globalnie
  setEnabled: (enabled: boolean) => scraperManager.setEnabled(enabled),

  // Włącz/wyłącz konkretny scraper
  setScraperEnabled: (name: string, enabled: boolean) =>
    scraperManager.setScraperEnabled(name, enabled),

  // Pobierz informacje o scraperach
  getScrapersInfo: () => scraperManager.getScrapersInfo(),

  // Wyczyść cache
  clearCache: () => scraperManager.clearCache(),

  // Testuj wszystkie scrapers
  testAll: (city?: string) => scraperManager.testAllScrapers(city),
};
