import { pgrstEq } from '@/lib/supabase/postgrest-filter'
import { resolveAuthRedirectPath } from "@/lib/auth/safe-internal-next-path";
import { required } from "@/utils/require-env";
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getPublicOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")

  if (forwardedHost && !forwardedHost.startsWith("0.0.0.0") && !forwardedHost.startsWith("127.0.0.1")) {
    return `${forwardedProto}://${forwardedHost}`
  }

  if (url.origin.includes("0.0.0.0")) {
    return "https://hub.tsai-spotlight.com"
  }

  return url.origin
}

/**
 * Qualifies whether an authenticated user holds a valid product license / entitlement.
 * - Superadmins / Devops de facto possess all product licenses.
 * - Licensed users must have an active entry in user_product_licenses or app_metadata.licenses.
 * - Shadow profiles and unlicensed users are rejected.
 */
async function isUserEntitledToPortal(
  adminClient: any,
  userId: string,
  userEmail: string,
  appMetaData: Record<string, any> = {}
): Promise<{ isEntitled: boolean; profileId?: string }> {
  // 1. Query profile for user_type, approval_status, and superadmin flag
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, approval_status, user_type, is_superadmin, email')
    .or([pgrstEq("id", userId), pgrstEq("email", userEmail)].join(","))
    .maybeSingle()

  const profileId = profile?.id

  // Superadmins / Devops de facto possess all product licenses
  const role = ((profile?.user_type || appMetaData.role || appMetaData.user_type || "") as string).toLowerCase()
  const isSuperadmin = profile?.is_superadmin === true || role === "superadmin" || role === "superuser" || role === "devops"

  if (isSuperadmin) {
    return { isEntitled: true, profileId }
  }

  // 2. Check public.user_product_licenses for active product licenses
  const queryUserId = profileId || userId
  const { data: userLicenses } = await adminClient
    .from('user_product_licenses')
    .select('id, product_id, status')
    .eq('user_id', queryUserId)

  const activeLicenses = userLicenses?.filter((l: any) => l.status === 'active') || []
  if (activeLicenses.length > 0) {
    return { isEntitled: true, profileId }
  }

  // 3. Fallback: Check synced licenses array in raw_app_meta_data
  const syncedLicenses = (appMetaData.licenses || []) as string[]
  if (Array.isArray(syncedLicenses) && syncedLicenses.length > 0) {
    return { isEntitled: true, profileId }
  }

  return { isEntitled: false, profileId }
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

      // Service Role Client to query user_product_licenses & profiles without RLS restrictions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://spark-62db.tail18f71b.ts.net:8443/supabase"
      const serviceKey = required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
      const adminClient = createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })

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
