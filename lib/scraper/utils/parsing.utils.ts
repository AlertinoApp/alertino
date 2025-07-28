import type { Listing } from "@/types/listings";

/**
 * Normalizuje i parsuje cenę z tekstu
 */
export function parsePrice(priceText: string): number {
  if (!priceText) return 0;

  // Usuń wszystkie znaki poza cyframi
  const cleaned = priceText.replace(/[^\d]/g, "");
  const price = parseInt(cleaned) || 0;

  // Walidacja rozsądnych granic cen (10 PLN - 50,000 PLN)
  if (price < 10 || price > 50000) return 0;

  return price;
}

/**
 * Wyciąga liczbę pokoi z tekstu
 */
export function extractRoomsFromText(text: string): number {
  if (!text) return 2; // domyślnie 2 pokoje

  const lowerText = text.toLowerCase();

  // Polskie wzorce
  const polishPatterns = [
    /(\d+)\s*pokoi?/i,
    /(\d+)\s*pok/i,
    /(\d+)-pokojow/i,
    /(\d+)\s*pokojowe/i,
    /mieszkanie\s*(\d+)\s*pokojowe/i,
    /(\d+)\s*-\s*pokojowe/i,
    /(\d+)pok/i,
  ];

  // Angielskie wzorce (dla niektórych serwisów)
  const englishPatterns = [/(\d+)\s*room/i, /(\d+)\s*bedroom/i, /(\d+)\s*br/i];

  const allPatterns = [...polishPatterns, ...englishPatterns];

  for (const pattern of allPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const rooms = parseInt(match[1]);
      if (rooms >= 1 && rooms <= 10) {
        // Rozsądny zakres
        return rooms;
      }
    }
  }

  // Sprawdź czy to kawalerka/studio
  if (lowerText.includes("kawalerka") || lowerText.includes("studio")) {
    return 1;
  }

  // Domyślnie zwróć 2 pokoje
  return 2;
}

/**
 * Waliduje obiekt listing
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
 * Normalizuje tekst (usuwa polskie znaki, spacje itp.)
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
 * Sprawdza czy tekst zawiera słowa kluczowe wykluczające (reklamy, itp.)
 */
export function containsExcludedKeywords(text: string): boolean {
  const excludedKeywords = [
    "reklama",
    "advertisement",
    "promowane",
    "sponsored",
    "zaktualizowane",
    "odświeżone",
  ];

  const lowerText = text.toLowerCase();
  return excludedKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Czyści i formatuje tytuł ogłoszenia
 */
export function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ") // Usuń podwójne spacje
    .replace(/^[^\w\s]*/, "") // Usuń znaki specjalne z początku
    .replace(/[^\w\s]*$/, "") // Usuń znaki specjalne z końca
    .substring(0, 150); // Ogranicz długość
}

/**
 * Wyciąga powierzchnię z tekstu (w m²)
 */
export function extractArea(text: string): number | null {
  if (!text) return null;

  const areaPatterns = [
    /(\d+(?:[.,]\d+)?)\s*m²/i,
    /(\d+(?:[.,]\d+)?)\s*m2/i,
    /(\d+(?:[.,]\d+)?)\s*metr/i,
    /powierzchnia[:\s]*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*mkw/i,
  ];

  for (const pattern of areaPatterns) {
    const match = text.match(pattern);
    if (match) {
      const area = parseFloat(match[1].replace(",", "."));
      if (area > 10 && area < 1000) {
        // Rozsądny zakres
        return Math.round(area);
      }
    }
  }

  return null;
}

/**
 * Wyciąga piętro z tekstu
 */
export function extractFloor(text: string): string | null {
  if (!text) return null;

  const floorPatterns = [
    /piętro[:\s]*(\d+)/i,
    /(\d+)\s*piętro/i,
    /parter/i,
    /(\d+)\s*p\./i,
  ];

  const lowerText = text.toLowerCase();

  // Sprawdź parter
  if (lowerText.includes("parter")) {
    return "parter";
  }

  for (const pattern of floorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const floor = parseInt(match[1]);
      if (floor >= 0 && floor <= 50) {
        return floor.toString();
      }
    }
  }

  return null;
}
