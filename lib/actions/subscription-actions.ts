"use server";

import {
  createCheckoutSession,
  createCustomerPortalSession,
  getUserSubscription,
  hasActiveSubscription,
} from "@/lib/stripe/helpers";
import { redirect } from "next/navigation";
import { createClientForServer } from "@/app/utils/supabase/server";

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
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
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
