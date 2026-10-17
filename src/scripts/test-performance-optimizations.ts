/**
 * Regression test suite for Wave 5 Performance Optimizations in tsai-portal:
 * - PORT-PERF-TELEM-001: Singleton Supabase service-role client + parallelized Promise.all in /api/telemetry/event
 * - PORT-PERF-DOCS-002: Bounded 30s DOC_BUNDLE_CACHE with mtime validation + parallelized profile role lookup & MDX load
 * - PORT-PERF-AUTH-003: Direct local Kong (127.0.0.1:5550) server-side routing + self-proxy loop guard in /supabase/[[...path]]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { resolveServerAuthUrl } from "../utils/supabase/resolve-server-auth-url";

async function main() {
  const root = path.resolve(__dirname, "../..");

  // 1. PORT-PERF-AUTH-003: resolveServerAuthUrl routes local DGX calls directly to 127.0.0.1:5550
  const prevTarget = process.env.TSAI_DEPLOY_TARGET;
  const prevInternal = process.env.SUPABASE_INTERNAL_URL;
  const prevPublic = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    delete process.env.TSAI_DEPLOY_TARGET;
    delete process.env.SUPABASE_INTERNAL_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.equal(resolveServerAuthUrl(), "http://127.0.0.1:5550");

    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:3040/supabase";
    assert.equal(resolveServerAuthUrl(), "http://127.0.0.1:5550");

    process.env.TSAI_DEPLOY_TARGET = "cloudrun";
    process.env.PORT = "8080";
    assert.equal(resolveServerAuthUrl(), "http://127.0.0.1:8080/supabase");
  } finally {
    if (prevTarget === undefined) delete process.env.TSAI_DEPLOY_TARGET;
    else process.env.TSAI_DEPLOY_TARGET = prevTarget;
    if (prevInternal === undefined) delete process.env.SUPABASE_INTERNAL_URL;
    else process.env.SUPABASE_INTERNAL_URL = prevInternal;
    if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = prevPublic;
  }

  // 2. PORT-PERF-DOCS-002: Verify docs.tsx & DocsPage implement DOC_BUNDLE_CACHE, PORTAL_PROFILE_ROLE_CACHE, and parallel loading
  const docsUtilSrc = fs.readFileSync(path.join(root, "src/utils/docs.tsx"), "utf8");
  assert.ok(
    docsUtilSrc.includes("DOC_BUNDLE_CACHE") &&
      docsUtilSrc.includes("invalidateDocBundleCache") &&
      docsUtilSrc.includes("cached.mtimeMs === stat.mtimeMs"),
    "src/utils/docs.tsx must cache compiled MDX bundles with mtimeMs validation"
  );

  const docsPageSrc = fs.readFileSync(path.join(root, "src/app/docs/[[...slug]]/page.tsx"), "utf8");
  assert.ok(
    docsPageSrc.includes("PORTAL_PROFILE_ROLE_CACHE") &&
      docsPageSrc.includes("const [role, preloadedBundle] = await Promise.all(["),
    "DocsPage must cache profile roles and parallelize role resolution with loadDoc"
  );

  // 3. PORT-PERF-TELEM-001: Verify /api/telemetry/event parallelizes insert & select
  const telemSrc = fs.readFileSync(path.join(root, "src/app/api/telemetry/event/route.ts"), "utf8");
  assert.ok(
    telemSrc.includes("const [eventRes, journeyRes] = await Promise.all(["),
    "telemetry/event/route.ts must parallelize user_telemetry_events.insert and user_session_journeys.select"
  );
  assert.ok(
    telemSrc.includes("cachedTelemetryAdminClient"),
    "telemetry/event/route.ts must reuse a singleton Supabase service client"
  );

  // 4. PORT-PERF-AUTH-003: Verify /supabase/[[...path]]/route.ts guards against self-origin loop
  const proxySrc = fs.readFileSync(path.join(root, "src/app/supabase/[[...path]]/route.ts"), "utf8");
  assert.ok(
    proxySrc.includes("resolveProxyTargetBase") && proxySrc.includes("isSelfOrigin"),
    "supabase/[[...path]]/route.ts must guard against self-origin proxy loops"
  );

  // 5. PORT-PERF-TIMING-004 & PLAT-PERF-CI-GATE-001: W3C Server-Timing & latency budget gate
  const {
    createServerTimingRecorder,
    parseServerTimingHeader,
    evaluateLatencyBudget,
    computeWeakETag,
    matchesIfNoneMatch,
  } = await import("../lib/perf/server-timing");
  const portalProxySrc = fs.readFileSync(path.join(root, "src/proxy.ts"), "utf8");
  assert.ok(
    portalProxySrc.includes("Server-Timing") && telemSrc.includes("Server-Timing"),
    "src/proxy.ts and src/app/api/telemetry/event/route.ts must emit W3C Server-Timing headers"
  );
  const rec = createServerTimingRecorder();
  rec.record("proxy", 0.1, "portal-proxy");
  const hdr = rec.toHeaderValue();
  const parsed = parseServerTimingHeader(hdr);
  assert.equal(parsed[0]?.name, "proxy");
  const gate = evaluateLatencyBudget({
    endpoint: "GET /",
    p50Ms: 33.3,
    p95Ms: 44.0,
    budgetP50Ms: 80.0,
    budgetP95Ms: 160.0,
    serverTimingHeader: hdr,
    requiredMetrics: ["proxy", "total"],
  });
  assert.equal(gate.passed, true);

  // 6. PORT-PERF-ETAG-005: Weak ETag & 304 Not Modified revalidation
  const etag = computeWeakETag({ ok: true, service: "tsai-portal" });
  assert.ok(etag.startsWith('W/"'), "computeWeakETag must return a W/ weak ETag");
  assert.equal(matchesIfNoneMatch(etag, etag), true);
  assert.equal(matchesIfNoneMatch(`W/"other", ${etag}`, etag), true);
  assert.equal(matchesIfNoneMatch('W/"mismatch"', etag), false);
  assert.ok(
    telemSrc.includes("computeWeakETag") &&
      telemSrc.includes("matchesIfNoneMatch") &&
      telemSrc.includes("status: 304"),
    "telemetry/event/route.ts must support weak ETag 304 Not Modified revalidation"
  );

  // 7. PORT-PERF-TELEM-006: Visitor ID memoization, 2s duplicate-beacon coalescing, 5s timeout & event-type allowlist
  const trackerSrc = fs.readFileSync(path.join(root, "src/lib/telemetry/tracker.ts"), "utf8");
  assert.ok(
    trackerSrc.includes("cachedVisitorId") &&
      trackerSrc.includes("RECENT_BEACON_DEDUP_MS = 2_000") &&
      trackerSrc.includes("PORTAL_ALLOWED_EVENT_TYPES") &&
      trackerSrc.includes("AbortSignal.timeout(5_000)"),
    "src/lib/telemetry/tracker.ts must memoize visitor ID, coalesce duplicate rapid beacons within 2s, normalize event types, and apply a 5s AbortSignal timeout"
  );
  assert.ok(
    telemSrc.includes("PORTAL_ALLOWED_EVENT_TYPES") &&
      telemSrc.includes("custom_event_type") &&
      !telemSrc.includes("console.error("),
    "telemetry/event/route.ts must normalize event types against PORTAL_ALLOWED_EVENT_TYPES and use console.warn instead of console.error"
  );

  console.log("[PASS] tsai-portal Wave 5, Wave 6, Wave 10 & Wave 11 (7/7) performance optimization invariants verified.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


