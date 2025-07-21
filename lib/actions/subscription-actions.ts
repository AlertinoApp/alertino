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
import { getPlanConfig } from "@/lib/stripe/plans";
import { getAuthenticatedUser } from "./auth-actions";

function getPriceId(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval
): string {
  if (plan === "free") {
    throw new Error("Free plan does not have a price ID");
  }

  const planConfig = getPlanConfig(plan);
  const priceId =
    interval === "month"
      ? planConfig.stripePriceIds.monthly
      : planConfig.stripePriceIds.yearly;

  if (!priceId) {
    throw new Error(`No price ID found for ${plan} ${interval}`);
  }

  return priceId;
}

function getAppUrl(path: string = ""): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export async function createCheckoutSessionAction(priceId: string) {
  if (!priceId) {
    throw new Error("Price ID is required");
  }

  const user = await getAuthenticatedUser();

  // Prevent duplicate subscriptions
  const isActive = await hasActiveSubscription(user.id);
  if (isActive) {
    redirect("/billing?error=already_subscribed");
  }

  const checkoutSession = await createCheckoutSession({
    priceId,
    userId: user.id,
    userEmail: user.email!,
    successUrl: getAppUrl("/billing/success"),
    cancelUrl: getAppUrl("/billing/cancel"),
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
  if (plan === "free") {
    redirect("/billing?error=invalid_plan");
  }

  try {
    const priceId = getPriceId(plan, interval);
    await createCheckoutSessionAction(priceId);
  } catch (error) {
    console.error("Subscription error:", error);
    redirect("/billing?error=invalid_plan");
  }
}

export async function getTrialInfoAction(): Promise<TrialInfo> {
  try {
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
  } catch (error) {
    console.error("Error getting trial info:", error);
    return {
      isEligible: false,
      daysRemaining: null,
      isActive: false,
      hasUsedTrial: false,
    };
  }
}

export async function createPortalSessionAction() {
  const user = await getAuthenticatedUser();
  const subscription = await getUserSubscription(user.id);

  // Validate subscription for portal access
  if (!subscription?.stripe_customer_id) {
    redirect("/billing?error=no_subscription");
  }

  if (subscription.plan === "free" && !subscription.stripe_subscription_id) {
    redirect("/billing?error=no_stripe_history");
  }

  const portalSession = await createCustomerPortalSession(
    subscription.stripe_customer_id,
    getAppUrl("/billing")
  );

  if (!portalSession.url) {
    throw new Error("Failed to create portal session");
  }

  redirect(portalSession.url);
}

export async function managePlanAction() {
  await createPortalSessionAction();
}
