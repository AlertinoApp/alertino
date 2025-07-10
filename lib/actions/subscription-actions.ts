"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { stripe } from "../stripe/config";

export async function createPortalSessionAction() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const userId = session.user.id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (!subscription?.stripe_customer_id) {
    throw new Error("No Stripe customer ID found");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${baseUrl}/billing`,
  });

  redirect(portalSession.url);
}
