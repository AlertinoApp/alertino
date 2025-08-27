export interface Alert {
  id: string;
  title: string;
  price: number;
  rooms: number;
  city: string;
  link: string;
  created_at: string;
  status?: "active" | "not_interested" | "expired";
  filter_id?: string | null;
  is_favorite?: boolean;
  listing_type: "rent" | "sale";
  property_type:
    | "apartment"
    | "house"
    | "room"
    | "studio"
    | "loft"
    | "commercial";
  area: number;
  filters?: {
    id: string;
    name: string;
  } | null;
}
