import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createClientForServer } from "@/app/utils/supabase/server";
import Stripe from "stripe";

interface SubscriptionWithPeriodEnd extends Stripe.Subscription {
  current_period_end: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription as SubscriptionWithPeriodEnd;
    const userId = session.metadata?.user_id;

    if (!userId || !subscription) {
      throw new Error("Invalid session or missing user_id");
    }

    const supabase = await createClientForServer();

    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        plan: subscription.items.data[0].price.nickname || "unknown",
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date(),
      },
      { onConflict: "stripe_subscription_id" }
    );

    return NextResponse.redirect(
      new URL("/subscription?success=true", request.url)
    );
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
