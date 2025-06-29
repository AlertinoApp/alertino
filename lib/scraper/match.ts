import type { Listing } from "@/types/listings";
import type { UserFilter } from "@/types/filters";

export function matchListingsToFilter(
  listings: Listing[],
  filter: UserFilter
): Listing[] {
  return listings.filter(
    (l) => l.price <= filter.max_price && l.rooms >= filter.min_rooms
  );
}
