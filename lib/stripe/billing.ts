import { stripe } from "./config";

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
  };
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  dueDate?: number;
  periodStart?: number;
  periodEnd?: number;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  lines: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;
  unitAmount: number;
}

interface StripeInvoiceLine {
  id?: string;
  description?: string;
  amount: number;
  currency: string;
  quantity?: number;
  unit_amount?: number;
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<PaymentMethod[]> {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Get the default payment method
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer.deleted
      ? undefined
      : customer.invoice_settings?.default_payment_method;

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4 || "",
            expMonth: pm.card.exp_month || 0,
            expYear: pm.card.exp_year || 0,
          }
        : undefined,
      billingDetails: pm.billing_details
        ? {
            name: pm.billing_details.name || undefined,
            email: pm.billing_details.email || undefined,
          }
        : undefined,
      isDefault: pm.id === defaultPaymentMethodId,
    }));
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error("Failed to fetch payment methods");
  }
}

/**
 * Get customer's invoices
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Invoice[]> {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id || "",
      number: invoice.number || "",
      status: invoice.status || "",
      amount: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      dueDate: invoice.due_date || undefined,
      periodStart: invoice.period_start || undefined,
      periodEnd: invoice.period_end || undefined,
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
      invoicePdf: invoice.invoice_pdf || undefined,
      lines: invoice.lines.data.map((line) => {
        const stripeLine = line as StripeInvoiceLine;
        return {
          id: stripeLine.id || "",
          description: stripeLine.description || "",
          amount: stripeLine.amount,
          currency: stripeLine.currency,
          quantity: stripeLine.quantity || 1,
          unitAmount: stripeLine.unit_amount || 0,
        };
      }),
    }));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}

/**
 * Get customer's billing history summary
 */
export async function getBillingHistorySummary(customerId: string): Promise<{
  totalInvoices: number;
  totalPaid: number;
  currency: string;
  lastInvoiceDate?: number;
}> {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
      status: "paid",
    });

    const totalPaid = invoices.data.reduce(
      (sum, invoice) => sum + invoice.amount_paid,
      0
    );
    const lastInvoiceDate =
      invoices.data.length > 0
        ? Math.max(...invoices.data.map((inv) => inv.created))
        : undefined;

    return {
      totalInvoices: invoices.data.length,
      totalPaid,
      currency: invoices.data[0]?.currency || "pln",
      lastInvoiceDate,
    };
  } catch (error) {
    console.error("Error fetching billing history summary:", error);
    throw new Error("Failed to fetch billing history summary");
  }
}

// Re-export the utility functions for backward compatibility
export { formatCurrency, formatDate } from "@/lib/utils/format";
