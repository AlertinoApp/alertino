import { stripe } from "./config";
import { getOrCreateCustomer } from "./customer";
import type Stripe from "stripe";
import { getUserTrialInfo } from "./subscription";

export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const customerId = await getOrCreateCustomer(userId, userEmail);
  const trialInfo = await getUserTrialInfo(userId);

  // Get the plan type from the price ID mapping
  const { PLAN_MAPPING } = await import("./constants");
  const planType = PLAN_MAPPING[priceId];

  // Get the plan configuration to check trial days
  const { getEnhancedSubscriptionConfig } = await import("./plans");
  const planConfig = planType ? getEnhancedSubscriptionConfig(planType) : null;

  // Only add trial if plan supports it and user is eligible
  const trialDays =
    planConfig?.trialDays && trialInfo.isEligible ? planConfig.trialDays : null;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: userId },
    subscription_data: {
      metadata: { user_id: userId },
      ...(trialDays && { trial_period_days: trialDays }),
    },
    allow_promotion_codes: true,
  };

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createCustomerPortalSession(
  customerId: string | null,
  returnUrl: string
) {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  await stripe.customers.retrieve(customerId);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
