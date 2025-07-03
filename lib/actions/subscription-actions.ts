"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createCheckoutSessionAction(
  planId: string,
  interval: "monthly" | "yearly"
) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planId,
        interval,
      }),
    }
  );

  const data = await response.json();

  if (data.url) {
    redirect(data.url);
  } else {
    throw new Error("Failed to create checkout session");
  }
}

export async function createPortalSessionAction() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-portal-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const data = await response.json();

  if (data.url) {
    redirect(data.url);
  } else {
    throw new Error("Failed to create portal session");
  }
}
