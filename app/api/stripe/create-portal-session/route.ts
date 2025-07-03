import { NextResponse } from "next/server";
import { createClientForServer } from "@/app/utils/supabase/server";
import { stripe } from "@/lib/stripe/config";

export async function POST() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!user?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer ID found" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${baseUrl}/subscription`,
  });

  return NextResponse.json({ url: portalSession.url });
}
