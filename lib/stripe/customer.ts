import { stripe } from "./config";
import { getUserSubscription, createSubscriptionRecord } from "./database";

export async function createStripeCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { supabase_user_id: userId },
  });

  await createSubscriptionRecord({
    userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function getOrCreateCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  const subscription = await getUserSubscription(userId);

  if (subscription?.stripe_customer_id) {
    try {
      await stripe.customers.retrieve(subscription.stripe_customer_id);
      return subscription.stripe_customer_id;
    } catch {
      console.warn("Customer not found in Stripe, creating new one");
    }
  }

  return createStripeCustomer(userId, userEmail);
}
