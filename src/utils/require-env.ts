/**
 * Assert that a required environment variable is present, and fail loudly if it is not.
 *
 * WHY THIS TAKES THE VALUE AND NOT THE NAME
 *   The obvious signature is `requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")`. It does not work.
 *   Next.js inlines `NEXT_PUBLIC_*` variables at BUILD time, and only where they are accessed
 *   literally as `process.env.NEXT_PUBLIC_FOO`. A dynamic lookup — `process.env[name]` — is not
 *   rewritten, so in the browser it evaluates to `undefined` and this helper would throw on a
 *   correctly configured deploy.
 *
 *   Passing the value keeps the literal access at the call site, where the bundler can see it:
 *
 *       required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
 *
 * WHY FAIL AT ALL, RATHER THAN FALL BACK
 *   These call sites used to read `process.env.X || "<a real committed key>"`. The problem was
 *   never only that a secret sat in git — it was that a deploy with the variable MISSING kept
 *   working, silently authenticating with whatever had been committed. A missing credential is a
 *   broken deploy, and it should look like one immediately rather than succeed against the wrong
 *   project. See scripts/check-no-hardcoded-credentials.mjs, which now refuses the old pattern.
 */
export function required(value: string | undefined | null, name: string): string {
  if (value === undefined || value === null || value.trim() === "") {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `It previously fell back to a value committed to source, which let a misconfigured ` +
        `deploy keep running against the wrong credential. Set ${name} in this environment.`,
    );
  }
  return value;
}
