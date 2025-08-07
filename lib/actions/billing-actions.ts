"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { getAuthenticatedUser } from "@/lib/actions/auth-actions";
import {
  getCustomerPaymentMethods,
  getCustomerInvoices,
  getBillingHistorySummary,
  type PaymentMethod,
  type Invoice,
} from "@/lib/stripe/billing";

export async function getBillingDataAction() {
  const user = await getAuthenticatedUser();
  const supabase = await createClientForServer();

  // Get user's subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return {
      paymentMethods: [],
      invoices: [],
      billingSummary: null,
    };
  }

  try {
    // Fetch all billing data in parallel
    const [paymentMethods, invoices, billingSummary] = await Promise.all([
      getCustomerPaymentMethods(subscription.stripe_customer_id),
      getCustomerInvoices(subscription.stripe_customer_id, 10),
      getBillingHistorySummary(subscription.stripe_customer_id),
    ]);

    return {
      paymentMethods,
      invoices,
      billingSummary,
    };
  } catch (error) {
    console.error("Error fetching billing data:", error);
    throw new Error("Failed to fetch billing data");
  }
}

export async function getPaymentMethodsAction(): Promise<PaymentMethod[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClientForServer();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return [];
  }

  try {
    return await getCustomerPaymentMethods(subscription.stripe_customer_id);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error("Failed to fetch payment methods");
  }
}

export async function getInvoicesAction(): Promise<Invoice[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClientForServer();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return [];
  }

  try {
    return await getCustomerInvoices(subscription.stripe_customer_id, 10);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}
