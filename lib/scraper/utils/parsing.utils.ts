import type { Listing } from "@/types/listings";

/**
 * Normalize and parse price from text
 */
export function parsePrice(priceText: string): number {
  if (!priceText) return 0;

  const cleaned = priceText.replace(/[^\d]/g, "");
  const price = parseInt(cleaned) || 0;

  // Validate reasonable price range (10 PLN - 50,000 PLN)
  if (price < 10 || price > 50000) return 0;

  return price;
}

/**
 * Extract number of rooms from text
 */
export function extractRoomsFromText(text: string): number {
  if (!text) return 2;

  const lowerText = text.toLowerCase();

  // Polish patterns
  const polishPatterns = [
    /(\d+)\s*pokoi?/i,
    /(\d+)\s*pok/i,
    /(\d+)-pokojow/i,
    /(\d+)\s*pokojowe/i,
    /mieszkanie\s*(\d+)\s*pokojowe/i,
    /(\d+)\s*-\s*pokojowe/i,
    /(\d+)pok/i,
  ];

  // English patterns
  const englishPatterns = [/(\d+)\s*room/i, /(\d+)\s*bedroom/i, /(\d+)\s*br/i];

  const allPatterns = [...polishPatterns, ...englishPatterns];

  for (const pattern of allPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const rooms = parseInt(match[1]);
      if (rooms >= 1 && rooms <= 10) {
        return rooms;
      }
    }
  }

  // Check if it's a studio apartment
  if (lowerText.includes("kawalerka") || lowerText.includes("studio")) {
    return 1;
  }

  // Default to 2 rooms
  return 2;
}

/**
 * Validate listing object
 */
export function validateListing(listing: Partial<Listing>): listing is Listing {
  return Boolean(
    listing.title &&
      listing.price &&
      listing.link &&
      listing.city &&
      listing.rooms &&
      listing.title.length > 3 &&
      listing.title.length < 200 &&
      listing.price > 0 &&
      listing.price < 50000 &&
      listing.rooms > 0 &&
      listing.rooms <= 20 &&
      listing.link.startsWith("http") &&
      listing.city.length > 1
  );
}

/**
 * Normalize text (remove Polish characters, spaces, etc.)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Clean and format listing title
 */
export function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ") // Remove double spaces
    .replace(/^[^\w\s]*/, "") // Remove special characters from beginning
    .replace(/[^\w\s]*$/, "") // Remove special characters from end
    .substring(0, 150); // Limit length
}
