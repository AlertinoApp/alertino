import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { ActivitySummary } from "@/components/profile/activity-summary";
import { PersonalInformation } from "@/components/profile/personal-information";
import { NotificationSettings } from "@/components/profile/notification-settings";
import { DangerZone } from "@/components/profile/danger-zone";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Navbar } from "@/components/common/navbar";

export default async function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={session?.user}
        profile={user}
        subscription={subscription}
        variant="dashboard"
        showNavigation={false}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ProfileHeader user={session.user} profile={user} />

          <ActivitySummary
            alertsCount={alerts?.length || 0}
            filtersCount={filters?.length || 0}
            lastLogin={session.user.last_sign_in_at}
          />

          <PersonalInformation user={session.user} profile={user} />

          <NotificationSettings profile={user} />

          <DangerZone />
        </div>
      </div>
    </div>
  );
}
