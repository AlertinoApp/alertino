import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),

  // Email
  RESEND_API_KEY: z.string().min(1, "Resend API key is required"),

  // Optional environment variables
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_NODE_ENV: z.string().optional(),
});

// Parse and validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const errors = parseResult.error.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join("\n");

  throw new Error(`Environment validation failed:\n${errors}`);
}

export const env = parseResult.data;

// Type-safe environment variables
export type Environment = z.infer<typeof envSchema>;
