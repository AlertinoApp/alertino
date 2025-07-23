import { stripe } from "./config";
import { getOrCreateCustomer } from "./customer";
import { TRIAL_DAYS } from "./constants";
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

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: userId },
    subscription_data: {
      metadata: { user_id: userId },
      ...(trialInfo.isEligible && { trial_period_days: TRIAL_DAYS }),
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
