import type { Listing } from "@/types/listings";
import type { Filter } from "@/types/filters";
import {
  BaseScraper,
  ScrapingConfig,
  ScrapingResult,
} from "./interfaces/scraper.interface";
import { OlxScraper } from "./providers/olx.scraper";
import { scrapingCache } from "./utils/cache.utils";
import {
  deduplicateListings,
  delay,
  logScrapingStats,
  filterListings,
} from "./utils/scraper.utils";

export interface AggregatedScrapingResult {
  listings: Listing[];
  sources: string[];
  totalFound: number;
  totalProcessingTime: number;
  errors: string[];
  cacheHit: boolean;
  duplicatesRemoved: number;
}

export class ScraperManager {
  private scrapers: BaseScraper[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    // Add all available scrapers
    this.scrapers = [
      new OlxScraper(), // Medium priority (8)
      // new OtodomScraper(), // Highest priority (9) - uncomment when added
      // new GratkaScraper(), // Low priority (7) - uncomment when added
    ]
      .filter((scraper) => scraper.isEnabled)
      .sort((a, b) => b.priority - a.priority); // Sort by priority descending

    console.log(
      `🔧 Initialized ${this.scrapers.length} scrapers:`,
      this.scrapers.map((s) => `${s.name} (priority: ${s.priority})`)
    );
  }

  /**
   * Main scraping method - used by match.ts
   */
  async scrapeListings(filter: Filter): Promise<Listing[]> {
    const config: ScrapingConfig = {
      city: filter.city,
      maxPrice: filter.max_price,
      minRooms: filter.min_rooms,
      maxResults: 10,
      propertyType: "apartment",
      listingType: "rent",
    };

    const result = await this.scrapeFromAllSources(config);
    return result.listings;
  }

  /**
   * Scrape from all available sources
   */
  async scrapeFromAllSources(
    config: ScrapingConfig
  ): Promise<AggregatedScrapingResult> {
    if (!this.isEnabled) {
      console.log("🚫 Scraping is disabled");
      return this.getEmptyResult("Scraping is disabled");
    }

    // Check cache
    const cacheKey = this.generateCacheKey(config);
    const cachedResult = scrapingCache.get(cacheKey);

    if (cachedResult) {
      console.log(
        `💾 Using cached results for ${config.city} (${cachedResult.length} listings)`
      );
      return {
        listings: cachedResult,
        sources: ["cache"],
        totalFound: cachedResult.length,
        totalProcessingTime: 0,
        errors: [],
        cacheHit: true,
        duplicatesRemoved: 0,
      };
    }

    const startTime = Date.now();
    const allListings: Listing[] = [];
    const sources: string[] = [];
    const allErrors: string[] = [];
    let totalFound = 0;

    console.log(
      `🚀 Starting scraping for ${config.city} with ${this.scrapers.length} sources`
    );

    // Scrape from all sources with controlled delays
    for (let i = 0; i < this.scrapers.length; i++) {
      const scraper = this.scrapers[i];

      // Add delay between scrapers (except first)
      if (i > 0) {
        await delay(scraper.rateLimit.delayBetweenRequests);
      }

      if (!scraper.canHandle(config)) {
        console.log(`⚠️ ${scraper.name} cannot handle this configuration`);
        continue;
      }

      try {
        console.log(`🔍 [${scraper.name}] Starting scrape...`);

        // Add timeout to individual scraper operations
        const scraperPromise = scraper.scrape(config);
        const timeoutPromise = new Promise<ScrapingResult>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Scraper timeout after 30 seconds`)),
            30000
          );
        });

        const result = await Promise.race([scraperPromise, timeoutPromise]);

        if (result.listings.length > 0) {
          allListings.push(...result.listings);
          sources.push(result.source);
          totalFound += result.totalFound;

          console.log(
            `✅ [${scraper.name}] Found ${result.listings.length} listings in ${result.processingTime}ms`
          );
        } else {
          console.log(`ℹ️ [${scraper.name}] No listings found`);
        }

        if (result.errors.length > 0) {
          allErrors.push(...result.errors);
        }
      } catch (error) {
        const errorMsg = `${scraper.name}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ Error scraping ${scraper.name}:`, error);
        allErrors.push(errorMsg);

        // Continue with other scrapers even if one fails
        continue;
      }
    }

    // Process results with error handling
    let processedListings: Listing[] = [];
    let duplicatesRemoved = 0;

    try {
      processedListings = this.processListings(allListings, config);
      duplicatesRemoved = allListings.length - processedListings.length;
    } catch (error) {
      const errorMsg = `Failed to process listings: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`❌ ${errorMsg}`);
      allErrors.push(errorMsg);

      // Fallback to unprocessed listings if processing fails
      processedListings = allListings;
    }

    const totalProcessingTime = Date.now() - startTime;

    // Save to cache if we have results
    if (processedListings.length > 0) {
      try {
        scrapingCache.set(cacheKey, processedListings);
      } catch (error) {
        console.error(`❌ Failed to cache results: ${error}`);
        // Don't add to errors as caching failure shouldn't break the operation
      }
    }

    // Log statistics
    logScrapingStats(
      config.city,
      totalFound,
      processedListings.length,
      duplicatesRemoved,
      totalProcessingTime
    );

    return {
      listings: processedListings,
      sources,
      totalFound,
      totalProcessingTime,
      errors: allErrors,
      cacheHit: false,
      duplicatesRemoved,
    };
  }

