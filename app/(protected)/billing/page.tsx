import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { BillingOverview } from "@/components/billing/billing-overview";
import { PlanComparison } from "@/components/billing/plan-comparison";
import { Navbar } from "@/components/common/navbar";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Loading components for better perceived performance
function BillingOverviewSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-200 rounded-lg"></div>
            <div className="h-20 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-12 bg-slate-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanComparisonSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-12 bg-slate-200 rounded-lg"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const trialInfo = await getTrialInfoAction();
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Billing & Subscription
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your subscription, billing, and usage
              </p>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-0">
            <div className="lg:hidden">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="overview" className="text-sm">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="plans" className="text-sm">
                    Plans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <Suspense fallback={<BillingOverviewSkeleton />}>
                    <BillingOverview
                      subscription={subscription}
                      filtersCount={filtersCount}
                      trialDaysRemaining={trialInfo.daysRemaining}
                      hasUsedTrial={trialInfo.hasUsedTrial}
                      isTrialActive={trialInfo.isActive}
                    />
                  </Suspense>
                </TabsContent>

                <TabsContent value="plans" className="mt-0">
                  <Suspense fallback={<PlanComparisonSkeleton />}>
                    <PlanComparison
                      user={session?.user}
                      subscription={subscription}
                      isTrialActive={trialInfo.isActive}
                      trialDaysRemaining={trialInfo.daysRemaining}
                      hasUsedTrial={trialInfo.hasUsedTrial}
                      trialPlan={subscription?.plan}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2">
                <Suspense fallback={<BillingOverviewSkeleton />}>
                  <BillingOverview
                    subscription={subscription}
                    filtersCount={filtersCount}
                    trialDaysRemaining={trialInfo.daysRemaining}
                    hasUsedTrial={trialInfo.hasUsedTrial}
                    isTrialActive={trialInfo.isActive}
                  />
                </Suspense>
              </div>

              <div className="lg:col-span-1">
                <Suspense fallback={<PlanComparisonSkeleton />}>
                  <PlanComparison
                    user={session?.user}
                    subscription={subscription}
                    isTrialActive={trialInfo.isActive}
                    trialDaysRemaining={trialInfo.daysRemaining}
                    hasUsedTrial={trialInfo.hasUsedTrial}
                    trialPlan={subscription?.plan}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
