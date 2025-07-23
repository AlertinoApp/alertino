import { createClient } from "@supabase/supabase-js";
import type { SubscriptionStatus } from "@/types/subscription";
import type { SubscriptionData } from "./types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserSubscription(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: subscription, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return subscription;
}

export async function createSubscriptionRecord(data: {
  userId: string;
  stripeCustomerId: string;
}): Promise<void> {
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: data.userId,
      stripe_customer_id: data.stripeCustomerId,
      plan: "free",
      status: "incomplete" as SubscriptionStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function updateSubscription(
  data: SubscriptionData
): Promise<void> {
  const updateData = {
    user_id: data.userId,
    stripe_subscription_id: data.stripeSubscriptionId,
    plan: data.plan,
    status: data.status,
    interval: data.interval,
    current_period_start: data.currentPeriodStart,
    current_period_end: data.currentPeriodEnd,
    trial_start: data.trialStart,
    trial_end: data.trialEnd,
    trial_used: data.trialUsed,
    cancel_at_period_end: data.cancelAtPeriodEnd,
    canceled_at: data.canceledAt,
    updated_at: new Date().toISOString(),
    ...(data.stripeCustomerId && { stripe_customer_id: data.stripeCustomerId }),
  };

  console.log("Updating subscription:", {
    userId: data.userId,
    subscriptionId: data.stripeSubscriptionId,
    status: data.status,
    plan: data.plan,
    trialUsed: data.trialUsed,
  });

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(updateData, { onConflict: "user_id" });

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function getUserIdByStripeSubscription(
  subscriptionId: string
): Promise<string | null> {
  const { data: subRecord } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  return subRecord?.user_id || null;
}
