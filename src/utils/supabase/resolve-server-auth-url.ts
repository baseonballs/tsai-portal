/**
 * Server-side Supabase API base URL.
 *
 * PORT-PERF-AUTH-003: On local DGX runtime (TSAI_DEPLOY_TARGET !== 'cloudrun'),
 * route server-side requests directly to local Kong (127.0.0.1:5550) instead of
 * looping through the Next.js /supabase proxy route or Tailscale Funnel.
 */
export function resolveServerAuthUrl(origin?: string): string {
  const internalUrl = process.env.SUPABASE_INTERNAL_URL?.trim().replace(/\/$/, '')
  if (internalUrl) {
    return internalUrl
  }

  if (process.env.TSAI_DEPLOY_TARGET === "cloudrun") {
    if (origin) {
      return `${origin.replace(/\/$/, '')}/supabase`
    }
    const port = process.env.PORT?.trim() || '8080'
    return `http://127.0.0.1:${port}/supabase`
  }

  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
  if (envUrl) {
    try {
      const parsed = new URL(envUrl)
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5550'
      }
    } catch {
      // fall through
    }
    return envUrl
  }

  return 'http://127.0.0.1:5550'
}
