import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { BillingOverview } from "@/components/billing/billing-overview";
import { PlanComparison } from "@/components/billing/plan-comparison";
import { Navbar } from "@/components/common/navbar";
import { SubscriptionAlerts } from "@/components/subscription/subscription-alert";

export default async function BillingPage() {
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

  // Fetch filters count
  const { data: filters } = await supabase
    .from("filters")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("is_active", true);

  // Fetch user subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  const filtersCount = filters?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
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
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Billing & Subscription
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your subscription, billing, and usage
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <SubscriptionAlerts />

              <BillingOverview
                subscription={subscription}
                filtersCount={filtersCount}
              />
            </div>
            <>
              {/* Only show plan comparison for free users */}
              <PlanComparison
                user={session?.user}
                subscription={subscription}
              />
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
