import { createClient } from "@supabase/supabase-js";
import { stripe } from "./config";
import type { Subscription } from "@/types/subscription";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
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
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function updateSubscription(
  subscription: Partial<Subscription> & {
    user_id: string;
    stripe_subscription_id: string;
  }
): Promise<void> {
  const updateData = {
    ...subscription,
    updated_at: new Date().toISOString(),
  };

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

export async function getUserIdByStripeCustomer(
  customerId: string
): Promise<string | null> {
  const { data: subRecord } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  return subRecord?.user_id || null;
}

export async function syncSubscriptionFromStripe(
  customerId: string
): Promise<void> {
  try {
    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      expand: ["data.items.data.price"],
    });

    if (subscriptions.data.length === 0) {
      console.log("No subscriptions found for customer:", customerId);
      return;
    }

    const subscription = subscriptions.data[0];
    const userId = await getUserIdByStripeCustomer(customerId);

    if (!userId) {
      console.error("No user found for customer:", customerId);
      return;
    }

    console.log("Syncing subscription from Stripe:", {
      subscriptionId: subscription.id,
      userId,
      status: subscription.status,
    });

    // Process the subscription update
    const { processSubscriptionUpdate } = await import(
      "./subscription-processor"
    );
    await processSubscriptionUpdate(subscription, userId, customerId);

    console.log("Successfully synced subscription from Stripe");
  } catch (error) {
    console.error("Error syncing subscription from Stripe:", error);
    throw error;
  }
}
