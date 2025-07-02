import { Filter } from "@/types/filters";
import type { Listing } from "@/types/listings";
import { exampleListings } from "./olx";
import { normalize } from "../utils";

export async function getMatchedListings(filter: Filter): Promise<Listing[]> {
  return exampleListings.filter(
    (l) =>
      normalize(l.city) === normalize(filter.city) &&
      l.price <= filter.max_price &&
      l.rooms >= filter.min_rooms
  );
}
