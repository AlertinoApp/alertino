export interface Filter {
  id: string;
  user_id: string;
  is_active: boolean;
  city: string;
  listing_type: "rent" | "sale";
  property_type:
    | "apartment"
    | "house"
    | "room"
    | "studio"
    | "loft"
    | "commercial";
  min_price: number;
  max_price: number;
  min_rooms: number;
  max_rooms: number;
  min_area: number;
  max_area: number;

  name: string;
  created_at: string;
}
