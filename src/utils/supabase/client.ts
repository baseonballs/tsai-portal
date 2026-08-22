import { required } from "../require-env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3040/supabase');

  return createBrowserClient(
    supabaseUrl,
    required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookieOptions: {
        name: 'tsai-portal-auth',
      }
    }
  );
}
