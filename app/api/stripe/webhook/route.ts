import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { type NextRequest, NextResponse } from "next/server";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionChange,
} from "@/lib/stripe/helpers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
        console.log("New subscription created");
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        console.log("Subscription updated");
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        console.log("Subscription deleted");
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        console.log("Payment failed for invoice:", event.data.object.id);
        // Handle payment failure if needed
        break;

      case "invoice.payment_succeeded":
        console.log("Payment succeeded for invoice:", event.data.object.id);
        // Handle successful payment if needed
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`Successfully processed webhook event: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
