"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { getEnhancedSubscriptionConfig } from "@/lib/stripe/plans";
import { revalidatePath } from "next/cache";

export interface SearchLimitResult {
  canSearch: boolean;
  searchesUsed: number;
  searchesLimit: number;
  searchesRemaining: number;
  limitExceeded: boolean;
}

/**
 * Get the current search count for a user for today
 */
export async function getTodaySearchCount(userId: string): Promise<number> {
  const supabase = await createClientForServer();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const { data, error } = await supabase
    .from("search_logs")
    .select("searches_count")
    .eq("user_id", userId)
    .eq("search_date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error fetching search count:", error);
    return 0;
  }

  return data?.searches_count || 0;
}

/**
 * Check if a user can perform a search based on their plan limits
 */
export async function checkSearchLimit(
  userId: string
): Promise<SearchLimitResult> {
  const supabase = await createClientForServer();

  // Get user's subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const currentPlan =
    (subscription?.plan as "free" | "basic" | "pro") || "free";
  const config = getEnhancedSubscriptionConfig(currentPlan);
  const searchesLimit = config.limits.searchesPerDay;

  // Get today's search count
  const searchesUsed = await getTodaySearchCount(userId);
  const searchesRemaining = Math.max(0, searchesLimit - searchesUsed);
  const canSearch = searchesUsed < searchesLimit;
  const limitExceeded = searchesUsed >= searchesLimit;

  return {
    canSearch,
    searchesUsed,
    searchesLimit,
    searchesRemaining,
    limitExceeded,
  };
}

/**
 * Increment the search count for a user for today
 */
export async function incrementSearchCount(
  userId: string,
  count: number = 1
): Promise<void> {
  const supabase = await createClientForServer();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // Try to update existing record first
  const { data: existing } = await supabase
    .from("search_logs")
    .select("id, searches_count")
    .eq("user_id", userId)
    .eq("search_date", today)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("search_logs")
      .update({
        searches_count: existing.searches_count + count,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating search count:", error);
      throw new Error("Failed to update search count");
    }
  } else {
    // Create new record
    const { error } = await supabase.from("search_logs").insert({
      user_id: userId,
      search_date: today,
      searches_count: count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating search log:", error);
      throw new Error("Failed to create search log");
    }
  }

  revalidatePath("/dashboard");
}

/**
 * Get search statistics for a user (last 7 days)
 */
export async function getSearchStats(userId: string): Promise<{
  today: number;
  weekTotal: number;
  dailyStats: Array<{ date: string; count: number }>;
}> {
  const supabase = await createClientForServer();

  // Get last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  const { data, error } = await supabase
    .from("search_logs")
    .select("search_date, searches_count")
    .eq("user_id", userId)
    .gte("search_date", startDate.toISOString().split("T")[0])
    .lte("search_date", endDate.toISOString().split("T")[0])
    .order("search_date", { ascending: true });

  if (error) {
    console.error("Error fetching search stats:", error);
    return { today: 0, weekTotal: 0, dailyStats: [] };
  }

  const today = new Date().toISOString().split("T")[0];
  const todayCount =
    data?.find((d) => d.search_date === today)?.searches_count || 0;
  const weekTotal = data?.reduce((sum, d) => sum + d.searches_count, 0) || 0;

  // Fill in missing days with 0
  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const count =
      data?.find((d) => d.search_date === dateStr)?.searches_count || 0;
    dailyStats.push({ date: dateStr, count });
  }

  return { today: todayCount, weekTotal, dailyStats };
}

/**
 * Reset search count for a user (admin function)
 */
export async function resetSearchCount(
  userId: string,
  date?: string
): Promise<void> {
  const supabase = await createClientForServer();
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("search_logs")
    .delete()
    .eq("user_id", userId)
    .eq("search_date", targetDate);

  if (error) {
    console.error("Error resetting search count:", error);
    throw new Error("Failed to reset search count");
  }

  revalidatePath("/dashboard");
}
