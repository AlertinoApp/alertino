import type { Listing } from "@/types/listings";

export async function scrapeOlx(city: string): Promise<Listing[]> {
  return [
    {
      title: `Nice flat in ${city} center`,
      price: 2500,
      link: "https://www.olx.pl/example1",
      city,
      rooms: 3,
    },
    {
      title: `Cheap studio in ${city}`,
      price: 1800,
      link: "https://www.olx.pl/example2",
      city,
      rooms: 3,
    },
  ];
}
