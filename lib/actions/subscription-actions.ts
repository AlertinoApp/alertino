"use server";

import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "@/lib/stripe/helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClientForServer } from "@/app/utils/supabase/server";

export async function createCheckoutSessionAction(priceId: string) {
  const supabase = await createClientForServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const checkoutSession = await createCheckoutSession({
    priceId,
    userId: session.user.id,
    userEmail: session.user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  redirect(checkoutSession.url!);
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

  // Use subscriptions table instead of users table
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (!subscription?.stripe_customer_id) {
    throw new Error("No Stripe customer ID found");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await createCustomerPortalSession(
    subscription.stripe_customer_id,
    `${baseUrl}/billing`
  );

  redirect(portalSession.url);
}

export async function refreshSubscriptionData() {
  revalidatePath("/billing");
  revalidatePath("/");
}
