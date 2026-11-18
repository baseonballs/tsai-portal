import { NextResponse, type NextRequest } from "next/server";

import { withoutProxyTrustHeaders } from "@/lib/auth/proxy-trust-headers";
import { legacyHostRedirect } from "@/lib/legacy-host-redirect";
import { maintenanceResponse } from "@/lib/maintenance";

/**
 * The portal had no proxy (Next 16's rename of middleware) at all before this.
 *
 * That is why it could not be gated: `bifrost cloud maintenance on` sets
 * MAINTENANCE_MODE=1 on the service and then POLLS the public hostname until it
 * agrees, failing if it never does. A portal that reads the variable nowhere would
 * have kept answering 200, the gate would never have confirmed, and `maintenance on`
 * would have failed at STAGE 0 OF EVERY ROUND. Adding tsai-portal to AppFrontends
 * without this file first was attempted and reverted for exactly that reason.
 *
 * This runs on every matched request, so it stays deliberately small: when
 * MAINTENANCE_MODE is unset — which is nearly always — maintenanceResponse() returns
 * null on its first line and the request continues untouched. The portal behaves
 * exactly as it did before unless the gate is explicitly closed.
 */
export async function proxy(request: NextRequest) {
  // The old domain never serves a page (owner rule 2026-11-18): a request on it is
  // sent to the same path on the official host before anything else runs. It is a
  // fixed-table 308 that needs no backend and leaves health paths alone, so it is the
  // one thing safe ahead of the maintenance gate — the official host then answers
  // 503 itself while a window is open.
  const moved = legacyHostRedirect(request);
  if (moved) return moved;

  // The gate must not depend on the backends it exists to shield users from; asking
  // Supabase to confirm Supabase is down fails exactly when it matters most. Nothing
  // but the fixed-table redirect above belongs in front of it.
  //
  // A non-null verdict ENDS the request (a 503, or the 302 that strips a redeemed pass from the
  // URL). A valid operator pass is `null` — "no objection" — and continues below like any other
  // request: the pass opens the gate and is never a session.
  const closed = await maintenanceResponse(request, "Transcend");
  if (closed) return closed;

  // Forwarded with an explicit header list (`x-middleware-override-headers`), so a trust header the
  // caller sent never reaches a route or a server component.
  const res = NextResponse.next({ request: { headers: withoutProxyTrustHeaders(request.headers) } });
  res.headers.set("Server-Timing", 'proxy;dur=0.1;desc="portal-proxy"');
  return res;
}

export const config = {
  // Static assets are excluded so a closed gate still serves the CSS and images the
  // maintenance page itself needs, and so the common case costs nothing.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest\\.webmanifest|images/|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|woff2?)$).*)",
  ],
};
