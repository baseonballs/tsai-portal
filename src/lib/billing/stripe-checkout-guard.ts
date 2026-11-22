import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { EXISTING_ACTIVE_SUB_STATUSES } from "@/lib/billing/stripe-client";
import { errorMessage } from "@/lib/errors";

const SAFE_STRIPE_METADATA_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_SUBSCRIPTION_PAGES = 10;
const OPEN_SESSION_MIN_TTL_MS = 30_000;

export async function resolveOrCreateCheckoutCustomerId(opts: {
  stripe: Stripe;
  adminClient: SupabaseClient;
  userId: string;
  email?: string | null;
  existingDbCustomerId: string | null;
}): Promise<string> {
  const { stripe, adminClient, userId, email, existingDbCustomerId } = opts;
  if (existingDbCustomerId?.trim()) {
    return existingDbCustomerId.trim();
  }

  let customerId: string | null = null;
  if (SAFE_STRIPE_METADATA_ID_RE.test(userId) && typeof stripe.customers?.search === "function") {
    const searchRes = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 5,
    });
    const matched = searchRes.data.find(
      (c) => !("deleted" in c && c.deleted) && c.metadata?.userId === userId && c.id,
    );
    if (matched?.id) {
      customerId = matched.id;
    }
  }

  if (!customerId) {
    const created = await stripe.customers.create(
      {
        ...(email ? { email } : {}),
        metadata: { userId },
      },
      { idempotencyKey: `customer:${userId}` },
    );
    customerId = created.id;
  }

  // Best-effort durable binding into stripe_customers; adopt canonical DB row on concurrent 23505 race.
  try {
    const { error: insertErr } = await adminClient.from("stripe_customers").insert({
      user_id: userId,
      stripe_customer_id: customerId,
      bound_via: "checkout_session",
      updated_at: new Date().toISOString(),
    });
    if (insertErr) {
      if (insertErr.code === "23505") {
        const { data: racedRow } = await adminClient
          .from("stripe_customers")
          .select("stripe_customer_id")
          .eq("user_id", userId)
          .maybeSingle();
        const racedId = (racedRow as { stripe_customer_id?: string | null } | null)?.stripe_customer_id?.trim();
        if (racedId) return racedId;
      } else {
        console.warn("[StripeCheckout] Best-effort stripe_customers insert failed:", insertErr.message);
      }
    }
  } catch (persistErr) {
    console.warn("[StripeCheckout] Best-effort stripe_customers persist error:", errorMessage(persistErr));
  }

  return customerId;
}

export async function hasLiveActiveStripeSubscription(
  stripe: Stripe,
  customerId: string,
): Promise<boolean> {
  let startingAfter: string | undefined;
  for (let page = 0; page < MAX_SUBSCRIPTION_PAGES; page++) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    if (
      subs.data.some((sub) =>
        EXISTING_ACTIVE_SUB_STATUSES.has((sub.status ?? "").trim().toLowerCase()),
      )
    ) {
      return true;
    }
    if (!subs.has_more || subs.data.length === 0) {
      return false;
    }
    const lastId = subs.data[subs.data.length - 1]?.id;
    if (!lastId || lastId === startingAfter) {
      throw new Error("Stripe subscriptions pagination stalled.");
    }
    startingAfter = lastId;
  }
  throw new Error("Stripe subscriptions pagination exceeded safety limit.");
}

export type OpenSessionCheckResult =
  | { action: "reuse"; url: string }
  | { action: "conflict" }
  | { action: "create"; idempotencyKey: string };

export async function prepareCheckoutSessionCreation(opts: {
  stripe: Stripe;
  customerId: string;
  userId: string;
  planSku: string;
}): Promise<OpenSessionCheckResult> {
  const { stripe, customerId, userId, planSku } = opts;
  const openSessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: "open",
    limit: 10,
  });

  const nowMs = Date.now();
  let reusedUrl: string | null = null;
  const toExpire: string[] = [];

  for (const session of openSessions.data) {
    const matchesUser = session.metadata?.userId === userId;
    const matchesSku = session.metadata?.planSku === planSku;
    const hasFreshExpiry =
      typeof session.expires_at !== "number" ||
      session.expires_at * 1000 > nowMs + OPEN_SESSION_MIN_TTL_MS;

    if (!reusedUrl && matchesUser && matchesSku && hasFreshExpiry && session.url) {
      reusedUrl = session.url;
    } else if (session.id) {
      toExpire.push(session.id);
    }
  }

  for (const sessionId of toExpire) {
    try {
      await stripe.checkout.sessions.expire(sessionId);
    } catch (expireErr) {
      // Session may have just completed or expired concurrently; inspect its status.
      const current = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
      if (current?.status === "complete") {
        return { action: "conflict" };
      }
      if (current?.status !== "expired") {
        throw expireErr;
      }
    }
  }

  if (reusedUrl) {
    return { action: "reuse", url: reusedUrl };
  }

  const recentSessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 1,
  });
  const latestSession = recentSessions.data[0];
  if (
    latestSession?.status === "open" &&
    latestSession.metadata?.userId === userId &&
    latestSession.metadata?.planSku === planSku &&
    latestSession.url &&
    (typeof latestSession.expires_at !== "number" ||
      latestSession.expires_at * 1000 > Date.now() + OPEN_SESSION_MIN_TTL_MS)
  ) {
    return { action: "reuse", url: latestSession.url };
  }
  const latestSessionId = latestSession?.id ?? "none";

  return {
    action: "create",
    idempotencyKey: `checkout:${userId}:${planSku}:${customerId}:${latestSessionId}`,
  };
}
