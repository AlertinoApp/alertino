import { stripe } from "./config";
import { createClientForServer } from "@/app/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type StripeType from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubscriptionWithPeriodEnd extends StripeType.Subscription {
  current_period_end: number;
}

export async function handleSubscriptionChange(
  subscription: StripeType.Subscription
) {
  const s = subscription as SubscriptionWithPeriodEnd;
  const subscriptionId = s.id;
  const status = s.status;
  const plan = s.items.data[0].price.nickname || "unknown";

  const { data: subRecord, error } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (error || !subRecord) {
    console.error("User not found for subscription:", subscriptionId);
    return;
  }

  await supabaseAdmin
    .from("subscriptions")
    .update({
      plan,
      status,
      current_period_end: new Date(s.current_period_end * 1000),
      updated_at: new Date(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  console.log(`Subscription updated for user ${subRecord.user_id}`);
}

export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const supabase = await createClientForServer();

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;

    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: userId },
    subscription_data: {
      metadata: { user_id: userId },
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
