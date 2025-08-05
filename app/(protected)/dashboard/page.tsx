// app/dashboard/page.tsx - Clean and organized layout

import { createClientForServer } from "@/app/utils/supabase/server";
import { ActionsSection } from "@/components/dashboard/actions-section";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { FiltersSection } from "@/components/dashboard/filters-section";
import { SearchStats } from "@/components/dashboard/search-stats";
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

  // Fetch user alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Calculate analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newAlertsToday =
    alerts?.filter((alert) => new Date(alert.created_at) >= today).length || 0;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  const trialInfo = await getTrialInfoAction();
  const searchesUsedToday = await getTodaySearchCount(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={session?.user}
        profile={user}
        subscription={subscription}
        variant="dashboard"
        showNavigation={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Manage your apartment alerts and search filters
            </p>
          </div>

          {/* Upgrade Banner */}
          <UpgradeBanner
            filtersCount={filters?.length || 0}
            subscription={subscription}
            trialInfo={trialInfo}
          />

          {/* Filters Section */}
          <FiltersSection
            filters={filters || []}
            userId={session.user.id}
            currentPlan={subscription?.plan || "free"}
            filtersCount={filters?.length || 0}
          />

          {/* Search Stats */}
          <SearchStats
            currentPlan={subscription?.plan || "free"}
            searchesUsedToday={searchesUsedToday}
          />

          {/* Actions Section */}
          <ActionsSection
            activeFiltersCount={activeFilters?.length || 0}
            totalAlertsCount={alerts?.length || 0}
            newAlertsToday={newAlertsToday}
            lastRunDate={null}
            currentPlan={subscription?.plan || "free"}
            searchesUsedToday={searchesUsedToday}
          />

          {/* Alerts Section */}
          <AlertsSection alerts={alerts || []} />
        </div>
      </div>
    </div>
  );
}
