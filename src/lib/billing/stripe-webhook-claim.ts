import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const STALE_RECEIVED_WINDOW_MS = 5 * 60 * 1000;

export type ClaimVerdict =
  | { action: "process"; claimReceivedAt: string }
  | { action: "deduplicated" }
  | { action: "inProgress" }
  | { action: "error"; status: number; message: string };

export async function recordWebhookStatus(
  supabaseAdmin: SupabaseClient,
  eventId: string,
  status: "applied" | "ignored" | "failed",
  opts: {
    userId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    result?: unknown;
    error?: string;
    claimReceivedAt?: string;
  },
): Promise<boolean> {
  let query = supabaseAdmin
    .from("stripe_webhook_events")
    .update({
      processing_status: status,
      user_id: opts.userId ?? null,
      stripe_customer_id: opts.customerId ?? null,
      stripe_subscription_id: opts.subscriptionId ?? null,
      applied_result: opts.result ?? null,
      error_message: opts.error ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .eq("processing_status", "received");

  if (opts.claimReceivedAt) {
    query = query.eq("received_at", opts.claimReceivedAt);
  }

  const { data, error } = await query.select("event_id").maybeSingle();
  if (error) {
    throw new Error(`Failed to update stripe_webhook_events (${status}): ${error.message}`);
  }
  return Boolean(data);
}

export function eventCreatedIso(event: Stripe.Event): string {
  return typeof event.created === "number" && Number.isFinite(event.created)
    ? new Date(event.created * 1000).toISOString()
    : new Date().toISOString();
}

/**
 * Guard against late or out-of-order Stripe webhook deliveries re-granting or
 * regressing state after a newer applied event or canonical Stripe cancellation.
 */
export async function isStaleOutOfOrderEvent(
  supabaseAdmin: SupabaseClient,
  opts: {
    eventId: string;
    eventCreatedAt: string;
    subscriptionId: string | null;
    userId: string | null;
    checkStripeCanonical: boolean;
    stripe?: Stripe;
  },
): Promise<boolean> {
  if (opts.subscriptionId || opts.userId) {
    let query = supabaseAdmin
      .from("stripe_webhook_events")
      .select("event_id")
      .eq("processing_status", "applied")
      .gt("stripe_created_at", opts.eventCreatedAt)
      .neq("event_id", opts.eventId)
      .limit(1);

    query = opts.subscriptionId
      ? query.eq("stripe_subscription_id", opts.subscriptionId)
      : query.eq("user_id", opts.userId);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to check Stripe webhook event ordering: ${error.message}`);
    }
    if (Array.isArray(data) && data.length > 0) {
      return true;
    }
  }

  if (opts.checkStripeCanonical && opts.subscriptionId && opts.stripe?.subscriptions?.retrieve) {
    const canonical = await opts.stripe.subscriptions.retrieve(opts.subscriptionId);
    if (canonical.status === "canceled" || canonical.status === "incomplete_expired") {
      return true;
    }
  }

  return false;
}

/**
 * Atomic claim-first insert into `public.stripe_webhook_events`.
 * On 23505 conflict:
 * - applied/ignored -> deduplicated
 * - failed -> atomic CAS update back to received
 * - received -> if older than 5 minutes, atomic CAS reclaim; otherwise inProgress
 */
export async function claimStripeWebhookEvent(
  supabaseAdmin: SupabaseClient,
  event: Stripe.Event,
): Promise<ClaimVerdict> {
  const nowIso = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    stripe_created_at: eventCreatedIso(event),
    payload_json: event as unknown as Record<string, unknown>,
    processing_status: "received",
    received_at: nowIso,
  });

  if (!insertError) {
    return { action: "process", claimReceivedAt: nowIso };
  }
  if (insertError.code !== "23505") {
    return {
      action: "error",
      status: 500,
      message: `Failed to record Stripe webhook event: ${insertError.message}`,
    };
  }

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("stripe_webhook_events")
    .select("processing_status, received_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (lookupError) {
    return {
      action: "error",
      status: 500,
      message: `Webhook dedupe lookup failed: ${lookupError.message}`,
    };
  }
  if (
    !existing ||
    existing.processing_status === "applied" ||
    existing.processing_status === "ignored"
  ) {
    return { action: "deduplicated" };
  }

  if (existing.processing_status === "failed") {
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("stripe_webhook_events")
      .update({
        processing_status: "received",
        error_message: null,
        processed_at: null,
        received_at: nowIso,
      })
      .eq("event_id", event.id)
      .eq("processing_status", "failed")
      .select("event_id")
      .maybeSingle();

    if (claimError) {
      return {
        action: "error",
        status: 500,
        message: `Webhook failed-retry claim failed: ${claimError.message}`,
      };
    }
    return claimed ? { action: "process", claimReceivedAt: nowIso } : { action: "inProgress" };
  }

  const receivedMs = existing.received_at ? Date.parse(String(existing.received_at)) : NaN;
  const cutoffMs = Date.now() - STALE_RECEIVED_WINDOW_MS;
  if (!Number.isFinite(receivedMs) || receivedMs >= cutoffMs) {
    return { action: "inProgress" };
  }

  const cutoffIso = new Date(cutoffMs).toISOString();
  const { data: reclaimed, error: reclaimError } = await supabaseAdmin
    .from("stripe_webhook_events")
    .update({
      processing_status: "received",
      error_message: null,
      processed_at: null,
      received_at: nowIso,
    })
    .eq("event_id", event.id)
    .eq("processing_status", "received")
    .lt("received_at", cutoffIso)
    .select("event_id")
    .maybeSingle();

  if (reclaimError) {
    return {
      action: "error",
      status: 500,
      message: `Webhook stale reclaim failed: ${reclaimError.message}`,
    };
  }
  return reclaimed ? { action: "process", claimReceivedAt: nowIso } : { action: "inProgress" };
}
