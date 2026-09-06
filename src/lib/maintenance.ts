import { NextResponse, type NextRequest } from "next/server";

/**
 * Maintenance mode — an internet-facing kill switch.
 *
 * PORTED FROM tsai-spotlight/src/lib/maintenance.ts. The verification logic is kept
 * byte-for-byte deliberately: both apps redeem the SAME operator pass, minted by
 * `bifrost cloud operator-pass` against MAINTENANCE_OPERATOR_SECRET, so a divergence
 * between the two implementations would show up as an operator being admitted to one
 * app and refused by the other during the window they need both. Only the allow-list
 * and the app name differ, and both are below.
 *
 * The DGX services these apps depend on are being changed underneath them. A
 * user who reaches the app during that window does not see an outage; they see
 * their data behaving strangely, which is worse. This closes the door and says
 * so plainly.
 *
 * Design notes:
 *
 *  - Runs FIRST, before any auth or session work. Maintenance must not depend
 *    on the very backends that are down; a gate that needs Supabase to tell you
 *    Supabase is down is not a gate.
 *  - Returns 503 with Retry-After, not 200 and not a redirect. 503 is the only
 *    status that tells monitors and crawlers "temporarily unavailable" rather
 *    than "gone" — a 200 maintenance page gets indexed, and a redirect can be
 *    cached by intermediaries long after the window closes.
 *  - Health paths pass through, so orchestrator probes keep seeing a live
 *    container and do not cycle the revision while it is deliberately closed.
 *  - THERE IS NO BYPASS. Removed 2026-08-27 by the owner's decision: a maintenance
 *    window that can be stepped around is not a maintenance window, and the
 *    bypass could not be made safe. It ran BEFORE auth by necessity, so it could
 *    never check who was using it — the token WAS the identity, and anyone
 *    holding it was an operator. It also travelled in a query string, so the
 *    secret landed in request logs, browser history and outbound Referer headers.
 *
 *    To exercise the app against the live stack, lift maintenance. The window is
 *    the thing being tested; testing around it proves nothing about it.
 */

const ON = new Set(["1", "true", "yes", "on"]);

export function maintenanceEnabled(): boolean {
  return ON.has((process.env.MAINTENANCE_MODE ?? "").trim().toLowerCase());
}

/** Paths that must keep answering while the door is closed. */
function isAlwaysAllowed(pathname: string): boolean {
  return (
    pathname === "/healthz" ||
    pathname === "/api/health" ||
    pathname.endsWith("/health") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    // Legal pages stay reachable while the door is shut.
    //
    // A privacy policy and terms of service that disappear during maintenance are
    // missing at exactly the moment someone is deciding whether to trust the
    // platform — and they are referenced from outside it: the Google OAuth consent
    // screen requires public URLs for both, and Google fetches them. A 503 there
    // blocks publishing the app, which in turn keeps every non-test-user locked out
    // of sign-in. Found 2026-08-27 while trying to move the consent screen out of
    // Testing status.
    //
    // These pages are static, read-only, and depend on no backend, so serving them
    // during a window costs nothing and cannot mislead: they describe the terms,
    // not the state of the service.
    pathname.startsWith("/legal")
    // NO MARKETING EXEMPTION, and this was tried the other way first.
    //
    // The obvious design is to keep the pages that need no backend — /, /beta,
    // /coachs-corner, /docs — serving during a window, so a reset does not darken the
    // public face of the company. It was written that way and it does not work:
    //
    // `bifrost cloud maintenance on` does not trust its own update. confirmEnforcing()
    // POLLS the public hostname and fails after three minutes if it does not see a
    // 503 — and probe() requests exactly "https://<host>/", the ROOT. A portal whose
    // root answers 200 can never confirm, so `maintenance on` would fail at STAGE 0 OF
    // EVERY ROUND. Keeping the front page up would have cost the entire loop.
    //
    // Changing probe() to ask for some other path was the alternative, and it is
    // worse: the whole point of that function is that setting a variable is not the
    // same as the edge refusing traffic, so the thing it verifies must be the thing
    // the public actually reaches. Weakening the check to preserve a marketing page
    // trades a real guarantee for a cosmetic one.
    //
    // So the portal closes like the other two frontends. /legal stays open for the
    // same reason it does in Spotlight — Google fetches those URLs for the OAuth
    // consent screen, and a 503 there blocks publishing the app.
  );
}

