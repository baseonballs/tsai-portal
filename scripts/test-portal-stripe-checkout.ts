/**
 * Wave 5 Portal T6.2 / O-05 verification suite:
 *   - Unlicensed buyer sign-in rules (`/pricing` & `/tournament/director` only; `/docs` strictly licence-gated)
 *   - `GET`/`POST /api/billing/stripe/checkout` (allowlist SKUs, DB-first price resolution, 401/400/503/200, no-store)
 *   - `POST /api/billing/stripe/webhook` (fail-closed 503/400, real Stripe HMAC verification, atomic dedupe,
 *     failed-row rollback + retry reclaim, stale `received` reclaim, zero `valid_from` write,
 *     live `subscriptions` / `licenses` / `user_product_licenses` constraint checks)
 *   - Portal Pillar 5 (< 300 lines per new/split runtime module) & Pricing UI safety
 *
 * Run: npx tsx scripts/test-portal-stripe-checkout.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Stripe from "stripe";
import { NextRequest } from "next/server";

const ROOT = process.cwd();
const BUYER_USER_ID = "00000000-0000-4000-8000-000000000101";
const OTHER_USER_ID = "00000000-0000-4000-8000-000000000102";
const BUYER_EMAIL = "buyer@example.test";
const REAL_WEBHOOK_SECRET = "whsec_unit_test_portal_only_secret";
const REAL_STRIPE_KEY = "sk_test_unit_only_not_a_real_key";

const SUBSCRIPTION_ALLOWED_COLS = new Set([
  "id",
  "user_id",
  "stripe_customer_id",
  "stripe_subscription_id",
  "status",
  "active_plan",
  "current_period_end",
  "created_at",
  "updated_at",
  "plan_id",
  "trial_end",
]);
const LICENSE_PLAN_TYPES = new Set([
  "FREE",
  "FAMILY",
  "PRO",
  "TEAM",
  "SKILLS_DEV",
  "SCOUTING",
  "BASIC",
]);

type Row = Record<string, unknown>;

interface MockDbState {
  plans: Row[];
  profiles: Row[];
  subscriptions: Row[];
  stripe_customers: Row[];
  licenses: Row[];
  user_product_licenses: Row[];
  stripe_webhook_events: Row[];
  failPlansQuery: boolean;
  failNextSubscriptionsUpsert: boolean;
}

function createInitialDbState(): MockDbState {
  return {
    plans: [
      {
        id: "10000000-0000-4000-8000-000000000001",
        sku: "SPOT-FREE-STD",
        name: "Fanatic",
        kind_code: "FREE",
        tier_code: "STANDARD",
        legacy_plan_type: "FREE",
        list_price_cents: 0,
        currency: "USD",
        billing_interval: "month",
        member_seats_included: 1,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        sku: "SPOT-FAM-BASIC",
        name: "Family Basic",
        kind_code: "FAMILY",
        tier_code: "BASIC",
        legacy_plan_type: "BASIC",
        list_price_cents: 1500,
        currency: "USD",
        billing_interval: "month",
        member_seats_included: 5,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        sku: "SPOT-FAM-PRO",
        name: "Family Pro",
        kind_code: "FAMILY",
        tier_code: "PRO",
        legacy_plan_type: "FAMILY",
        list_price_cents: 2900,
        currency: "USD",
        billing_interval: "month",
        member_seats_included: 5,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000004",
        sku: "SPOT-PRO-STD",
        name: "Premier",
        kind_code: "PRO",
        tier_code: "STANDARD",
        legacy_plan_type: "PRO",
        list_price_cents: 4900,
        currency: "USD",
        billing_interval: "month",
        member_seats_included: 1,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000005",
        sku: "SPOT-PRO-PLUS",
        name: "Premier Plus",
        kind_code: "PRO",
        tier_code: "PLUS",
        legacy_plan_type: null,
        list_price_cents: 6000,
        currency: "USD",
        billing_interval: "month",
        member_seats_included: 1,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000006",
        sku: "SPOT-TEAM-SEASON-24",
        name: "Team Season (24 seats)",
        kind_code: "TEAM",
        tier_code: "STANDARD",
        legacy_plan_type: "TEAM",
        list_price_cents: 260000,
        currency: "USD",
        billing_interval: "season",
        member_seats_included: 24,
        stripe_price_id: null,
        is_active: true,
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    profiles: [{ id: BUYER_USER_ID, email: BUYER_EMAIL, is_superadmin: false, user_type: "standard" }],
    subscriptions: [
      {
        id: "20000000-0000-4000-8000-000000000001",
        user_id: BUYER_USER_ID,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: "free",
        active_plan: "FREE",
        current_period_end: null,
        plan_id: "10000000-0000-4000-8000-000000000001",
        trial_end: null,
      },
    ],
    stripe_customers: [],
    licenses: [],
    user_product_licenses: [],
    stripe_webhook_events: [],
    failPlansQuery: false,
    failNextSubscriptionsUpsert: false,
  };
}

function validateLiveTableWrite(table: string, payload: Row) {
  if (table === "subscriptions") {
    for (const key of Object.keys(payload)) {
      if (!SUBSCRIPTION_ALLOWED_COLS.has(key)) {
        throw new Error(`subscriptions column does not exist on live DB: ${key}`);
      }
    }
  }
  if (table === "licenses") {
    if (!payload.valid_from || typeof payload.valid_from !== "string" || Number.isNaN(Date.parse(payload.valid_from))) {
      throw new Error(`licenses.valid_from must be a non-empty ISO timestamp (OD-25): ${String(payload.valid_from)}`);
    }
    if ("plan_type" in payload && !LICENSE_PLAN_TYPES.has(String(payload.plan_type))) {
      throw new Error(`licenses_plan_type_check violation: ${String(payload.plan_type)}`);
    }
  }
  if (table === "stripe_webhook_events") {
    if ("stripe_created_at" in payload && !payload.stripe_created_at) {
      throw new Error("stripe_webhook_events.stripe_created_at must be non-null");
    }
  }
  if (table === "user_product_licenses") {
    if (!["spotlight", "periodical"].includes(String(payload.product_id))) {
      throw new Error(`Unexpected product_id: ${String(payload.product_id)}`);
    }
  }
  if (table === "stripe_customers") {
    if (!["stripe_webhook", "checkout_session", "admin"].includes(String(payload.bound_via))) {
      throw new Error(`stripe_customers_bound_via_check violation: ${String(payload.bound_via)}`);
    }
  }
}

function createFakeAdminClient(state: MockDbState) {
  return {
    from(table: keyof MockDbState & string) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "insert" | "update" | "upsert" = "select";
      let writePayload: Row | null = null;
      let onConflictKey: string | null = null;
      let wantSelect = false;

      const execute = async (): Promise<{ data: unknown; error: { code?: string; message: string } | null }> => {
        if (table === "plans" && state.failPlansQuery) {
          return { data: null, error: { message: "simulated postgres outage" } };
        }
        const rows = state[table] as Row[];
        const matched = () => rows.filter((r) => filters.every((fn) => fn(r)));

        if (op === "select") {
          return { data: matched().map((r) => ({ ...r })), error: null };
        }

        if (op === "insert" && writePayload) {
          validateLiveTableWrite(table, writePayload);
          if (table === "stripe_customers") {
            const exists = rows.some(
              (r) =>
                r.user_id === writePayload!.user_id ||
                r.stripe_customer_id === writePayload!.stripe_customer_id,
            );
            if (exists) return { data: null, error: { code: "23505", message: "duplicate stripe_customers key" } };
          }
          if (table === "stripe_webhook_events") {
            const exists = rows.some((r) => r.event_id === writePayload!.event_id);
            if (exists) return { data: null, error: { code: "23505", message: "duplicate key value" } };
          }
          if (table === "licenses" && writePayload.tenant_id === null) {
            const exists = rows.some(
              (r) => r.profile_id === writePayload!.profile_id && r.tenant_id === null,
            );
            if (exists) return { data: null, error: { code: "23505", message: "unique_active_individual_license" } };
          }
          if (table === "user_product_licenses") {
            const hasProfile = state.profiles.some((p) => p.id === writePayload!.user_id);
            if (!hasProfile) return { data: null, error: { code: "23503", message: "FK user_id -> profiles(id)" } };
          }
          const created = { id: `gen-${rows.length + 1}`, ...writePayload };
          rows.push(created);
          return { data: wantSelect ? [created] : null, error: null };
        }

        if (op === "update" && writePayload) {
          validateLiveTableWrite(table, writePayload);
          const targets = matched();
          for (const row of targets) Object.assign(row, writePayload);
          return { data: wantSelect ? targets.map((r) => ({ ...r })) : null, error: null };
        }

        if (op === "upsert" && writePayload) {
          validateLiveTableWrite(table, writePayload);
          if (table === "subscriptions" && state.failNextSubscriptionsUpsert) {
            state.failNextSubscriptionsUpsert = false;
            return { data: null, error: { message: "transient subscriptions write error" } };
          }
          if (table === "user_product_licenses") {
            const hasProfile = state.profiles.some((p) => p.id === writePayload!.user_id);
            if (!hasProfile) return { data: null, error: { code: "23503", message: "FK user_id -> profiles(id)" } };
          }
          const conflictCols = (onConflictKey ?? "").split(",").map((s) => s.trim()).filter(Boolean);
          const existing = rows.find((r) => conflictCols.every((c) => r[c] === writePayload![c]));
          if (existing) {
            Object.assign(existing, writePayload);
            return { data: wantSelect ? [{ ...existing }] : null, error: null };
          }
          const created = { id: `gen-${rows.length + 1}`, ...writePayload };
          rows.push(created);
          return { data: wantSelect ? [created] : null, error: null };
        }

        return { data: [], error: null };
      };

      const q: Record<string, unknown> = {
        select: () => {
          if (op !== "select") wantSelect = true;
          return q;
        },
        insert: (p: Row) => {
          op = "insert";
          writePayload = p;
          return q;
        },
        update: (p: Row) => {
          op = "update";
          writePayload = p;
          return q;
        },
        upsert: (p: Row, opts?: { onConflict?: string }) => {
          op = "upsert";
          writePayload = p;
          onConflictKey = opts?.onConflict ?? null;
          return q;
        },
        eq: (col: string, val: unknown) => {
          filters.push((r) => r[col] === val);
          return q;
        },
        in: (col: string, vals: unknown[]) => {
          filters.push((r) => vals.includes(r[col]));
          return q;
        },
        is: (col: string, val: unknown) => {
          filters.push((r) => (r[col] ?? null) === val);
          return q;
        },
        not: (col: string, operator: string, val: unknown) => {
          if (operator === "is" && val === null) filters.push((r) => r[col] !== null && r[col] !== undefined);
          return q;
        },
        lt: (col: string, val: string) => {
          filters.push((r) => typeof r[col] === "string" && Date.parse(r[col] as string) < Date.parse(val));
          return q;
        },
        gt: (col: string, val: string) => {
          filters.push((r) => typeof r[col] === "string" && Date.parse(r[col] as string) > Date.parse(val));
          return q;
        },
        neq: (col: string, val: unknown) => {
          filters.push((r) => r[col] !== val);
          return q;
        },
        or: () => q,
        order: () => q,
        limit: () => q,
        maybeSingle: async () => {
          const res = await execute();
          if (res.error) return { data: null, error: res.error };
          const list = Array.isArray(res.data) ? res.data : [];
          return { data: list[0] ?? null, error: null };
        },
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          execute().then(resolve, reject),
      };
      return q;
    },
  };
}

async function run() {
  console.log("=== Wave 5 Portal T6.2 / O-05 Stripe Checkout & Buyer Sign-In Suite ===\n");

  const db = createInitialDbState();
  let mockUser: { id: string; email?: string; app_metadata?: Record<string, unknown> } | null = null;
  let globalSignOutCalls = 0;
  let capturedCheckoutParams: Record<string, unknown>[] = [];
  let capturedCheckoutOptions: Array<Record<string, unknown> | undefined> = [];
  let capturedCustomerCreates: Array<{ params: Record<string, unknown>; options?: Record<string, unknown> }> = [];
  let capturedExpiredSessionIds: string[] = [];
  let capturedPortalParams: Record<string, unknown>[] = [];
  let capturedSubsListParams: Record<string, unknown>[] = [];
  const nextCheckoutUrl = "https://checkout.stripe.com/c/pay/cs_test_portal_123";
  const nextPortalUrl = "https://billing.stripe.com/p/session/bps_test_portal_123";
  let mockCanonicalSubStatus: string = "active";
  let mockLiveStripeSubscriptions: Array<{ id: string; status: string }> = [];
  let mockLiveStripeSubPages: Array<Array<{ id: string; status: string }>> | null = null;
  let mockStripeCustomers: Array<{ id: string; metadata?: Record<string, string>; deleted?: boolean }> = [];
  let mockOpenCheckoutSessions: Array<{
    id: string;
    status: string;
    url: string | null;
    expires_at?: number;
    metadata?: Record<string, string>;
  }> = [];
  let mockRecentCheckoutSessions: Array<{
    id: string;
    status: string;
    url?: string | null;
    expires_at?: number;
    metadata?: Record<string, string>;
  }> = [];
  let mockSimulateRaceCompleteOnExpire = false;
  let mockStripeSubsListError: Error | null = null;
  let mockStripePortalCreateError: Error | null = null;
  let mockEntitlementThrow = false;
  let customerSeq = 0;
  const seenSessionIdempotency = new Map<string, { paramsHash: string; res: { id: string; url: string } }>();

  const MI = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown };
  const origLoad = MI._load;
  MI._load = function (r: string, p: unknown, m: boolean) {
    if (r === "server-only") return {};
    if (r === "@/utils/supabase/server") {
      return {
        createClient: async () => ({
          auth: {
            getUser: async () => ({ data: { user: mockUser }, error: null }),
            exchangeCodeForSession: async () => ({
              data: mockUser ? { session: { user: mockUser } } : { session: null },
              error: mockUser ? null : { message: "bad code" },
            }),
            signOut: async (opts?: { scope?: string }) => {
              if (opts?.scope === "global") globalSignOutCalls += 1;
              return { error: null };
            },
          },
        }),
      };
    }
    if (r === "@/lib/auth/portal-entitlement") {
      return {
        createPortalAdminClient: () => createFakeAdminClient(db),
        getEntitledPortalUser: async () => {
          if (mockEntitlementThrow) throw new Error("simulated db down");
          if (!mockUser) return { status: "signed-out" };
          const active = db.user_product_licenses.some(
            (l) => l.user_id === mockUser!.id && l.status === "active",
          );
          return active
            ? { status: "entitled", userId: mockUser.id }
            : { status: "not-entitled", userId: mockUser.id };
        },
        isUserEntitledToPortal: async (_admin: unknown, userId: string) => {
          const active = db.user_product_licenses.some(
            (l) => l.user_id === userId && l.status === "active",
          );
          return { isEntitled: active, profileId: userId };
        },
      };
    }
    if (r === "stripe") {
      const realStripe = new Stripe(REAL_STRIPE_KEY, { apiVersion: "2026-07-29.dahlia" });
      return class MockedStripe {
        webhooks = realStripe.webhooks;
        customers = {
          search: async ({ query }: { query: string }) => {
            const match = query.match(/metadata\['userId'\]:'([^']+)'/);
            const uid = match?.[1];
            return {
              data: mockStripeCustomers.filter((c) => !c.deleted && c.metadata?.userId === uid),
            };
          },
          create: async (params: Record<string, unknown>, options?: Record<string, unknown>) => {
            capturedCustomerCreates.push({ params, options });
            const meta = (params.metadata ?? {}) as Record<string, string>;
            const existing = mockStripeCustomers.find((c) => !c.deleted && c.metadata?.userId === meta.userId);
            if (existing) return existing;
            customerSeq += 1;
            const created = { id: `cus_created_${customerSeq}`, metadata: meta };
            mockStripeCustomers.push(created);
            return created;
          },
        };
        subscriptions = {
          retrieve: async (id: string) => ({ id, status: mockCanonicalSubStatus }),
          list: async (params: Record<string, unknown>) => {
            capturedSubsListParams.push(params);
            if (mockStripeSubsListError) throw mockStripeSubsListError;
            if (mockLiveStripeSubPages) {
              const idx = capturedSubsListParams.length - 1;
              const page = mockLiveStripeSubPages[idx] ?? [];
              return { data: page, has_more: idx + 1 < mockLiveStripeSubPages.length };
            }
            return { data: mockLiveStripeSubscriptions, has_more: false };
          },
        };
        checkout = {
          sessions: {
            list: async (params: Record<string, unknown>) => {
              if (params.status === "open") {
                return { data: mockOpenCheckoutSessions.filter((s) => s.status === "open") };
              }
              return { data: mockRecentCheckoutSessions };
            },
            expire: async (id: string) => {
              capturedExpiredSessionIds.push(id);
              const found = mockOpenCheckoutSessions.find((s) => s.id === id);
              if (mockSimulateRaceCompleteOnExpire) {
                if (found) found.status = "complete";
                throw new Error("You cannot expire a Checkout Session whose status is complete.");
              }
              if (found) found.status = "expired";
              return found ?? { id, status: "expired" };
            },
            retrieve: async (id: string) => {
              return mockOpenCheckoutSessions.find((s) => s.id === id) ?? { id, status: "expired" };
            },
            create: async (params: Record<string, unknown>, options?: Record<string, unknown>) => {
              const key = typeof options?.idempotencyKey === "string" ? options.idempotencyKey : null;
              const paramsHash = JSON.stringify(params);
              if (key && seenSessionIdempotency.has(key)) {
                const prev = seenSessionIdempotency.get(key)!;
                if (prev.paramsHash !== paramsHash) {
                  throw new Error(`Stripe IdempotencyError: mismatched params for key ${key}`);
                }
                capturedCheckoutParams.push(params);
                capturedCheckoutOptions.push(options);
                return prev.res;
              }
              capturedCheckoutParams.push(params);
              capturedCheckoutOptions.push(options);
              const res = { id: `cs_test_${capturedCheckoutParams.length}`, url: nextCheckoutUrl };
              if (key) seenSessionIdempotency.set(key, { paramsHash, res });
              return res;
            },
          },
        };
        billingPortal = {
          sessions: {
            create: async (params: Record<string, unknown>) => {
              capturedPortalParams.push(params);
              if (mockStripePortalCreateError) throw mockStripePortalCreateError;
              return { id: "bps_test_123", url: nextPortalUrl };
            },
          },
        };
      };
    }
    return origLoad.call(this, r, p, m);
  };

  try {
    // ── 1. Portal Pillar 5 (< 300 lines) & URL / Path Guards ─────────────────────────────────────
    const runtimeFiles = [
      "src/lib/auth/buyer-session-paths.ts",
      "src/app/auth/callback/route.ts",
      "src/app/auth/entitlement/route.ts",
      "src/app/login/page.tsx",
      "src/lib/billing/stripe-client.ts",
      "src/lib/billing/stripe-checkout-guard.ts",
      "src/lib/billing/stripe-origin.ts",
      "src/lib/billing/stripe-plans.ts",
      "src/lib/billing/stripe-webhook-claim.ts",
      "src/lib/billing/stripe-webhook-handlers.ts",
      "src/lib/billing/stripe-webhook-sync.ts",
      "src/lib/billing/stripe-webhook.ts",
      "src/lib/billing/pricing-catalog-client.ts",
      "src/components/pricing/PricingCheckoutButton.tsx",
      "src/components/pricing/PricingStatusBanner.tsx",
      "src/app/api/billing/stripe/checkout/route.ts",
      "src/app/api/billing/stripe/portal/route.ts",
      "src/app/api/billing/stripe/webhook/route.ts",
    ];
    for (const rel of runtimeFiles) {
      const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n").length;
      assert.ok(lines < 300, `${rel} must be < 300 lines (got ${lines})`);
    }
    console.log(`✓ 1. All ${runtimeFiles.length} new/updated runtime modules are strictly < 300 lines`);

    const { isAllowedUnlicensedNextPath } = await import("../src/lib/auth/buyer-session-paths");
    const { isAllowedStripeCheckoutUrl, isAllowedStripePortalUrl } = await import(
      "../src/lib/billing/pricing-catalog-client"
    );

    for (const p of ["/pricing", "/pricing?checkout=canceled", "/tournament/director", "/tournament/director?team=1"]) {
      assert.equal(isAllowedUnlicensedNextPath(p), true, `buyer path allowed: ${p}`);
    }
    for (const p of ["/docs", "/docs/spotlight", "/", "/login", "/pricing/", "/pricing/../docs", "https://evil.example/pricing", "//evil.example/pricing", "/\t/pricing", "/pricing\\evil", ""]) {
      assert.equal(isAllowedUnlicensedNextPath(p), false, `non-buyer/open-redirect refused: ${p}`);
    }
    assert.equal(isAllowedStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_1"), true);
    assert.equal(isAllowedStripeCheckoutUrl("http://checkout.stripe.com/c/pay/cs_test_1"), false);
    assert.equal(isAllowedStripeCheckoutUrl("https://checkout.stripe.com.evil.example/pay"), false);
    assert.equal(isAllowedStripeCheckoutUrl("https://evil.example/checkout.stripe.com"), false);
    assert.equal(isAllowedStripePortalUrl("https://billing.stripe.com/p/session/bps_test_1"), true);
    assert.equal(isAllowedStripePortalUrl("http://billing.stripe.com/p/session/bps_test_1"), false);
    assert.equal(isAllowedStripePortalUrl("https://billing.stripe.com.evil.example/session"), false);
    assert.equal(isAllowedStripePortalUrl("https://checkout.stripe.com/c/pay/cs_test_1"), false);
    console.log("✓ 2. Buyer path, Stripe Checkout & Billing Portal URL host guards behave strictly");

    // ── 2. Unlicensed Buyer Sign-In: /auth/entitlement & /auth/callback ──────────────────────────
    const entitlementRoute = await import("../src/app/auth/entitlement/route");
    const callbackRoute = await import("../src/app/auth/callback/route");

    mockUser = null;
    assert.equal((await entitlementRoute.POST()).status, 401);

    mockUser = { id: BUYER_USER_ID, email: BUYER_EMAIL };
    globalSignOutCalls = 0;
    const buyPricing = await entitlementRoute.POST(
      new Request("https://transcendental-sports.ai/auth/entitlement", {
        method: "POST",
        body: JSON.stringify({ next: "/pricing?tier=pro" }),
      }),
    );
    assert.equal(buyPricing.status, 200);
    assert.equal(buyPricing.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await buyPricing.json(), { entitled: false, allowed: true, scope: "buyer" });
    assert.equal(globalSignOutCalls, 0, "unlicensed buyer heading to /pricing keeps session");

    const buyDirector = await entitlementRoute.POST(
      new Request("https://transcendental-sports.ai/auth/entitlement", {
        method: "POST",
        body: JSON.stringify({ next: "/tournament/director" }),
      }),
    );
    assert.equal(buyDirector.status, 200);
    assert.deepEqual(await buyDirector.json(), { entitled: false, allowed: true, scope: "buyer" });

    for (const deniedBody of [JSON.stringify({ next: "/docs" }), JSON.stringify({ next: "/" }), ""]) {
      globalSignOutCalls = 0;
      const res = await entitlementRoute.POST(
        new Request("https://transcendental-sports.ai/auth/entitlement", { method: "POST", body: deniedBody }),
      );
      assert.equal(res.status, 403);
      assert.equal(globalSignOutCalls, 1, `unlicensed caller refused for ${deniedBody || "(empty)"}`);
    }

    mockEntitlementThrow = true;
    const errRes = await entitlementRoute.POST();
    assert.equal(errRes.status, 503);
    assert.equal(errRes.headers.get("cache-control"), "private, no-store");
    mockEntitlementThrow = false;

    globalSignOutCalls = 0;
    const cbAllow = await callbackRoute.GET(
      new Request("https://transcendental-sports.ai/auth/callback?code=ok&next=%2Fpricing"),
    );
    assert.equal(cbAllow.status, 307);
    assert.equal(cbAllow.headers.get("location"), "https://transcendental-sports.ai/pricing");
    assert.equal(globalSignOutCalls, 0);

    const cbDeny = await callbackRoute.GET(
      new Request("https://transcendental-sports.ai/auth/callback?code=ok&next=%2Fdocs"),
    );
    assert.equal(cbDeny.status, 307);
    assert.equal(cbDeny.headers.get("location"), "https://transcendental-sports.ai/login?error=unauthorized");
    assert.equal(globalSignOutCalls, 1);
    console.log("✓ 3. Unlicensed buyer sign-in permits /pricing & /tournament/director and denies /docs & /");

    // ── 3. Checkout GET & POST ───────────────────────────────────────────────────────────────────
    const checkoutRoute = await import("../src/app/api/billing/stripe/checkout/route");
    const env = process.env as Record<string, string | undefined>;
    delete env.STRIPE_SECRET_KEY;
    delete env.STRIPE_WEBHOOK_SECRET;
    delete env.STRIPE_PRICE_ID_PRO_STD;
    delete env.STRIPE_PRICE_ID_PRO;
    delete env.STRIPE_PRICE_ID_PRO_PLUS;
    delete env.STRIPE_PRICE_ID_TEAM_SEASON_24;
    delete env.STRIPE_PRICE_ID_TEAM;
    delete env.STRIPE_PRICE_ID_FAM_BASIC;
    delete env.STRIPE_PRICE_ID_FAM_PRO;

    // GET unauthenticated: zero PII, checkoutConfigured=false
    mockUser = null;
    const getUnauth = await checkoutRoute.GET();
    assert.equal(getUnauth.status, 200);
    assert.equal(getUnauth.headers.get("cache-control"), "private, no-store");
    const getUnauthJson = (await getUnauth.json()) as {
      authenticated: boolean;
      checkoutConfigured: boolean;
      activePlan: string | null;
      plans: Array<{ sku: string; checkoutReady: boolean }>;
    };
    assert.equal(getUnauthJson.authenticated, false);
    assert.equal(getUnauthJson.checkoutConfigured, false);
    assert.equal(getUnauthJson.activePlan, null);
    assert.equal(getUnauthJson.plans.length, 5);
    assert.ok(getUnauthJson.plans.every((p) => p.checkoutReady === false));

    // GET fails loudly on DB error
    db.failPlansQuery = true;
    assert.equal((await checkoutRoute.GET()).status, 503);
    db.failPlansQuery = false;

    // POST unauthenticated -> 401
    assert.equal(
      (
        await checkoutRoute.POST(
          new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ planSku: "SPOT-PRO-STD" }),
          }),
        )
      ).status,
      401,
    );

    // POST bad SKU -> 400
    mockUser = { id: BUYER_USER_ID, email: BUYER_EMAIL };
    assert.equal(
      (
        await checkoutRoute.POST(
          new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ planSku: "SPOT-BOGUS" }),
          }),
        )
      ).status,
      400,
    );

    // POST missing STRIPE_SECRET_KEY -> 503
    assert.equal(
      (
        await checkoutRoute.POST(
          new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
          }),
        )
      ).status,
      503,
    );

    // POST with STRIPE_SECRET_KEY but missing price ID -> 503 (never invents fake price_*)
    env.STRIPE_SECRET_KEY = REAL_STRIPE_KEY;
    assert.equal(
      (
        await checkoutRoute.POST(
          new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
          }),
        )
      ).status,
      503,
    );

    // DB stripe_price_id takes precedence over env var
    env.STRIPE_PRICE_ID_PRO_PLUS = "price_env_pro_plus";
    db.plans.find((p) => p.sku === "SPOT-PRO-PLUS")!.stripe_price_id = "price_db_pro_plus";
    env.STRIPE_PRICE_ID_TEAM = "price_env_team";

    // GET authenticated reflects activePlan and checkoutReady
    const getAuth = await checkoutRoute.GET();
    const getAuthJson = (await getAuth.json()) as {
      authenticated: boolean;
      checkoutConfigured: boolean;
      activePlan: string | null;
      plans: Array<{ sku: string; checkoutReady: boolean }>;
    };
    assert.equal(getAuthJson.authenticated, true);
    assert.equal(getAuthJson.checkoutConfigured, true);
    assert.equal(getAuthJson.activePlan, "FREE");
    assert.equal(getAuthJson.plans.find((p) => p.sku === "SPOT-PRO-PLUS")?.checkoutReady, true);
    assert.equal(getAuthJson.plans.find((p) => p.sku === "SPOT-TEAM-SEASON-24")?.checkoutReady, true);
    assert.equal(getAuthJson.plans.find((p) => p.sku === "SPOT-FAM-BASIC")?.checkoutReady, false);
    assert.equal("email" in getAuthJson, false);
    assert.equal("userId" in getAuthJson, false);

    // POST succeeds for every allowlisted SKU with exact metadata & existing customer reuse
    env.STRIPE_PRICE_ID_PRO = "price_env_pro";
    env.STRIPE_PRICE_ID_FAM_BASIC = "price_env_fam_basic";
    env.STRIPE_PRICE_ID_FAM_PRO = "price_env_fam_pro";
    const expectedSkuTiers: Array<[string, string, string]> = [
      ["SPOT-PRO-STD", "PRO", "price_env_pro"],
      ["SPOT-PRO-PLUS", "PRO", "price_db_pro_plus"],
      ["SPOT-TEAM-SEASON-24", "TEAM", "price_env_team"],
      ["SPOT-FAM-BASIC", "BASIC", "price_env_fam_basic"],
      ["SPOT-FAM-PRO", "FAMILY", "price_env_fam_pro"],
    ];
    for (const [sku, expectedTier, expectedPrice] of expectedSkuTiers) {
      capturedCheckoutParams = [];
      const res = await checkoutRoute.POST(
        new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
          method: "POST",
          body: JSON.stringify({ planSku: sku }),
        }),
      );
      assert.equal(res.status, 200, `${sku} checkout POST status`);
      assert.equal((capturedCheckoutParams[0].line_items as Array<{ price: string }>)[0].price, expectedPrice);
      assert.deepEqual(capturedCheckoutParams[0].metadata, {
        userId: BUYER_USER_ID,
        planSku: sku,
        tier: expectedTier,
      });
      assert.deepEqual(
        (capturedCheckoutParams[0].subscription_data as { metadata: unknown }).metadata,
        { userId: BUYER_USER_ID, planSku: sku, tier: expectedTier },
      );
    }
    assert.equal(db.stripe_customers.length, 1, "first-time customer persisted once across 5 SKU calls");
    db.stripe_customers.length = 0;
    mockStripeCustomers = [];

    // Reuse existing stripe_customer_id when already present on subscriptions + live concurrency check
    db.subscriptions[0].stripe_customer_id = "cus_existing_sub";
    capturedCheckoutParams = [];
    capturedCheckoutOptions = [];
    capturedSubsListParams = [];
    mockLiveStripeSubscriptions = [{ id: "sub_old_canceled", status: "canceled" }];
    const postExistingCust = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(postExistingCust.status, 200);
    assert.deepEqual(capturedSubsListParams[0], {
      customer: "cus_existing_sub",
      status: "all",
      limit: 100,
    });
    assert.equal(capturedCheckoutParams[0].customer, "cus_existing_sub");
    assert.equal(capturedCheckoutParams[0].customer_email, undefined);
    assert.equal(
      capturedCheckoutOptions[0]?.idempotencyKey,
      `checkout:${BUYER_USER_ID}:SPOT-PRO-PLUS:cus_existing_sub:none`,
    );

    // Paginated subscriptions.list (m3): active sub on page 2 behind canceled page 1 still blocks with 409!
    capturedCheckoutParams = [];
    capturedSubsListParams = [];
    mockLiveStripeSubPages = [
      [{ id: "sub_canceled_p1", status: "canceled" }],
      [{ id: "sub_active_p2", status: "active" }],
    ];
    const pagedRaceRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(pagedRaceRes.status, 409);
    assert.equal(capturedSubsListParams.length, 2);
    assert.equal(capturedSubsListParams[1].starting_after, "sub_canceled_p1");
    assert.equal(capturedCheckoutParams.length, 0);
    mockLiveStripeSubPages = null;

    // Exceeding MAX_SUBSCRIPTION_PAGES fails closed with sanitized 502 instead of silently allowing checkout
    capturedCheckoutParams = [];
    capturedSubsListParams = [];
    mockLiveStripeSubPages = Array.from({ length: 11 }, (_, idx) => [
      { id: `sub_canceled_page_${idx}`, status: "canceled" },
    ]);
    const exceededPagesRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(exceededPagesRes.status, 502);
    assert.equal(capturedSubsListParams.length, 10);
    assert.equal(capturedCheckoutParams.length, 0);
    mockLiveStripeSubPages = null;

    // Live Stripe concurrency check blocks double-checkout across all EXISTING_ACTIVE_SUB_STATUSES
    for (const liveStatus of ["active", "trialing", "past_due", "paused", "incomplete"]) {
      capturedCheckoutParams = [];
      mockLiveStripeSubscriptions = [{ id: `sub_live_${liveStatus}`, status: liveStatus }];
      const raceRes = await checkoutRoute.POST(
        new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
          method: "POST",
          body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
        }),
      );
      assert.equal(raceRes.status, 409, `live Stripe status ${liveStatus} must block checkout with 409`);
      const raceJson = (await raceRes.json()) as { error?: string };
      assert.match(raceJson.error ?? "", /Billing Portal/i);
      assert.equal(capturedCheckoutParams.length, 0, "must not create Checkout Session when live sub exists");
    }

    // Open session reuse for same planSku and expiry of conflicting open session for different planSku (M1)
    mockLiveStripeSubscriptions = [];
    capturedCheckoutParams = [];
    mockOpenCheckoutSessions = [
      {
        id: "cs_open_same",
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_open_same",
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-PLUS" },
      },
    ];
    const reuseRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(reuseRes.status, 200);
    assert.deepEqual(await reuseRes.json(), { url: "https://checkout.stripe.com/c/pay/cs_open_same" });
    assert.equal(capturedCheckoutParams.length, 0, "matching open session reused without creating a duplicate");

    capturedCheckoutParams = [];
    capturedCheckoutOptions = [];
    capturedExpiredSessionIds = [];
    mockRecentCheckoutSessions = [{ id: "cs_open_same", status: "open" }];
    const switchRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-TEAM-SEASON-24" }),
      }),
    );
    assert.equal(switchRes.status, 200);
    assert.deepEqual(capturedExpiredSessionIds, ["cs_open_same"]);
    assert.equal(
      capturedCheckoutOptions[0]?.idempotencyKey,
      `checkout:${BUYER_USER_ID}:SPOT-TEAM-SEASON-24:cus_existing_sub:cs_open_same`,
    );

    // Concurrent completion during expire fails safely with 409 Conflict instead of creating a second Checkout Session
    capturedCheckoutParams = [];
    mockOpenCheckoutSessions = [
      {
        id: "cs_open_completing",
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_open_completing",
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-PLUS" },
      },
    ];
    mockSimulateRaceCompleteOnExpire = true;
    const expireRaceRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-TEAM-SEASON-24" }),
      }),
    );
    mockSimulateRaceCompleteOnExpire = false;
    assert.equal(expireRaceRes.status, 409);
    assert.equal(capturedCheckoutParams.length, 0);

    // Race fallback: if recentSessions[0] became open for same (userId, planSku), reuse instead of spawning duplicate
    mockOpenCheckoutSessions = [];
    mockRecentCheckoutSessions = [
      {
        id: "cs_recent_same_race",
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_recent_same_race",
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-PLUS" },
      },
    ];
    const recentReuseRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(recentReuseRes.status, 200);
    assert.deepEqual(await recentReuseRes.json(), {
      url: "https://checkout.stripe.com/c/pay/cs_recent_same_race",
    });
    assert.equal(capturedCheckoutParams.length, 0);

    mockOpenCheckoutSessions = [];
    mockRecentCheckoutSessions = [];

    // Live Stripe subscriptions.list failure fails closed with sanitized 502
    mockLiveStripeSubscriptions = [];
    mockStripeSubsListError = new Error("stripe internal cus_existing_sub error");
    const listFailRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(listFailRes.status, 502);
    const listFailJson = (await listFailRes.json()) as { error?: string };
    assert.doesNotMatch(listFailJson.error ?? "", /cus_existing_sub/);
    mockStripeSubsListError = null;
    db.subscriptions[0].stripe_customer_id = null;
    db.stripe_customers.length = 0;
    mockStripeCustomers = [];
    capturedCustomerCreates = [];

    // First-time buyer: resolves/creates Stripe customer idempotently + persists stripe_customers + deterministic key
    capturedCheckoutParams = [];
    capturedCheckoutOptions = [];
    const postOk = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-PLUS" }),
      }),
    );
    assert.equal(postOk.status, 200);
    assert.equal(postOk.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await postOk.json(), { url: nextCheckoutUrl });
    assert.equal(capturedCustomerCreates.length, 1);
    assert.equal(capturedCustomerCreates[0].options?.idempotencyKey, `customer:${BUYER_USER_ID}`);
    assert.equal(db.stripe_customers[0]?.stripe_customer_id, capturedCheckoutParams[0].customer);
    assert.equal(db.stripe_customers[0]?.bound_via, "checkout_session");
    assert.equal(capturedCheckoutParams.length, 1);
    assert.equal(
      capturedCheckoutOptions[0]?.idempotencyKey,
      `checkout:${BUYER_USER_ID}:SPOT-PRO-PLUS:${String(capturedCheckoutParams[0].customer)}:none`,
    );
    assert.equal((capturedCheckoutParams[0].line_items as Array<{ price: string }>)[0].price, "price_db_pro_plus");
    assert.equal(capturedCheckoutParams[0].mode, "subscription");
    assert.equal(capturedCheckoutParams[0].client_reference_id, BUYER_USER_ID);
    assert.equal(capturedCheckoutParams[0].customer_email, undefined);
    assert.deepEqual(capturedCheckoutParams[0].metadata, {
      userId: BUYER_USER_ID,
      planSku: "SPOT-PRO-PLUS",
      tier: "PRO",
    });
    assert.equal(
      capturedCheckoutParams[0].success_url,
      "https://transcendental-sports.ai/pricing?checkout=success",
    );
    assert.equal(
      capturedCheckoutParams[0].cancel_url,
      "https://transcendental-sports.ai/pricing?checkout=canceled",
    );

    // Untrusted x-forwarded-host is ignored -> falls back to official origin
    capturedCheckoutParams = [];
    const spoofedOriginRes = await checkoutRoute.POST(
      new NextRequest("http://0.0.0.0:3040/api/billing/stripe/checkout", {
        method: "POST",
        headers: { "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
        body: JSON.stringify({ planSku: "SPOT-PRO-STD" }),
      }),
    );
    assert.equal(spoofedOriginRes.status, 200);
    assert.equal(
      capturedCheckoutParams[0].success_url,
      "https://hub.transcendental-sports.ai/pricing?checkout=success",
    );

    // Duplicate active subscription refused with 409
    db.subscriptions[0].stripe_subscription_id = "sub_already_active";
    db.subscriptions[0].status = "active";
    db.subscriptions[0].active_plan = "PRO";
    const dupSubCheckout = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-TEAM-SEASON-24" }),
      }),
    );
    assert.equal(dupSubCheckout.status, 409);
    db.subscriptions[0].stripe_subscription_id = null;
    db.subscriptions[0].status = "free";
    db.subscriptions[0].active_plan = "FREE";

    // Missing profile refused before creating Checkout Session
    mockUser = { id: OTHER_USER_ID, email: "other@example.test" };
    const missingProfileRes = await checkoutRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planSku: "SPOT-PRO-STD" }),
      }),
    );
    assert.equal(missingProfileRes.status, 409);
    mockUser = { id: BUYER_USER_ID, email: BUYER_EMAIL };
    console.log("✓ 4. Checkout GET/POST enforces 401/400/409/502/503/200, live sub race guard, idempotencyKey & no-store");

    // ── 3b. Stripe Billing Portal Endpoint (/api/billing/stripe/portal) ──────────────────────────
    const portalRoute = await import("../src/app/api/billing/stripe/portal/route");

    // Unauthenticated -> 401
    mockUser = null;
    const portalUnauth = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
      }),
    );
    assert.equal(portalUnauth.status, 401);
    assert.equal(portalUnauth.headers.get("cache-control"), "private, no-store");

    // Missing STRIPE_SECRET_KEY -> 503
    mockUser = { id: BUYER_USER_ID, email: BUYER_EMAIL };
    delete env.STRIPE_SECRET_KEY;
    const portalUnconfigured = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
      }),
    );
    assert.equal(portalUnconfigured.status, 503);
    env.STRIPE_SECRET_KEY = REAL_STRIPE_KEY;

    // Concurrent first-time buyer double-click creates one customer & identical idempotencyKey (M1 + m4)
    db.stripe_customers.length = 0;
    mockStripeCustomers = [];
    capturedCustomerCreates = [];
    capturedCheckoutParams = [];
    capturedCheckoutOptions = [];
    seenSessionIdempotency.clear();
    const [raceFirst1, raceFirst2] = await Promise.all([
      checkoutRoute.POST(
        new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
          method: "POST",
          body: JSON.stringify({ planSku: "SPOT-PRO-STD" }),
        }),
      ),
      checkoutRoute.POST(
        new NextRequest("https://transcendental-sports.ai/api/billing/stripe/checkout", {
          method: "POST",
          body: JSON.stringify({ planSku: "SPOT-PRO-STD" }),
        }),
      ),
    ]);
    assert.equal(raceFirst1.status, 200);
    assert.equal(raceFirst2.status, 200);
    assert.equal(mockStripeCustomers.length, 1, "concurrent first-time buyer resolves single Stripe customer");
    assert.equal(
      capturedCheckoutOptions[0]?.idempotencyKey,
      capturedCheckoutOptions[1]?.idempotencyKey,
      "concurrent double-click shares identical non-wall-clock idempotencyKey",
    );

    // No stripe_customers or subscriptions customer -> 404 honest message
    db.stripe_customers.length = 0;
    db.subscriptions[0].stripe_customer_id = null;
    mockStripeCustomers = [];
    const portalNoCust = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
      }),
    );
    assert.equal(portalNoCust.status, 404);
    assert.equal(portalNoCust.headers.get("cache-control"), "private, no-store");
    assert.match(((await portalNoCust.json()) as { error?: string }).error ?? "", /No Stripe billing customer/i);

    // Pre-B15 subscriber fallback: stripe_customer_id only on subscriptions succeeds (200) without stripe_customers row
    db.subscriptions[0].stripe_customer_id = "cus_legacy_sub_only";
    capturedPortalParams = [];
    const portalLegacySubRes = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
      }),
    );
    assert.equal(portalLegacySubRes.status, 200);
    assert.deepEqual(await portalLegacySubRes.json(), { url: nextPortalUrl });
    assert.equal(capturedPortalParams[0].customer, "cus_legacy_sub_only");
    db.subscriptions[0].stripe_customer_id = null;

    // Invalid returnPath / return_url / JSON rejected with 400
    db.stripe_customers.push({ user_id: BUYER_USER_ID, stripe_customer_id: "cus_portal_buyer_1" });
    for (const badBody of [
      "{bad-json",
      JSON.stringify({ returnPath: "https://evil.example/pricing" }),
      JSON.stringify({ returnPath: "//evil.example/pricing" }),
      JSON.stringify({ returnPath: "/\t/pricing" }),
      JSON.stringify({ return_url: "https://evil.example/pricing" }),
      JSON.stringify({ return_url: "https://hub.transcendental-sports.ai.evil.example/pricing" }),
      JSON.stringify({ return_url: "http://hub.transcendental-sports.ai/pricing" }),
      JSON.stringify({ return_url: "https://user:pass@hub.transcendental-sports.ai/pricing" }),
    ]) {
      const badRes = await portalRoute.POST(
        new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
          method: "POST",
          body: badBody,
        }),
      );
      assert.equal(badRes.status, 400, `portal must refuse invalid payload: ${badBody}`);
    }

    // Valid default (empty body) with spoofed x-forwarded-host falls back to OFFICIAL_HOST
    capturedPortalParams = [];
    const portalDefaultRes = await portalRoute.POST(
      new NextRequest("http://0.0.0.0:3040/api/billing/stripe/portal", {
        method: "POST",
        headers: { "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
      }),
    );
    assert.equal(portalDefaultRes.status, 200);
    assert.equal(portalDefaultRes.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await portalDefaultRes.json(), { url: nextPortalUrl });
    assert.deepEqual(capturedPortalParams[0], {
      customer: "cus_portal_buyer_1",
      return_url: "https://hub.transcendental-sports.ai/pricing",
    });

    // Valid returnPath & valid allowlisted return_url
    capturedPortalParams = [];
    const portalPathRes = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
        body: JSON.stringify({ returnPath: "/pricing?tab=billing" }),
      }),
    );
    assert.equal(portalPathRes.status, 200);
    assert.deepEqual(capturedPortalParams[0], {
      customer: "cus_portal_buyer_1",
      return_url: "https://transcendental-sports.ai/pricing?tab=billing",
    });

    capturedPortalParams = [];
    const portalUrlRes = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
        body: JSON.stringify({ return_url: "https://hub.transcendental-sports.ai/pricing?portal=1" }),
      }),
    );
    assert.equal(portalUrlRes.status, 200);
    assert.deepEqual(capturedPortalParams[0], {
      customer: "cus_portal_buyer_1",
      return_url: "https://hub.transcendental-sports.ai/pricing?portal=1",
    });

    // Stripe Billing Portal API failure -> sanitized 502 (never echoes internal Stripe error)
    mockStripePortalCreateError = new Error("Internal Stripe failure for cus_portal_buyer_1 sk_test_raw");
    const portalErrRes = await portalRoute.POST(
      new NextRequest("https://transcendental-sports.ai/api/billing/stripe/portal", {
        method: "POST",
      }),
    );
    assert.equal(portalErrRes.status, 502);
    assert.equal(portalErrRes.headers.get("cache-control"), "private, no-store");
    const portalErrJson = (await portalErrRes.json()) as { error?: string };
    assert.doesNotMatch(portalErrJson.error ?? "", /cus_portal_buyer_1|sk_test_raw/);
    mockStripePortalCreateError = null;
    db.stripe_customers.length = 0;
    console.log("✓ 4b. Billing Portal POST enforces 401/400/404/502/503/200 & strict OFFICIAL_HOST allowlist");

    // ── 4. Webhook Endpoint: HMAC, Dedupe, Rollback, Stale Reclaim, Live Constraints ─────────────
    const webhookRoute = await import("../src/app/api/billing/stripe/webhook/route");
    const signer = new Stripe(REAL_STRIPE_KEY, { apiVersion: "2026-07-29.dahlia" });
    const signedWebhookReq = (eventObj: Record<string, unknown>, sigOverride?: string | null) => {
      const payload = JSON.stringify(eventObj);
      const sig =
        sigOverride === undefined
          ? signer.webhooks.generateTestHeaderString({ payload, secret: REAL_WEBHOOK_SECRET })
          : sigOverride;
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (sig) headers["stripe-signature"] = sig;
      return new NextRequest("https://transcendental-sports.ai/api/billing/stripe/webhook", {
        method: "POST",
        headers,
        body: payload,
      });
    };

    // Missing STRIPE_WEBHOOK_SECRET -> 503
    assert.equal(
      (await webhookRoute.POST(signedWebhookReq({ id: "evt_0", type: "checkout.session.completed", created: 1795000000 }, "sig"))).status,
      503,
    );

    env.STRIPE_WEBHOOK_SECRET = REAL_WEBHOOK_SECRET;
    // Missing or invalid signature -> 400
    assert.equal(
      (await webhookRoute.POST(signedWebhookReq({ id: "evt_0", type: "checkout.session.completed", created: 1795000000 }, null))).status,
      400,
    );
    assert.equal(
      (await webhookRoute.POST(signedWebhookReq({ id: "evt_0", type: "checkout.session.completed", created: 1795000000 }, "t=1,v1=bad"))).status,
      400,
    );

    const checkoutEvt = {
      id: "evt_checkout_pro_plus",
      type: "checkout.session.completed",
      created: 1795000000,
      data: {
        object: {
          id: "cs_1",
          customer: "cus_portal_1",
          subscription: "sub_portal_1",
          metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-PLUS", tier: "PRO" },
        },
      },
    };

    // Post-claim throw -> marks stripe_webhook_events failed (never wedged in received), returns 500; retry succeeds!
    db.failNextSubscriptionsUpsert = true;
    const failedRes = await webhookRoute.POST(signedWebhookReq(checkoutEvt));
    assert.equal(failedRes.status, 500);
    assert.equal(failedRes.headers.get("cache-control"), "private, no-store");
    const failedRow = db.stripe_webhook_events.find((e) => e.event_id === "evt_checkout_pro_plus");
    assert.equal(failedRow?.processing_status, "failed");
    assert.ok(failedRow?.error_message);
    assert.ok(failedRow?.processed_at);

    // Retry reclaims failed -> applies cleanly!
    const retryOk = await webhookRoute.POST(signedWebhookReq(checkoutEvt));
    assert.equal(retryOk.status, 200);
    assert.deepEqual(await retryOk.json(), { received: true });
    assert.equal(db.stripe_webhook_events.find((e) => e.event_id === "evt_checkout_pro_plus")?.processing_status, "applied");
    assert.equal(db.stripe_customers[0].stripe_customer_id, "cus_portal_1");
    assert.equal(db.stripe_customers[0].bound_via, "stripe_webhook");
    assert.equal(db.subscriptions[0].active_plan, "PRO");
    assert.equal(db.subscriptions[0].status, "active");
    assert.equal(db.licenses[0].plan_type, "PRO");
    assert.equal(typeof db.licenses[0].valid_from, "string");
    const initialValidFrom = db.licenses[0].valid_from as string;
    assert.ok(!Number.isNaN(Date.parse(initialValidFrom)));
    assert.equal(db.user_product_licenses[0].product_id, "spotlight");
    assert.equal(db.user_product_licenses[0].status, "active");
    assert.equal(db.user_product_licenses[0].granted_via, "stripe_webhook");

    // Atomic dedupe on replay
    const dupRes = await webhookRoute.POST(signedWebhookReq(checkoutEvt));
    assert.equal(dupRes.status, 200);
    assert.deepEqual(await dupRes.json(), { received: true, deduplicated: true });

    // Fresh received -> inProgress; stale received (> 5 min) -> reclaimed and applied!
    db.stripe_webhook_events.push({
      event_id: "evt_fresh_in_progress",
      event_type: "customer.subscription.updated",
      stripe_created_at: new Date().toISOString(),
      payload_json: {},
      processing_status: "received",
      received_at: new Date().toISOString(),
    });
    const inProgRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_fresh_in_progress",
        type: "customer.subscription.updated",
        created: 1795000100,
        data: { object: { id: "sub_portal_1", customer: "cus_portal_1", status: "active", items: { data: [] } } },
      }),
    );
    assert.equal(inProgRes.status, 409);
    assert.deepEqual(await inProgRes.json(), { received: false, inProgress: true });

    db.stripe_webhook_events.push({
      event_id: "evt_stale_received",
      event_type: "customer.subscription.updated",
      stripe_created_at: new Date(1795000200 * 1000).toISOString(),
      payload_json: {},
      processing_status: "received",
      received_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    });
    const staleReclaimRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_stale_received",
        type: "customer.subscription.updated",
        created: 1795000200,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "active",
            current_period_end: 1798000000,
            metadata: { userId: BUYER_USER_ID, planSku: "SPOT-FAM-PRO" },
            items: { data: [] },
          },
        },
      }),
    );
    assert.equal(staleReclaimRes.status, 200);
    assert.deepEqual(await staleReclaimRes.json(), { received: true });
    assert.equal(db.subscriptions[0].active_plan, "FAMILY");
    assert.equal(db.licenses[0].plan_type, "FAMILY");

    // invoice.payment_failed marks past_due without dropping active_plan
    const payFailRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_invoice_fail_1",
        type: "invoice.payment_failed",
        created: 1795000300,
        data: {
          object: {
            id: "in_1",
            customer: "cus_portal_1",
            parent: { subscription_details: { subscription: "sub_portal_1" } },
          },
        },
      }),
    );
    assert.equal(payFailRes.status, 200);
    assert.equal(db.subscriptions[0].status, "past_due");
    assert.equal(db.subscriptions[0].active_plan, "FAMILY");

    // customer.subscription.deleted revokes user_product_licenses and reverts subscription/license to FREE
    const subDelRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_sub_del_1",
        type: "customer.subscription.deleted",
        created: 1795000400,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "canceled",
            current_period_end: 1798000000,
            items: { data: [] },
          },
        },
      }),
    );
    assert.equal(subDelRes.status, 200);
    assert.equal(db.subscriptions[0].status, "canceled");
    assert.equal(db.subscriptions[0].active_plan, "FREE");
    assert.equal(db.licenses[0].plan_type, "FREE");
    assert.equal(db.licenses[0].valid_from, initialValidFrom);
    assert.equal(db.user_product_licenses[0].status, "revoked");

    // Out-of-order late event (older than evt_sub_del_1 @ 1795000400) is ignored without re-granting
    const lateCheckoutRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_late_checkout",
        type: "checkout.session.completed",
        created: 1795000050,
        data: {
          object: {
            id: "cs_late",
            customer: "cus_portal_1",
            subscription: "sub_portal_1",
            payment_status: "paid",
            metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-PLUS", tier: "PRO" },
          },
        },
      }),
    );
    assert.equal(lateCheckoutRes.status, 200);
    assert.equal(db.stripe_webhook_events.find((e) => e.event_id === "evt_late_checkout")?.processing_status, "ignored");
    assert.equal(db.user_product_licenses[0].status, "revoked");
    assert.equal(db.subscriptions[0].active_plan, "FREE");

    // Canonical Stripe cancellation check blocks late activation on a brand-new subscription ID
    mockCanonicalSubStatus = "canceled";
    const canonicalCanceledRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_canonical_canceled",
        type: "checkout.session.completed",
        created: 1795000450,
        data: {
          object: {
            id: "cs_canceled_before_webhook",
            customer: "cus_portal_1",
            subscription: "sub_already_canceled_upstream",
            payment_status: "paid",
            metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-STD", tier: "PRO" },
          },
        },
      }),
    );
    assert.equal(canonicalCanceledRes.status, 200);
    assert.equal(db.stripe_webhook_events.find((e) => e.event_id === "evt_canonical_canceled")?.processing_status, "ignored");
    assert.equal(db.user_product_licenses[0].status, "revoked");
    mockCanonicalSubStatus = "active";

    // Unpaid async checkout session is ignored (awaiting_payment) without granting UPL
    const unpaidCheckoutRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_unpaid_checkout",
        type: "checkout.session.completed",
        created: 1795000460,
        data: {
          object: {
            id: "cs_unpaid",
            customer: "cus_portal_1",
            subscription: "sub_portal_2",
            payment_status: "unpaid",
            metadata: { userId: BUYER_USER_ID, planSku: "SPOT-PRO-STD", tier: "PRO" },
          },
        },
      }),
    );
    assert.equal(unpaidCheckoutRes.status, 200);
    assert.equal(db.stripe_webhook_events.find((e) => e.event_id === "evt_unpaid_checkout")?.processing_status, "ignored");
    assert.equal(db.user_product_licenses[0].status, "revoked");

    // firstItem.price.id takes precedence over stale sub.metadata.planSku
    const pricePrecedenceRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_price_precedence",
        type: "customer.subscription.updated",
        created: 1795000500,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "active",
            current_period_end: 1799000000,
            metadata: { userId: BUYER_USER_ID, planSku: "SPOT-FAM-BASIC" },
            items: { data: [{ price: { id: "price_env_team" } }] },
          },
        },
      }),
    );
    assert.equal(pricePrecedenceRes.status, 200);
    assert.equal(db.subscriptions[0].active_plan, "TEAM");
    assert.equal(db.licenses[0].plan_type, "TEAM");
    assert.equal(db.user_product_licenses[0].status, "active");

    // Stripe status "paused" revokes stripe_webhook UPL
    const pausedRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_sub_paused",
        type: "customer.subscription.updated",
        created: 1795000550,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "paused",
            current_period_end: 1799000000,
            items: { data: [] },
          },
        },
      }),
    );
    assert.equal(pausedRes.status, 200);
    assert.equal(db.subscriptions[0].status, "paused");
    assert.equal(db.user_product_licenses[0].status, "revoked");

    // Non-Stripe grant (granted_via: "invite_code") is preserved across BOTH activation and deletion!
    db.user_product_licenses[0].status = "active";
    db.user_product_licenses[0].granted_via = "invite_code";
    const preserveActivateRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_preserve_invite_activate",
        type: "customer.subscription.updated",
        created: 1795000600,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "active",
            items: { data: [{ price: { id: "price_env_pro" } }] },
          },
        },
      }),
    );
    assert.equal(preserveActivateRes.status, 200);
    assert.equal(db.user_product_licenses[0].status, "active");
    assert.equal(db.user_product_licenses[0].granted_via, "invite_code");

    const preserveDeleteRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_preserve_invite_delete",
        type: "customer.subscription.deleted",
        created: 1795000650,
        data: {
          object: {
            id: "sub_portal_1",
            customer: "cus_portal_1",
            status: "canceled",
            items: { data: [] },
          },
        },
      }),
    );
    assert.equal(preserveDeleteRes.status, 200);
    assert.equal(db.user_product_licenses[0].status, "active");
    assert.equal(db.user_product_licenses[0].granted_via, "invite_code");

    // Customer mismatch conflict fails loudly (never silently overwrites stripe_customer_id)
    const mismatchRes = await webhookRoute.POST(
      signedWebhookReq({
        id: "evt_cust_mismatch",
        type: "checkout.session.completed",
        created: 1795000700,
        data: {
          object: {
            id: "cs_mismatch",
            customer: "cus_portal_1",
            subscription: "sub_other",
            metadata: { userId: OTHER_USER_ID, planSku: "SPOT-PRO-STD", tier: "PRO" },
          },
        },
      }),
    );
    assert.equal(mismatchRes.status, 500);
    assert.equal(db.stripe_webhook_events.find((e) => e.event_id === "evt_cust_mismatch")?.processing_status, "failed");

    console.log("✓ 5. Webhook HMAC, dedupe, failed retry, stale reclaim, license sync, & revocation verified");

    // ── 5. Pricing UI Components Render & Honest Status ──────────────────────────────────────────
    const { PricingCheckoutButton } = await import("../src/components/pricing/PricingCheckoutButton");
    const signedOutHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-PRO-STD",
        planLabel: "Premier",
        loading: false,
        catalogError: null,
        authenticated: false,
        checkoutReady: false,
        variant: "teal",
      }),
    );
    assert.match(signedOutHtml, /Sign in to Subscribe/);
    assert.match(signedOutHtml, /Stripe checkout is not yet configured on this server/);

    const signedInUnconfiguredHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-TEAM-SEASON-24",
        planLabel: "Team Season (24 seats)",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: false,
        variant: "cyan",
      }),
    );
    assert.match(signedInUnconfiguredHtml, /Checkout Not Configured/);
    assert.match(signedInUnconfiguredHtml, /Stripe checkout is not yet configured on this server/);

    const signedInReadyHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-FAM-PRO",
        planLabel: "Family Pro",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        variant: "sky",
      }),
    );
    assert.match(signedInReadyHtml, /Subscribe to Family Pro/);

    const activeSubHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-PRO-STD",
        planLabel: "Premier",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        activePlan: "PRO",
        subscriptionStatus: "active",
        hasActiveSubscription: true,
        variant: "teal",
      }),
    );
    assert.match(activeSubHtml, /Manage Billing/);
    assert.match(activeSubHtml, /portal-manage-SPOT-PRO-STD/);
    assert.match(activeSubHtml, /Active account plan: PRO/);
    assert.doesNotMatch(activeSubHtml, /Current Subscription/);
    assert.doesNotMatch(activeSubHtml, /<button[^>]*\sdisabled(?:=""|\s|>)/);

    const pausedSubHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-PRO-STD",
        planLabel: "Premier",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        activePlan: "FREE",
        subscriptionStatus: "paused",
        hasActiveSubscription: true,
        variant: "teal",
      }),
    );
    assert.match(pausedSubHtml, /Resume Subscription/);
    assert.match(pausedSubHtml, /portal-resume-SPOT-PRO-STD/);
    assert.match(pausedSubHtml, /Subscription paused/);
    assert.doesNotMatch(pausedSubHtml, /<button[^>]*\sdisabled(?:=""|\s|>)/);

    const pastDueSubHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-FAM-PRO",
        planLabel: "Family Pro",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        activePlan: "FAMILY",
        subscriptionStatus: "past_due",
        hasActiveSubscription: true,
        variant: "sky",
      }),
    );
    assert.match(pastDueSubHtml, /Manage Billing/);
    assert.match(pastDueSubHtml, /Subscription payment past due/);

    const incompleteSubHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-PRO-PLUS",
        planLabel: "Premier Plus",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        activePlan: "FREE",
        subscriptionStatus: "incomplete",
        hasActiveSubscription: true,
        variant: "teal",
      }),
    );
    assert.match(incompleteSubHtml, /Manage Billing/);
    assert.match(incompleteSubHtml, /Payment Incomplete — Action Required/);
    assert.doesNotMatch(incompleteSubHtml, /Active account plan:/);

    const canceledSubHtml = renderToStaticMarkup(
      React.createElement(PricingCheckoutButton, {
        planSku: "SPOT-PRO-STD",
        planLabel: "Premier",
        loading: false,
        catalogError: null,
        authenticated: true,
        checkoutReady: true,
        activePlan: "PRO",
        subscriptionStatus: "canceled",
        hasActiveSubscription: false,
        variant: "teal",
      }),
    );
    assert.match(canceledSubHtml, /Subscribe to Premier/);
    assert.doesNotMatch(canceledSubHtml, /Manage Billing/);

    const buttonSrc = fs.readFileSync(path.join(ROOT, "src/components/pricing/PricingCheckoutButton.tsx"), "utf8");
    assert.match(buttonSrc, /\/api\/billing\/stripe\/portal/);
    assert.match(buttonSrc, /isAllowedStripePortalUrl/);
    assert.match(buttonSrc, /if \(!navigating\)/, "button stays locked while navigation is in flight");
    const pricingPageSrc = fs.readFileSync(path.join(ROOT, "src/app/pricing/page.tsx"), "utf8");
    assert.match(pricingPageSrc, /subscriptionStatus=\{subscriptionStatus\}/);
    console.log("✓ 6. PricingCheckoutButton renders signed-out, unconfigured, active (Manage Billing), paused (Resume Subscription), past_due, incomplete, and ready states");

    console.log("\n🎉 ALL PORTAL STRIPE CHECKOUT & BUYER SIGN-IN TESTS PASSED!\n");
  } finally {
    MI._load = origLoad;
  }
}

run().catch((err) => {
  console.error("\n❌ PORTAL STRIPE CHECKOUT TEST FAILED:", err);
  process.exit(1);
});
