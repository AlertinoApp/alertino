import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function validateSessionAndRedirect() {
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Session validation error:", error);
      redirect("/login");
    }

    if (!user) {
      redirect("/login");
    }

    return user;
  } catch (error) {
    console.error("Unexpected error in session validation:", error);
    redirect("/login");
  }
}

export async function validateSessionSilently() {
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in silent session validation:", error);
    return null;
  }
}

export function sanitizeRedirectUrl(url: string | null): string {
  if (!url) return "/dashboard";

  // Remove any protocol and domain to prevent open redirects
  const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, "");

  // Ensure it starts with /
  if (!cleanUrl.startsWith("/")) {
    return "/dashboard";
  }

  // Prevent redirects to auth pages to avoid loops
  if (cleanUrl.startsWith("/login") || cleanUrl.startsWith("/auth")) {
    return "/dashboard";
  }

  return cleanUrl;
}

export function isSecureRedirect(url: string): boolean {
  // Check if URL is safe for redirects
  const allowedPatterns = [
    /^\/dashboard/,
    /^\/account-settings/,
    /^\/billing/,
    /^\/$/,
  ];

  return allowedPatterns.some((pattern) => pattern.test(url));
}
