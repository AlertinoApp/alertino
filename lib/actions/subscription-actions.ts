"use server";

import {
  createCheckoutSession,
  createCustomerPortalSession,
  getUserSubscription,
  hasActiveSubscription,
  getUserTrialInfo,
} from "@/lib/stripe/helpers";
import { redirect } from "next/navigation";
import { createClientForServer } from "@/app/utils/supabase/server";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
  TrialInfo,
} from "@/types/subscription";
import { revalidatePath } from "next/cache";
import { getPlanConfig } from "@/lib/stripe/plans";
import { getAuthenticatedUser } from "./auth-actions";

function getPriceIdFromPlanAndInterval(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
): string | null {
  if (plan === "free") return null;

  const planConfig = getPlanConfig(plan);
  return interval === "month"
    ? planConfig.stripePriceIds.monthly
    : planConfig.stripePriceIds.yearly;
}

export async function createCheckoutSessionAction(priceId: string) {
  const user = await getAuthenticatedUser();

  if (!priceId) {
    throw new Error("Price ID is required");
  }

  // Check if user already has an active subscription
  const isActive = await hasActiveSubscription(user.id);
  if (isActive) {
    redirect("/billing?error=already_subscribed");
  }

  const checkoutSession = await createCheckoutSession({
    priceId,
    userId: user.id,
    userEmail: user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}

export async function subscribeToAction(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
) {
  const user = await getAuthenticatedUser();

  if (plan === "free") {
    redirect("/billing?error=invalid_plan");
  }

  const priceId = getPriceIdFromPlanAndInterval(plan, interval);
  if (!priceId) {
    redirect("/billing?error=invalid_plan");
  }

  await createCheckoutSessionAction(priceId);
}

export async function getTrialInfoAction(): Promise<TrialInfo> {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      isEligible: false,
      daysRemaining: null,
      isActive: false,
      hasUsedTrial: false,
    };
  }

  return await getUserTrialInfo(session.user.id);
}

export async function createPortalSessionAction() {
  const user = await getAuthenticatedUser();

  const subscription = await getUserSubscription(user.id);

  // Check if user has a valid subscription for portal access
  if (!subscription || !subscription.stripe_customer_id) {
    redirect("/billing?error=no_subscription");
  }

  // For free plan users without any Stripe history, redirect to billing
  if (subscription.plan === "free" && !subscription.stripe_subscription_id) {
    redirect("/billing?error=no_stripe_history");
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

export async function managePlanAction() {
  await createPortalSessionAction();
}
