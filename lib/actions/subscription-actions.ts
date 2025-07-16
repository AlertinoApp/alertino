"use server";

import {
  createCheckoutSession,
  createCustomerPortalSession,
  getUserSubscription,
  hasActiveSubscription,
  updateSubscriptionPlan,
  cancelSubscriptionAtPeriodEnd,
} from "@/lib/stripe/helpers";
import { redirect } from "next/navigation";
import { createClientForServer } from "@/app/utils/supabase/server";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
} from "@/types/subscription";

export async function createCheckoutSessionAction(priceId: string) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Validate price ID
  if (!priceId) {
    throw new Error("Price ID is required");
  }

  // Check if user already has an active subscription
  const isActive = await hasActiveSubscription(session.user.id);
  if (isActive) {
    // Redirect to billing instead of creating new checkout
    redirect("/billing?error=already_subscribed");
  }

  const checkoutSession = await createCheckoutSession({
    priceId,
    userId: session.user.id,
    userEmail: session.user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}

export async function switchSubscriptionPlanAction(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Get current subscription
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.stripe_subscription_id) {
    throw new Error("No active subscription found");
  }

  // Check if this is actually a change
  if (subscription.plan === plan && subscription.interval === interval) {
    redirect("/billing?error=same_plan");
    return;
  }

  // Handle free plan differently - just cancel the subscription
  if (plan === "free") {
    await cancelSubscriptionAtPeriodEnd(subscription.stripe_subscription_id);
    redirect("/billing?success=downgrade_scheduled");
    return;
  }

  // Handle paid plans - update subscription
  await updateSubscriptionPlan(
    subscription.stripe_subscription_id,
    plan,
    interval
  );

  // Redirect with success message
  redirect("/billing?success=plan_changed");
}

export async function createPortalSessionAction() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Get subscription data
  const subscription = await getUserSubscription(userId);

  if (!subscription?.stripe_customer_id) {
    // If no customer ID, redirect to pricing
    redirect("/pricing?error=no_subscription");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await createCustomerPortalSession(
    subscription.stripe_customer_id,
    `${baseUrl}/billing`
  );

  if (!portalSession.url) {
    throw new Error("Failed to create portal session");
  }

  redirect(portalSession.url);
}
