import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient(url.origin)
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.session?.user) {
      const user = authData.session.user

      // Authorization Gate: Verify user is an authorized account in the Supabase database
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, status, user_type')
        .eq('id', user.id)
        .maybeSingle()

      // If no profile exists in Supabase or status is revoked/disabled, block entry
      if (!profile || (profile.status && profile.status === 'revoked')) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=unauthorized', url.origin))
      }

      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', url.origin))
}
