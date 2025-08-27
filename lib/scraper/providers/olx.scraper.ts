import * as cheerio from "cheerio";
import type { Listing } from "@/types/listings";
import {
  BaseScraper,
  ScrapingConfig,
  ScrapingResult,
  ScraperMetadata,
} from "../interfaces/scraper.interface";
import {
  parsePrice,
  extractRoomsFromText,
  validateListing,
  normalizeText,
} from "../utils/parsing.utils";

export class OlxScraper extends BaseScraper {
  private readonly cityUrlMap: Record<string, string> = {
    Warszawa: "warszawa",
    Kraków: "krakow",
    Krakow: "krakow",
    Gdańsk: "gdansk",
    Gdansk: "gdansk",
    Poznań: "poznan",
    Poznan: "poznan",
    Wrocław: "wroclaw",
    Wroclaw: "wroclaw",
    Łódź: "lodz",
    Lodz: "lodz",
    Katowice: "katowice",
    Szczecin: "szczecin",
    Bydgoszcz: "bydgoszcz",
    Lublin: "lublin",
  };

  constructor() {
    const metadata: ScraperMetadata = {
      name: "OLX",
      baseUrl: "https://www.olx.pl",
      isEnabled: true,
      priority: 8,
      rateLimit: {
        requestsPerMinute: 30,
        delayBetweenRequests: 2000,
      },
      features: {
        supportsPropertyType: true,
        supportsListingType: true,
        supportsPriceFilter: true,
        supportsRoomFilter: true,
        supportsLocationFilter: true,
        supportsAreaFilter: false,
      },
    };

    super(metadata);
  }

  async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let listings: Listing[] = [];

    try {
      console.log(`🔍 [OLX] Starting scrape for ${config.city}`);

      const url = this.buildUrl(config);
      console.log(`🔗 [OLX] URL: ${url}`);

      const html = await this.makeRequest(url);
      listings = this.parseListings(html, config);

      console.log(`✅ [OLX] Successfully scraped ${listings.length} listings`);
    } catch (error) {
      const errorMsg = `Failed to scrape OLX: ${error}`;
      console.error(`❌ [OLX] ${errorMsg}`);
      errors.push(errorMsg);
    }

    const processingTime = Date.now() - startTime;

    return {
      listings,
      source: "OLX",
      totalFound: listings.length,
      processingTime,
      errors,
    };
  }

  buildUrl(config: ScrapingConfig): string {
    // Proper URL encoding for Polish cities
    const cityUrl = this.getCityUrlSafe(config.city);

    // Base URL for category
    let url = `${this.metadata.baseUrl}/nieruchomosci/`;

    // Property type
    if (config.propertyType === "apartment") {
      url += "mieszkania/";
    } else if (config.propertyType === "house") {
      url += "domy/";
    } else {
      url += "mieszkania/";
    }

    if (config.listingType === "rent") {
      url += "wynajem/";
    } else if (config.listingType === "sale") {
      url += "sprzedaz/";
    } else {
      url += "wynajem/";
    }

    url += `${cityUrl}/`;

    const params = new URLSearchParams();

    if (config.maxPrice) {
      params.append(
        "search[filter_float_price:to]",
        config.maxPrice.toString()
      );
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Get URL-safe city name with proper Polish character handling
   */
  private getCityUrlSafe(city: string): string {
    // First try direct mapping
    if (this.cityUrlMap[city]) {
      return this.cityUrlMap[city];
    }

    // Fallback: normalize the city name for URL
    return normalizeText(city);
  }

  parseListings(html: string, config: ScrapingConfig): Listing[] {
    const $ = cheerio.load(html);
    const listings: Listing[] = [];

    // Selectors for different versions of OLX
    const listingSelectors = [
      '[data-cy="l-card"]',
      ".css-1sw7q4x",
      '[data-testid="l-card"]',
      ".offer-wrapper",
    ];

    let $listings: cheerio.Cheerio;

    // Find working selectors
    for (const selector of listingSelectors) {
      $listings = $(selector);
      if ($listings.length > 0) {
        console.log(`✅ [OLX] Found listings with selector: ${selector}`);
        break;
      }
    }

    if (!$listings! || $listings!.length === 0) {
      console.log(
        `⚠️ [OLX] No listings found. Page structure might have changed.`
      );
      return [];
    }

    console.log(`📋 [OLX] Found ${$listings!.length} potential listings`);

    $listings!.each((index: number, element: cheerio.Element) => {
      if (listings.length >= (config.maxResults || 10)) {
        return false; // Stop when limit reached
      }

      try {
        const listing = this.parseListingElement($, $(element), config);
        if (listing && validateListing(listing)) {
          listings.push(listing);
          console.log(
            `✅ [OLX] Parsed: ${listing.title} - ${listing.price} PLN`
          );
        }
      } catch (error) {
        console.warn(`⚠️ [OLX] Failed to parse listing:`, error);
      }
    });

    return listings;
  }

  private parseListingElement(
    $: cheerio.Root,
    $listing: cheerio.Cheerio,
    config: ScrapingConfig
  ): Listing | null {
    // Title
    const title = this.extractTitle($listing);
    if (!title) return null;

    // Price
    const priceText = this.extractPrice($listing);
    const price = parsePrice(priceText);
    if (price === 0) return null;

    // Link
    const link = this.extractLink($listing);
    if (!link) return null;

    // Number of rooms from title
    const rooms = extractRoomsFromText(title);

    return {
      title,
      price,
      link,
      city: config.city,
      rooms,
      listing_type: config.listingType || "rent",
      property_type: config.propertyType || "apartment",
      area: 50,
    };
  }

  private extractTitle($listing: cheerio.Cheerio): string {
    const titleSelectors = [
      'h6[data-cy="l-card-title"]',
      ".css-16v5mdi h6",
      '[data-cy="l-card-title"]',
      "h6",
      ".title",
      "h4",
      "h3",
    ];

    for (const selector of titleSelectors) {
      const title = $listing.find(selector).text().trim();
      if (title) return title;
    }

    return "";
  }

  private extractPrice($listing: cheerio.Cheerio): string {
    const priceSelectors = [
      '[data-testid="ad-price"]',
      ".css-10b0gli",
      '[data-cy="ad-price"]',
      ".price",
      ".amount",
    ];

    for (const selector of priceSelectors) {
      const price = $listing.find(selector).text().trim();
      if (price) return price;
    }

    return "";
  }

  private extractLink($listing: cheerio.Cheerio): string {
    const linkSelectors = [
      'a[data-cy="l-card-title"]',
      "a",
      '[data-cy="l-card-title"] a',
    ];

    for (const selector of linkSelectors) {
      const $link = $listing.find(selector);
      if ($link.length > 0) {
        let link = $link.attr("href") || "";
        if (link) {
          // Ensure complete URL
          if (link.startsWith("/")) {
            link = this.metadata.baseUrl + link;
          }
          return link;
        }
      }
    }

    return "";
  }
}
