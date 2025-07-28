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
} from "../utils/parsing.utils";

export class OlxScraper extends BaseScraper {
  private readonly cityUrlMap: Record<string, string> = {
    Warszawa: "warszawa",
    Krakow: "krakow",
    Gdansk: "gdansk",
    Poznan: "poznan",
    Wroclaw: "wroclaw",
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
    const cityUrl = this.cityUrlMap[config.city] || config.city.toLowerCase();

    // Bazowy URL dla kategorii
    let url = `${this.metadata.baseUrl}/nieruchomosci/`;

    // Typ nieruchomości
    if (config.propertyType === "apartment") {
      url += "mieszkania/";
    } else if (config.propertyType === "house") {
      url += "domy/";
    } else {
      url += "mieszkania/"; // domyślnie mieszkania
    }

    // Typ ogłoszenia
    if (config.listingType === "rent") {
      url += "wynajem/";
    } else if (config.listingType === "sale") {
      url += "sprzedaz/";
    } else {
      url += "wynajem/"; // domyślnie wynajem
    }

    // Miasto
    url += `${cityUrl}/`;

    // Parametry filtrowania
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

  parseListings(html: string, config: ScrapingConfig): Listing[] {
    const $ = cheerio.load(html);
    const listings: Listing[] = [];

    // Selektory dla różnych wersji OLX
    const listingSelectors = [
      '[data-cy="l-card"]',
      ".css-1sw7q4x",
      '[data-testid="l-card"]',
      ".offer-wrapper",
    ];

    let $listings: cheerio.Cheerio;

    // Znajdź działające selektory
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
        return false; // Przerwij gdy osiągniemy limit
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
    // Tytuł
    const title = this.extractTitle($listing);
    if (!title) return null;

    // Cena
    const priceText = this.extractPrice($listing);
    const price = parsePrice(priceText);
    if (price === 0) return null;

    // Link
    const link = this.extractLink($listing);
    if (!link) return null;

    // Liczba pokoi z tytułu
    const rooms = extractRoomsFromText(title);

    return {
      title,
      price,
      link,
      city: config.city,
      rooms,
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
          // Upewnij się, że link jest pełnym URL
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
