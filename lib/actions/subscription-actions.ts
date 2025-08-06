"use server";

import { redirect } from "next/navigation";
import { createClientForServer } from "@/app/utils/supabase/server";
import { getAuthenticatedUser } from "./auth-actions";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "@/lib/stripe/checkout";
import { getUserTrialInfo } from "@/lib/stripe/subscription";
import { getPriceId, getAppUrl } from "@/lib/stripe/utils";
import type {
  SubscriptionPlan,
  SubscriptionInterval,
  TrialInfo,
} from "@/types/subscription";
import { getUserSubscription } from "../stripe/database";

export async function createCheckoutSessionAction(priceId: string) {
  if (!priceId) {
    throw new Error("Price ID is required");
  }

  const user = await getAuthenticatedUser();

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
  const priceId = getPriceId(plan, interval);
  await createCheckoutSessionAction(priceId);
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

  // Check if user has a subscription with stripe_customer_id
  if (!subscription || !subscription.stripe_customer_id) {
    throw new Error(
      "No active subscription found. Please subscribe to a plan first."
    );
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
