import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveServerAuthUrl } from "./resolve-server-auth-url";

export async function createClient(origin?: string) {
  const cookieStore = await cookies();

  const supabaseUrl = resolveServerAuthUrl(origin);

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2OTUzNDIxLCJleHAiOjQ5MjA1NTM0MjF9.rCiQlHJSsO5GsUXIN8vqS7wWLU3DVitL6gSpkxHBc08",
    {
      cookieOptions: {
        name: 'tsai-landing-auth',
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
