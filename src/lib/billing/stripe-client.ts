import "server-only";

import { NextResponse } from "next/server";
import Stripe from "stripe";

export const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" } as const;

export function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export class MissingSecretError extends Error {
  constructor(readonly secretName: string) {
    super(`${secretName} is not configured`);
    this.name = "MissingSecretError";
  }
}

export function requiredSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new MissingSecretError(name);
  }
  return value;
}

const EXISTING_ACTIVE_SUB_STATUSES = new Set(["active", "trialing", "paused"]);

export function isActiveSubscriptionRecord(
  row: {
    stripe_subscription_id?: string | null;
    status?: string | null;
    active_plan?: string | null;
  } | null | undefined,
): boolean {
  if (!row) return false;
  const hasStripeSub = Boolean(row.stripe_subscription_id?.trim());
  if (!hasStripeSub) return false;
  const status = (row.status ?? "").trim().toLowerCase();
  if (EXISTING_ACTIVE_SUB_STATUSES.has(status)) return true;
  const activePlan = (row.active_plan ?? "").trim().toUpperCase();
  return Boolean(activePlan && activePlan !== "FREE" && status !== "canceled");
}

let cached: { key: string; client: Stripe } | null = null;

/**
 * Build the Stripe SDK client lazily from `STRIPE_SECRET_KEY`.
 * Never falls back to a committed or mock key; fails closed via MissingSecretError.
 */
export function getStripe(): Stripe {
  const key = requiredSecret("STRIPE_SECRET_KEY");
  if (cached?.key !== key) {
    cached = {
      key,
      client: new Stripe(key, {
        apiVersion: "2026-07-29.dahlia",
        appInfo: { name: "TSAI Portal", version: "0.4.3" },
      }),
    };
  }
  return cached.client;
}