/**
 * Operator access — the ONLY way through a closed gate.
 *
 * Specification: arch-maintenance-window-and-operator-access.md §4
 *
 * This is not a bypass. The gate stays shut for everyone else; a pass admits one
 * NAMED operator whose identity was authenticated elsewhere, and expires on its own.
 *
 * The static MAINTENANCE_BYPASS_TOKEN this replaces could not be made safe: this
 * gate runs before authentication (deliberately — it must not depend on the
 * services it shields), so a static secret WAS the identity. Anyone holding it was
 * an operator, forever.
 *
 * A signed pass changes what the gate is being asked to do. It still cannot
 * authenticate anyone; it verifies that an authenticated superadmin asserted this,
 * recently, for this person. That is the whole security argument, and its limit is
 * stated plainly: within its TTL, whoever holds the pass is the operator.
 *
 * Verification is local — HMAC and a clock — because the database may be exactly
 * what is being worked on.
 */
const PASS_PARAM = "sysadmin_token";
const PASS_COOKIE = "tsai_operator_pass";
/** Readable by the client so the banner can render. Carries NO secret. */
const BANNER_COOKIE = "tsai_operator_banner";
const PASS_SCOPE = "operator-access";

type OperatorPass = { sub: string; exp: number; jti: string; scope: string };

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Length-independent, value-independent compare. A `===` on a signature leaks how
 *  much of a forgery was correct, which is enough to finish constructing one. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyOperatorPass(pass: string, secret: string): Promise<OperatorPass | null> {
  const parts = pass.trim().split(".");
  if (parts.length !== 2) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const want = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(parts[0])));
    if (!constantTimeEqual(want, b64urlToBytes(parts[1]))) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0]))) as OperatorPass;
    if (payload.scope !== PASS_SCOPE) return null;
    // Seconds, matching the minter. A pass with no exp is not "never expires", it
    // is malformed — treat it as such rather than honouring it forever.
    if (!Number.isFinite(payload.exp) || Date.now() / 1000 >= payload.exp) return null;
    if (!payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie life never outlives the pass. A 15-minute pass must not buy four hours. */
function passCookieMaxAge(payload: OperatorPass): number {
  const remaining = Math.floor(payload.exp - Date.now() / 1000);
  return Math.max(0, Math.min(remaining, 60 * 60 * 4));
}

export async function maintenanceResponse(request: NextRequest, appName: string): Promise<NextResponse | null> {
  if (!maintenanceEnabled()) return null;
  if (isAlwaysAllowed(request.nextUrl.pathname)) return null;

  // Operator access. Absent a secret there is NO operator access at all — an empty
  // secret must never mean "everyone is an operator", which is how the mechanism
  // this replaced behaved when its token was unset.
  const passSecret = (process.env.MAINTENANCE_OPERATOR_SECRET ?? "").trim();
  if (passSecret) {
    const fromUrl = request.nextUrl.searchParams.get(PASS_PARAM);
    if (fromUrl) {
      const payload = await verifyOperatorPass(fromUrl, passSecret);
      if (payload) {
        // STRIP IT FROM THE URL. Without this redirect the pass stays in the
        // address bar, gets pasted into a chat message, and is emitted in Referer
        // on the first outbound link. Other query parameters are preserved.
        const clean = request.nextUrl.clone();
        clean.searchParams.delete(PASS_PARAM);
        const res = NextResponse.redirect(clean, 302);
        const maxAge = passCookieMaxAge(payload);
        res.cookies.set(PASS_COOKIE, fromUrl, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge,
        });
        // Readable by the client, carries no secret: the banner needs to say WHO
        // is in and for how long. An operator who forgets the window is open and
        // concludes users are back is the worst outcome here, worse than any
        // security failure this gate is likely to see.
        res.cookies.set(BANNER_COOKIE, JSON.stringify({ sub: payload.sub, exp: payload.exp }), {
          httpOnly: false,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge,
        });
        console.info(
          JSON.stringify({
            severity: "NOTICE",
            event: "maintenance_operator_pass_redeemed",
            sub: payload.sub,
            jti: payload.jti,
            path: request.nextUrl.pathname,
            ip: request.headers.get("x-forwarded-for") ?? null,
          }),
        );
        return res;
      }
      console.warn(
        JSON.stringify({
          severity: "WARNING",
          event: "maintenance_operator_pass_rejected",
          path: request.nextUrl.pathname,
          ip: request.headers.get("x-forwarded-for") ?? null,
        }),
      );
    }

    const fromCookie = request.cookies.get(PASS_COOKIE)?.value;
    if (fromCookie) {
      const payload = await verifyOperatorPass(fromCookie, passSecret);
      if (payload) return NextResponse.next();
      // Expired or revoked-by-rotation: clear it rather than letting a dead cookie
      // be re-checked on every request for the rest of the window.
      const closed = NextResponse.next();
      closed.cookies.delete(PASS_COOKIE);
      closed.cookies.delete(BANNER_COOKIE);
    }
  }

  const retryAfter = Number(process.env.MAINTENANCE_RETRY_AFTER ?? 1800);
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Retry-After": String(Number.isFinite(retryAfter) ? retryAfter : 1800),
    "Cache-Control": "no-store, must-revalidate",
    "X-Maintenance-Mode": "1",
  });

  // API and non-document requests get JSON — an HTML page inside a fetch() is
  // a parse error, which surfaces to the user as a bug rather than an outage.
  const accept = request.headers.get("accept") ?? "";
  const isDocument = accept.includes("text/html");
  if (!isDocument || request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({
        error: "maintenance",
        message: `${appName} is temporarily unavailable for planned maintenance.`,
        detail: process.env.MAINTENANCE_MESSAGE ?? undefined,
        retry_after_seconds: retryAfter,
      }),
      { status: 503, headers: new Headers({ ...Object.fromEntries(headers), "Content-Type": "application/json" }) },
    );
  }

  return new NextResponse(maintenancePage(appName), { status: 503, headers });
}

