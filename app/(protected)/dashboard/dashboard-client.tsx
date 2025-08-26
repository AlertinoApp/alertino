"use client";

import { ActionsSection } from "@/components/dashboard/actions-section";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { FiltersSection } from "@/components/dashboard/filters-section";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { Navbar } from "@/components/common/navbar";
import type { User } from "@supabase/supabase-js";
import type { Subscription, TrialInfo } from "@/types/subscription";
import type { Profile } from "@/types/users";
import type { Filter } from "@/types/filters";
import type { Alert } from "@/types/alerts";

interface DashboardClientProps {
  user: User;
  userData: Profile | null;
  subscription: Subscription | null;
  filters: Filter[];
  activeFilters: Filter[];
  alerts: Alert[];
  activeAlerts: Alert[];
  newAlertsToday: number;
  trialInfo: TrialInfo | null;
  searchesUsedToday: number;
}

export function DashboardClient({
  user,
  userData,
  subscription,
  filters,
  activeFilters,
  alerts,
  activeAlerts,
  newAlertsToday,
  trialInfo,
  searchesUsedToday,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        profile={userData || undefined}
        subscription={subscription || undefined}
        variant="dashboard"
        showNavigation={false}
        currentPage="Dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upgrade Banner */}
          <UpgradeBanner
            filtersCount={filters.length}
            subscription={subscription}
            trialInfo={trialInfo}
            searchesUsedToday={searchesUsedToday}
          />

          {/* Filters Section */}
          <FiltersSection
            filters={filters}
            userId={user.id}
            currentPlan={subscription?.plan || "free"}
            filtersCount={filters.length}
          />

          {/* Actions Section */}
          <ActionsSection
            activeFiltersCount={activeFilters.length}
            totalAlertsCount={activeAlerts.length}
            newAlertsToday={newAlertsToday}
            lastRunDate={null}
            currentPlan={subscription?.plan || "free"}
            searchesUsedToday={searchesUsedToday}
            filters={filters}
          />

          {/* Alerts Section */}
          <AlertsSection alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
