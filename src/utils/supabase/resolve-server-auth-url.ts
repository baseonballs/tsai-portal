/**
 * Server-side Supabase API base URL.
 */
export function resolveServerAuthUrl(origin?: string): string {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')

  if (origin) {
    return `${origin}/supabase`
  }

  if (envUrl) {
    return envUrl
  }

  const port = process.env.PORT?.trim() || '3040'
  return `http://localhost:${port}/supabase`
}
