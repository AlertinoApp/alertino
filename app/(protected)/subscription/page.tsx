import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/common/header";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { PlanLimits } from "@/components/subscription/plan-limits";
import { BillingHistory } from "@/components/subscription/billing-history";
import { SuccessToast } from "@/components/subscription/success-toast";

export default async function SubscriptionPage() {
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

  const filtersCount = filters?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} profile={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription
            </h1>
            <p className="text-gray-600">
              Manage your subscription and billing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SubscriptionCard
              currentPlan={user?.plan || "free"}
              subscriptionStatus={user?.subscription_status || "inactive"}
              currentPeriodEnd={user?.current_period_end}
              isPaid={user?.is_paid || false}
            />

            <PlanLimits
              currentPlan={user?.plan || "free"}
              filtersCount={filtersCount}
            />
          </div>

          <BillingHistory stripeCustomerId={user?.stripe_customer_id} />
        </div>
      </div>

      <SuccessToast />
    </div>
  );
}
