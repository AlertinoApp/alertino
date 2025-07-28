// lib/scraper/scraper.manager.ts

import type { Listing } from "@/types/listings";
import type { Filter } from "@/types/filters";
import {
  BaseScraper,
  ScrapingConfig,
  ScrapingResult,
} from "./interfaces/scraper.interface";
import { OlxScraper } from "./providers/olx.scraper";
// import { OtodomScraper } from "./providers/otodom.scraper";
// import { GratkaScraper } from "./providers/gratka.scraper"; // Odkomentuj gdy dodasz
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
    // Dodaj wszystkie dostępne scrapers
    this.scrapers = [
      // new OtodomScraper(), // Najwyższy priorytet (9)
      new OlxScraper(), // Średni priorytet (8)
      // new GratkaScraper(), // Niski priorytet (7) - odkomentuj gdy dodasz
    ]
      .filter((scraper) => scraper.isEnabled)
      .sort((a, b) => b.priority - a.priority); // Sortuj po priorytecie malejąco

    console.log(
      `🔧 Initialized ${this.scrapers.length} scrapers:`,
      this.scrapers.map((s) => `${s.name} (priority: ${s.priority})`)
    );
  }

  /**
   * Główna metoda do scrapowania - używana przez match.ts
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
   * Scrapuje z wszystkich dostępnych źródeł
   */
  async scrapeFromAllSources(
    config: ScrapingConfig
  ): Promise<AggregatedScrapingResult> {
    if (!this.isEnabled) {
      console.log("🚫 Scraping is disabled");
      return this.getEmptyResult("Scraping is disabled");
    }

    // Sprawdź cache
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

    // Scrapuj ze wszystkich źródeł z kontrolowanymi opóźnieniami
    for (let i = 0; i < this.scrapers.length; i++) {
      const scraper = this.scrapers[i];

      // Dodaj opóźnienie między scraperami (oprócz pierwszego)
      if (i > 0) {
        await delay(scraper.rateLimit.delayBetweenRequests);
      }

      if (!scraper.canHandle(config)) {
        console.log(`⚠️ ${scraper.name} cannot handle this configuration`);
        continue;
      }

      try {
        console.log(`🔍 [${scraper.name}] Starting scrape...`);

        const result = await scraper.scrape(config);

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
        const errorMsg = `${scraper.name}: ${String(error)}`;
        console.error(`❌ Error scraping ${scraper.name}:`, error);
        allErrors.push(errorMsg);
      }
    }

    // Przetwórz wyniki
    const processedListings = this.processListings(allListings, config);
    const duplicatesRemoved = allListings.length - processedListings.length;
    const totalProcessingTime = Date.now() - startTime;

    // Zapisz w cache jeśli mamy wyniki
    if (processedListings.length > 0) {
      scrapingCache.set(cacheKey, processedListings);
    }

    // Loguj statystyki
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
   * Przetwarzanie wyników - deduplikacja, filtrowanie, sortowanie
   */
  private processListings(
    listings: Listing[],
    config: ScrapingConfig
  ): Listing[] {
    if (listings.length === 0) return [];

    console.log(`🔄 Processing ${listings.length} raw listings...`);

    // 1. Deduplikacja
    let processed = deduplicateListings(listings);

    // 2. Dodatkowe filtrowanie (bezpieczeństwo)
    processed = filterListings(processed, {
      minPrice: 100, // Minimum 100 PLN
      maxPrice: config.maxPrice,
      minRooms: config.minRooms,
      maxRooms: 15, // Maksimum 15 pokoi (rozsądny limit)
      excludeKeywords: ["spam", "fake", "test"], // Podstawowe słowa do wykluczenia
    });

    // 3. Sortowanie według ceny (rosnąco)
    processed.sort((a, b) => a.price - b.price);

    // 4. Limit wyników
    if (config.maxResults && processed.length > config.maxResults) {
      processed = processed.slice(0, config.maxResults);
    }

    console.log(`✅ Processed to ${processed.length} final listings`);
    return processed;
  }

  /**
   * Scrapuje tylko z określonego źródła
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
   * Testuje wszystkie scrapers
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

        // Pokaż pierwsze znalezione ogłoszenie jako przykład
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

      // Pauza między testami
      await delay(2000);
    }

    this.logTestSummary(results);
    return results;
  }

  /**
   * Loguje podsumowanie testów
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
   * Włącza/wyłącza scraping globalnie
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔧 Scraping globally ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Włącza/wyłącza konkretny scraper
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
   * Zwraca informacje o dostępnych scraperach
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
   * Zwraca nazwy dostępnych scraperów
   */
  getAvailableScrapers(): string[] {
    return this.scrapers.map((s) => s.name);
  }

  /**
   * Czyści cache
   */
  clearCache(): void {
    scrapingCache.clear();
    console.log("🗑️ Scraping cache cleared");
  }

  /**
   * Zwraca statystyki cache
   */
  getCacheStats() {
    return scrapingCache.getStats();
  }

  /**
   * Sprawdza status managera
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

// Singleton instance - eksportuj gotową instancję
export const scraperManager = new ScraperManager();
