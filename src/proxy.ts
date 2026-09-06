import { NextResponse, type NextRequest } from "next/server";

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
  // FIRST and ONLY. The gate must not depend on the backends it exists to shield
  // users from; asking Supabase to confirm Supabase is down fails exactly when it
  // matters most. Nothing else belongs in front of it.
  const closed = await maintenanceResponse(request, "Transcend");
  if (closed) return closed;

  return NextResponse.next();
}

export const config = {
  // Static assets are excluded so a closed gate still serves the CSS and images the
  // maintenance page itself needs, and so the common case costs nothing.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest\\.webmanifest|images/|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|woff2?)$).*)",
  ],
};
