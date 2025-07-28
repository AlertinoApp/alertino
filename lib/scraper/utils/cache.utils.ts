import type { Listing } from "@/types/listings";

interface CacheEntry {
  listings: Listing[];
  timestamp: number;
  expiresAt: number;
}

export class ScrapingCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum 100 entries

  get(key: string): Listing[] | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`💾 Cache hit for key: ${key}`);
    return entry.listings;
  }

  set(key: string, listings: Listing[]): void {
    // Remove old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanOldEntries();
    }

    const now = Date.now();

    this.cache.set(key, {
      listings,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    });

    console.log(`💾 Cached ${listings.length} listings for key: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    console.log("💾 Cache cleared");
  }

  getStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.values()).filter(
      (entry) => now <= entry.expiresAt
    );

    const totalListings = validEntries.reduce(
      (sum, entry) => sum + entry.listings.length,
      0
    );

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      totalListings,
      averageListingsPerEntry:
        validEntries.length > 0
          ? Math.round(totalListings / validEntries.length)
          : 0,
    };
  }

  private cleanOldEntries(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    // Delete expired records
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        entriesToDelete.push(key);
      }
    }

    if (this.cache.size - entriesToDelete.length >= this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .filter(([key]) => !entriesToDelete.includes(key))
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const extraEntries = sortedEntries.slice(0, this.MAX_CACHE_SIZE / 2);
      entriesToDelete.push(...extraEntries.map(([key]) => key));
    }

    entriesToDelete.forEach((key) => this.cache.delete(key));

    console.log(`🗑️ Cleaned ${entriesToDelete.length} old cache entries`);
  }
}

export const scrapingCache = new ScrapingCache();
