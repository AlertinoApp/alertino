import type { Listing } from "@/types/listings";

export interface ScrapingConfig {
  city: string;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minPrice?: number;
  maxResults?: number;
  propertyType?:
    | "apartment"
    | "house"
    | "room"
    | "studio"
    | "loft"
    | "commercial";
  listingType?: "rent" | "sale";
  minArea?: number;
  maxArea?: number;
}

export interface ScrapingResult {
  listings: Listing[];
  source: string;
  totalFound: number;
  processingTime: number;
  errors: string[];
}

export interface ScraperMetadata {
  name: string;
  baseUrl: string;
  isEnabled: boolean;
  priority: number;
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
  features: {
    supportsPropertyType: boolean;
    supportsListingType: boolean;
    supportsPriceFilter: boolean;
    supportsRoomFilter: boolean;
    supportsLocationFilter: boolean;
    supportsAreaFilter: boolean;
  };
}

export abstract class BaseScraper {
  protected metadata: ScraperMetadata;

  constructor(metadata: ScraperMetadata) {
    this.metadata = metadata;
  }

  abstract scrape(config: ScrapingConfig): Promise<ScrapingResult>;
  abstract buildUrl(config: ScrapingConfig): string;
  abstract parseListings(html: string, config: ScrapingConfig): Listing[];

  protected getRequestHeaders(): Record<string, string> {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    };
  }

  protected async makeRequest(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: this.getRequestHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.text();
    } catch (error) {
      throw error;
    }
  }

  // Metadata getters
  get name(): string {
    return this.metadata.name;
  }
  get isEnabled(): boolean {
    return this.metadata.isEnabled;
  }
  get priority(): number {
    return this.metadata.priority;
  }
  get features() {
    return this.metadata.features;
  }
  get rateLimit() {
    return this.metadata.rateLimit;
  }

  setEnabled(enabled: boolean): void {
    this.metadata.isEnabled = enabled;
  }

  canHandle(config: ScrapingConfig): boolean {
    if (config.propertyType && !this.features.supportsPropertyType)
      return false;
    if (config.listingType && !this.features.supportsListingType) return false;
    if (config.maxPrice && !this.features.supportsPriceFilter) return false;
    if (config.minRooms && !this.features.supportsRoomFilter) return false;
    if (config.minArea && !this.features.supportsAreaFilter) return false;

    return true;
  }
}
