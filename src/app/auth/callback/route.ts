import { resolveAuthRedirectPath } from "@/lib/auth/safe-internal-next-path";
import { createPortalAdminClient, isUserEntitledToPortal } from "@/lib/auth/portal-entitlement";
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

function getPublicOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")

  if (forwardedHost && !forwardedHost.startsWith("0.0.0.0") && !forwardedHost.startsWith("127.0.0.1")) {
    return `${forwardedProto}://${forwardedHost}`
  }

  if (url.origin.includes("0.0.0.0")) {
    return "https://hub.transcendental-sports.ai"
  }

  return url.origin
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = resolveAuthRedirectPath(url.searchParams.get('next'), '/')
  const publicOrigin = getPublicOrigin(request)

  if (code) {
    const supabase = await createServerClient(publicOrigin)
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.session?.user) {
      const user = authData.session.user
      const userEmail = (user.email || "").toLowerCase().trim()

      // Service Role Client to query user_product_licenses & profiles without RLS restrictions.
      // Phase 156: the URL comes from the same resolver every other server path uses — it no
      // longer falls back to a hard-coded tailnet host when the env is missing.
      const adminClient = createPortalAdminClient()

      // Qualify license entitlement
      const { isEntitled, profileId } = await isUserEntitledToPortal(
        adminClient,
        user.id,
        userEmail,
        user.app_metadata || {}
      )

      if (isEntitled) {
        // Auto-bind user.id to profile if found by pre-authorized email
        if (profileId && profileId !== user.id) {
          await adminClient.from('profiles').update({ id: user.id }).eq('email', userEmail)
        }
        return NextResponse.redirect(new URL(next, publicOrigin))
      }

      // Unlicensed user / shadow profile / unauthorized account: terminate session
      // GLOBAL, deliberately. An unlicensed or unauthorized account is an account-
      // level denial, not a browser-level one.
      await supabase.auth.signOut({ scope: "global" })
      return NextResponse.redirect(new URL('/login?error=unauthorized', publicOrigin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', publicOrigin))
}
