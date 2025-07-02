import { createClientForServer } from "@/app/utils/supabase/server";
import { ActionsSection } from "@/components/dashboard/actions-section";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { FiltersSection } from "@/components/dashboard/filters-section";
import { Header } from "@/components/common/header";

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

  // Fetch user alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} profile={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Manage your apartment alerts and filters
            </p>
          </div>

          <FiltersSection filters={filters || []} userId={session.user.id} />

          <AlertsSection alerts={alerts || []} />

          <ActionsSection />
        </div>
      </div>
    </div>
  );
}
