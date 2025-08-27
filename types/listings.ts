export interface Listing {
  title: string;
  price: number;
  link: string;
  city: string;
  rooms: number;
  listing_type: "rent" | "sale";
  property_type:
    | "apartment"
    | "house"
    | "room"
    | "studio"
    | "loft"
    | "commercial";
  area: number;
}
