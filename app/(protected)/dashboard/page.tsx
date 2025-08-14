// app/dashboard/page.tsx - Clean and organized layout

import { createClientForServer } from "@/app/utils/supabase/server";
import { ActionsSection } from "@/components/dashboard/actions-section";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { FiltersSection } from "@/components/dashboard/filters-section";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { Navbar } from "@/components/common/navbar";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";
import { getTodaySearchCount } from "@/lib/actions/search-tracking-actions";

export default async function DashboardPage() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // Fetch user data
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // Fetch user filters
  const { data: filters } = await supabase
    .from("filters")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: activeFilters } = await supabase
    .from("filters")
    .select("*")
    .eq("user_id", session.user.id)
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
    .eq("user_id", session.user.id)
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
    .eq("user_id", session.user.id)
    .single();

  const trialInfo = await getTrialInfoAction();
  const searchesUsedToday = await getTodaySearchCount(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={session?.user}
        profile={user}
        subscription={subscription}
        variant="dashboard"
        showNavigation={false}
        currentPage="Dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upgrade Banner */}
          <UpgradeBanner
            filtersCount={filters?.length || 0}
            subscription={subscription}
            trialInfo={trialInfo}
            searchesUsedToday={searchesUsedToday}
          />

          {/* Filters Section */}
          <FiltersSection
            filters={filters || []}
            userId={session.user.id}
            currentPlan={subscription?.plan || "free"}
            filtersCount={filters?.length || 0}
          />

          {/* Actions Section */}
          <ActionsSection
            activeFiltersCount={activeFilters?.length || 0}
            totalAlertsCount={activeAlerts.length}
            newAlertsToday={newAlertsToday}
            lastRunDate={null}
            currentPlan={subscription?.plan || "free"}
            searchesUsedToday={searchesUsedToday}
            filters={filters || []}
          />

          {/* Alerts Section */}
          <AlertsSection alerts={alerts || []} />
        </div>
      </div>
    </div>
  );
}
