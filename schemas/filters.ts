import { z } from "zod";

export const filterSchema = z.object({
  city: z.string().min(2, "City name is too short"),
  max_price: z
    .number({ invalid_type_error: "Max price must be a number" })
    .min(1, "Max price must be at least 1"),
  min_rooms: z
    .number({ invalid_type_error: "Min rooms must be a number" })
    .min(1, "Must have at least 1 room"),
});
