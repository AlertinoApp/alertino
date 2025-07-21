import { stripe } from "@/lib/stripe/config";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionChange,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleTrialWillEnd,
  handleCheckoutSessionExpired,
} from "@/lib/stripe/helpers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Webhook event handlers mapping
const EVENT_HANDLERS = {
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "customer.subscription.created": handleSubscriptionChange,
  "customer.subscription.updated": handleSubscriptionChange,
  "customer.subscription.deleted": handleSubscriptionChange,
  "customer.subscription.trial_will_end": handleTrialWillEnd,
  "invoice.payment_succeeded": handlePaymentSucceeded,
  "invoice.payment_failed": handlePaymentFailed,
  "checkout.session.expired": handleCheckoutSessionExpired,
} as const;

type WebhookEventType = keyof typeof EVENT_HANDLERS;

function constructEvent(body: string, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error("Invalid signature");
  }
}

async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const eventType = event.type as WebhookEventType;
  const handler = EVENT_HANDLERS[eventType];

  if (!handler) {
    console.log(`Unhandled event type: ${event.type}`);
    return;
  }

  console.log(`Processing webhook event: ${event.type} (${event.id})`);

  try {
    await handler(event.data.object as any);
    console.log(`Successfully processed webhook event: ${event.type}`);
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  try {
    const event = constructEvent(body, signature);
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "Invalid signature") {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
