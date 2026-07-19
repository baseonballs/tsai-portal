import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3040/supabase');

  return createBrowserClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2OTUzNDIxLCJleHAiOjQ5MjA1NTM0MjF9.rCiQlHJSsO5GsUXIN8vqS7wWLU3DVitL6gSpkxHBc08",
    {
      cookieOptions: {
        name: 'tsai-portal-auth',
      }
    }
  );
}
