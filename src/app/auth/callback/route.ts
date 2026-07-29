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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const publicOrigin = getPublicOrigin(request)

  if (code) {
    const supabase = await createServerClient(publicOrigin)
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.session?.user) {
      const user = authData.session.user
      const userEmail = (user.email || "").toLowerCase().trim()

      // Service Role Client to query profiles table without RLS restrictions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://spark-62db.tail18f71b.ts.net:8443/supabase"
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.gbbZ4WDzX4hWzPYD4bhsNcPCTwo1Iv6hTex_Xsi4nqI"
      const adminClient = createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })

      // Authorization Gate: Query profiles table via admin client
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, status, user_type, email')
        .or(`id.eq.${user.id},email.eq.${userEmail}`)
        .maybeSingle()

      // If user profile exists, check if active or superadmin
      let isAuthorized = false
      if (profile) {
        const role = (profile.user_type || "").toLowerCase()
        const isSuper = role === "superadmin" || role === "superuser" || role === "devops" || role === "admin"
        if (isSuper || !profile.status || profile.status !== 'revoked') {
          isAuthorized = true
        }

        // Auto-bind user.id to profile if found by email
        if (isAuthorized && profile.id !== user.id) {
          await adminClient.from('profiles').update({ id: user.id }).eq('email', userEmail)
        }
      } else {
        // Fallback: Check user metadata / app_metadata in auth.users for superadmin role
        const role = ((user.app_metadata?.user_type || user.user_metadata?.user_type || "") as string).toLowerCase()
        if (role === "superadmin" || role === "superuser" || role === "devops" || role === "admin") {
          isAuthorized = true
        }
      }

      // If unauthorized, terminate session and redirect to error page
      if (!isAuthorized) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=unauthorized', publicOrigin))
      }

      return NextResponse.redirect(new URL(next, publicOrigin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', publicOrigin))
}
