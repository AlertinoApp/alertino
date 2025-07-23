import { stripe } from "@/lib/stripe/config";
import {
  handleCheckoutSessionCompleted,
  handleCheckoutSessionExpired,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleSubscriptionChange,
  handleTrialWillEnd,
} from "@/lib/stripe/webhooks";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Processing webhook event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`Successfully processed webhook event: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