function maintenancePage(appName: string): string {
  const custom = (process.env.MAINTENANCE_MESSAGE ?? "").trim();
  const eta = (process.env.MAINTENANCE_ETA ?? "").trim();
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(appName)} — Temporarily Unavailable</title>
<style>
  :root{--bg:#0f1419;--card:#171e26;--ink:#e8edf3;--muted:#95a3b3;--rule:#26303b;--accent:#f0b429}
  @media (prefers-color-scheme:light){
    :root{--bg:#f5f7f9;--card:#fff;--ink:#141a22;--muted:#5a6673;--rule:#e0e5ea;--accent:#a86a00}
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:var(--bg);color:var(--ink);padding:24px;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.6}
  .card{max-width:33rem;width:100%;background:var(--card);border:1px solid var(--rule);
    border-radius:12px;padding:clamp(28px,5vw,44px)}
  .badge{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;
    letter-spacing:.09em;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none}
  @media (prefers-reduced-motion:no-preference){
    .dot{animation:p 2s ease-in-out infinite}
    @keyframes p{0%,100%{opacity:1}50%{opacity:.35}}
  }
  h1{font-size:clamp(23px,4vw,30px);line-height:1.25;margin:0 0 14px;letter-spacing:-.01em}
  p{margin:0 0 14px;color:var(--muted)}
  p.lead{color:var(--ink)}
  .assure{margin-top:24px;padding-top:20px;border-top:1px solid var(--rule);font-size:14.5px}
  .assure strong{color:var(--ink)}
  .eta{margin-top:16px;font-size:14px;color:var(--muted)}
  code{font-family:ui-monospace,Menlo,monospace;font-size:.9em}
</style></head>
<body><main class="card">
  <div class="badge"><span class="dot"></span>Maintenance in progress</div>
  <h1>${esc(appName)} is temporarily unavailable</h1>
  <p class="lead">We're performing planned maintenance on the backend services ${esc(appName)}
     depends on. The app is closed while that work is underway.</p>
  ${custom ? `<p>${esc(custom)}</p>` : ""}
  <p>There's nothing you need to do. Please try again a little later — the service will come
     back automatically as soon as the work is finished.</p>
  <div class="assure">
    <strong>Your data is safe.</strong> Nothing has been deleted or lost. Journals, media and
    account details are intact and will be exactly as you left them.
  </div>
  ${eta ? `<p class="eta">Expected back: ${esc(eta)}</p>` : ""}
</main></body></html>`;
}