  /**
   * Process results - deduplication, filtering, sorting
   */
  private processListings(
    listings: Listing[],
    config: ScrapingConfig
  ): Listing[] {
    if (listings.length === 0) return [];

    console.log(`🔄 Processing ${listings.length} raw listings...`);

    // 1. Deduplication
    let processed = deduplicateListings(listings);

    // 2. Additional filtering (safety)
    processed = filterListings(processed, {
      minPrice: 100, // Minimum 100 PLN
      maxPrice: config.maxPrice,
      minRooms: config.minRooms,
      maxRooms: 15, // Maximum 15 rooms (reasonable limit)
      excludeKeywords: ["spam", "fake", "test"], // Basic exclusion words
    });

    // 3. Sort by price (ascending)
    processed.sort((a, b) => a.price - b.price);

    // 4. Limit results
    if (config.maxResults && processed.length > config.maxResults) {
      processed = processed.slice(0, config.maxResults);
    }

    console.log(`✅ Processed to ${processed.length} final listings`);
    return processed;
  }

  /**
   * Scrape from specific source only
   */
  async scrapeFromSource(
    sourceName: string,
    config: ScrapingConfig
  ): Promise<ScrapingResult> {
    const scraper = this.scrapers.find(
      (s) => s.name.toLowerCase() === sourceName.toLowerCase()
    );

    if (!scraper) {
      throw new Error(
        `Scraper ${sourceName} not found. Available: ${this.getAvailableScrapers().join(", ")}`
      );
    }

    if (!scraper.canHandle(config)) {
      throw new Error(
        `Scraper ${sourceName} cannot handle this configuration. ` +
          `Required features: ${JSON.stringify(config)}`
      );
    }

    console.log(`🎯 Scraping from ${sourceName} only`);
    return await scraper.scrape(config);
  }

  /**
   * Test all scrapers
   */
  async testAllScrapers(
    city: string = "Warszawa"
  ): Promise<Record<string, ScrapingResult>> {
    const config: ScrapingConfig = {
      city,
      maxPrice: 5000,
      maxResults: 3,
      propertyType: "apartment",
      listingType: "rent",
    };

    const results: Record<string, ScrapingResult> = {};

    console.log(`🧪 Testing all scrapers for ${city}...`);

    for (const scraper of this.scrapers) {
      console.log(`\n🔍 Testing ${scraper.name}...`);

      try {
        const startTime = Date.now();
        const result = await scraper.scrape(config);
        const duration = Date.now() - startTime;

        results[scraper.name] = result;

        console.log(
          `✅ ${scraper.name}: ${result.listings.length} listings in ${duration}ms`
        );

        // Show first found listing as example
        if (result.listings.length > 0) {
          const firstListing = result.listings[0];
          console.log(
            `   📋 Example: "${firstListing.title}" - ${firstListing.price} PLN`
          );
        }
      } catch (error) {
        console.error(`❌ ${scraper.name} failed:`, error);
        results[scraper.name] = {
          listings: [],
          source: scraper.name,
          totalFound: 0,
          processingTime: 0,
          errors: [String(error)],
        };
      }

      // Pause between tests
      await delay(2000);
    }

    this.logTestSummary(results);
    return results;
  }

