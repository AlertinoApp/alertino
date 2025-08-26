import { createClientForServer } from "@/app/utils/supabase/server";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";
import { getTodaySearchCount } from "@/lib/actions/search-tracking-actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Fetch user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user filters
  const { data: filters } = await supabase
    .from("filters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: activeFilters } = await supabase
    .from("filters")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Fetch user alerts with filter information
  const { data: alerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      filters (
        id,
        name,
        city
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter out expired alerts for active counts
  const activeAlerts =
    alerts?.filter((alert) => alert.status !== "expired") || [];
  const newAlertsToday =
    activeAlerts.filter((alert) => new Date(alert.created_at) >= today)
      .length || 0;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const trialInfo = await getTrialInfoAction();
  const searchesUsedToday = await getTodaySearchCount(user.id);

  return (
    <DashboardClient
      user={user}
      userData={userData}
      subscription={subscription}
      filters={filters || []}
      activeFilters={activeFilters || []}
      alerts={alerts || []}
      activeAlerts={activeAlerts}
      newAlertsToday={newAlertsToday}
      trialInfo={trialInfo}
      searchesUsedToday={searchesUsedToday}
    />
  );
}
