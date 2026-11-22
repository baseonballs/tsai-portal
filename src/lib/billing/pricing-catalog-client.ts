export interface CheckoutCatalogPlan {
  sku: string;
  name: string;
  kind_code: string;
  tier_code: string;
  list_price_cents: number | null;
  currency: string;
  billing_interval: string;
  member_seats_included: number | null;
  checkoutReady: boolean;
}

export interface CheckoutCatalogResponse {
  authenticated: boolean;
  checkoutConfigured: boolean;
  activePlan: string | null;
  plans: CheckoutCatalogPlan[];
}

export function isAllowedStripeCheckoutUrl(raw: unknown): raw is string {
  if (typeof raw !== "string" || !raw.trim()) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

export function formatPlanPrice(cents: number | null | undefined, currency = "USD"): string {
  if (typeof cents !== "number" || !Number.isFinite(cents)) {
    return "Unavailable";
  }
  const dollars = cents / 100;
  const isWhole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(dollars);
}

export function formatPlanInterval(interval: string | null | undefined, seats: number | null | undefined): string {
  const unit = interval?.trim() || "month";
  if (typeof seats === "number" && seats > 1) {
    return `/ ${unit} (${seats} seats)`;
  }
  return `/ ${unit}`;
}
