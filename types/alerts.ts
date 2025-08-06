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
  filters?: {
    id: string;
    name: string;
    city: string;
  } | null;
}
