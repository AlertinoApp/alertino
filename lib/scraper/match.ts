import { Filter } from "@/types/filters";
import type { Listing } from "@/types/listings";

export function matchListingsToFilter(
  listings: Listing[],
  filter: Filter
): Listing[] {
  return listings.filter(
    (l) => l.price <= filter.max_price && l.rooms >= filter.min_rooms
  );
}
