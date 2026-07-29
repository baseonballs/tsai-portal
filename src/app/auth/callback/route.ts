import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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
    const supabase = await createClient(publicOrigin)
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.session?.user) {
      const user = authData.session.user
      const userEmail = user.email?.toLowerCase() || ""

      // Authorization Gate: Check if user exists in Supabase profiles (by id or email)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, status, user_type, email')
        .or(`id.eq.${user.id},email.eq.${userEmail}`)
        .maybeSingle()

      // If no authorized profile exists in Supabase or status is revoked, block entry
      if (!profile || (profile.status && profile.status === 'revoked')) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=unauthorized', publicOrigin))
      }

      return NextResponse.redirect(new URL(next, publicOrigin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', publicOrigin))
}
