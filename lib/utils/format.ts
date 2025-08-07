/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = "pln"
): string {
  const formatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return formatter.format(amount / 100); // Stripe amounts are in cents
}

/**
 * Format date from timestamp
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
