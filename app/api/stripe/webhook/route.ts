import { stripe } from "@/lib/stripe/config";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionChange,
  handleSubscriptionDeleted,
  handleSubscriptionTrialWillEnd,
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
      // Checkout events
      case "checkout.session.completed":
        console.log("Processing checkout.session.completed webhook");
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      // Subscription lifecycle events
      case "customer.subscription.created":
        console.log("Processing customer.subscription.created webhook");
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.updated":
        console.log("Processing customer.subscription.updated webhook");
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.deleted":
        console.log("Processing customer.subscription.deleted webhook");
        await handleSubscriptionDeleted(event.data.object);
        break;

      // Trial events
      case "customer.subscription.trial_will_end":
        console.log("Processing customer.subscription.trial_will_end webhook");
        await handleSubscriptionTrialWillEnd(event.data.object);
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
