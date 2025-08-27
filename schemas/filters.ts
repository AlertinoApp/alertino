import { z } from "zod";

export const filterSchema = z
  .object({
    city: z.string().min(1, "Please select a city"),
    listing_type: z.enum(["rent", "sale"], {
      required_error: "Please select listing type",
    }),
    property_type: z.enum(
      ["apartment", "house", "room", "studio", "loft", "commercial"],
      {
        required_error: "Please select property type",
      }
    ),
    min_price: z
      .number({ invalid_type_error: "Min price must be a number" })
      .min(1, "Min price must be at least 1"),
    max_price: z
      .number({ invalid_type_error: "Max price must be a number" })
      .min(1, "Max price must be at least 1"),
    min_rooms: z
      .number({ invalid_type_error: "Min rooms must be a number" })
      .min(1, "Must have at least 1 room"),
    max_rooms: z
      .number({ invalid_type_error: "Max rooms must be a number" })
      .min(1, "Must have at least 1 room"),
    min_area: z
      .number({ invalid_type_error: "Min area must be a number" })
      .min(1, "Min area must be at least 1"),
    max_area: z
      .number({ invalid_type_error: "Max area must be a number" })
      .min(1, "Max area must be at least 1"),

    name: z
      .string()
      .min(1, "Filter name is required")
      .max(50, "Filter name must be less than 50 characters"),
  })
  .refine((data) => data.min_price <= data.max_price, {
    message: "Min price cannot be greater than max price",
    path: ["min_price"],
  })
  .refine((data) => data.min_rooms <= data.max_rooms, {
    message: "Min rooms cannot be greater than max rooms",
    path: ["min_rooms"],
  })
  .refine((data) => data.min_area <= data.max_area, {
    message: "Min area cannot be greater than max area",
    path: ["min_area"],
  });
