import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { AccountSettingsClient } from "@/components/account-settings/account-settings-client";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

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
    .eq("user_id", session.user.id);

  // Fetch user alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Fetch user subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  const trialInfo = await getTrialInfoAction();
  const filtersCount = filters?.length || 0;
  const alertsCount = alerts?.length || 0;

  const resolvedSearchParams = await searchParams;
  const defaultTab = resolvedSearchParams.tab || "overview";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={session?.user}
        profile={user}
        subscription={subscription}
        variant="dashboard"
        showNavigation={false}
        currentPage="Account Settings"
      />

      <AccountSettingsClient
        user={session.user}
        profile={user}
        subscription={subscription}
        trialInfo={trialInfo}
        filtersCount={filtersCount}
        alertsCount={alertsCount}
        defaultTab={defaultTab}
      />
    </div>
  );
}