  /**
   * Log test summary
   */
  private logTestSummary(results: Record<string, ScrapingResult>): void {
    console.log("\n📊 Test Results Summary:");
    console.log("========================");

    const totalListings = Object.values(results).reduce(
      (sum, r) => sum + r.listings.length,
      0
    );
    const successfulScrapers = Object.values(results).filter(
      (r) => r.listings.length > 0
    ).length;
    const failedScrapers = Object.values(results).filter(
      (r) => r.errors.length > 0
    ).length;

    for (const [source, result] of Object.entries(results)) {
      const status = result.listings.length > 0 ? "✅" : "❌";
      const errorInfo =
        result.errors.length > 0 ? ` (${result.errors.length} errors)` : "";
      console.log(
        `  ${status} ${source}: ${result.listings.length} listings${errorInfo}`
      );
    }

    console.log("------------------------");
    console.log(`📈 Total listings found: ${totalListings}`);
    console.log(
      `✅ Successful scrapers: ${successfulScrapers}/${this.scrapers.length}`
    );
    console.log(
      `❌ Failed scrapers: ${failedScrapers}/${this.scrapers.length}`
    );
    console.log(
      `📊 Success rate: ${Math.round((successfulScrapers / this.scrapers.length) * 100)}%`
    );
  }

  /**
   * Enable/disable scraping globally
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔧 Scraping globally ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Enable/disable specific scraper
   */
  setScraperEnabled(scraperName: string, enabled: boolean): void {
    const scraper = this.scrapers.find(
      (s) => s.name.toLowerCase() === scraperName.toLowerCase()
    );

    if (scraper) {
      scraper.setEnabled(enabled);
      console.log(`🔧 ${scraperName} ${enabled ? "enabled" : "disabled"}`);
    } else {
      console.warn(`⚠️ Scraper ${scraperName} not found`);
    }
  }

  /**
   * Get information about available scrapers
   */
  getScrapersInfo() {
    return this.scrapers.map((scraper) => ({
      name: scraper.name,
      isEnabled: scraper.isEnabled,
      priority: scraper.priority,
      features: scraper.features,
      rateLimit: scraper.rateLimit,
    }));
  }

  /**
   * Get available scraper names
   */
  getAvailableScrapers(): string[] {
    return this.scrapers.map((s) => s.name);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    scrapingCache.clear();
    console.log("🗑️ Scraping cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return scrapingCache.getStats();
  }

  /**
   * Check manager status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      scrapersCount: this.scrapers.length,
      enabledScrapersCount: this.scrapers.filter((s) => s.isEnabled).length,
      availableScrapers: this.getAvailableScrapers(),
      cacheStats: this.getCacheStats(),
    };
  }

  private generateCacheKey(config: ScrapingConfig): string {
    return [
      config.city,
      config.maxPrice || "no-price",
      config.minRooms || "no-rooms",
      config.propertyType || "apartment",
      config.listingType || "rent",
    ]
      .join("_")
      .toLowerCase();
  }

  private getEmptyResult(reason: string): AggregatedScrapingResult {
    return {
      listings: [],
      sources: [],
      totalFound: 0,
      totalProcessingTime: 0,
      errors: [reason],
      cacheHit: false,
      duplicatesRemoved: 0,
    };
  }
}

// Singleton instance - export ready instance
export const scraperManager = new ScraperManager();
