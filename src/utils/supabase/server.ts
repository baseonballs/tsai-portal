import { required } from "../require-env";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveServerAuthUrl } from "./resolve-server-auth-url";

export async function createClient(origin?: string) {
  const cookieStore = await cookies();

  const supabaseUrl = resolveServerAuthUrl(origin);

  return createServerClient(
    supabaseUrl,
    required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookieOptions: {
        name: 'tsai-portal-auth',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
