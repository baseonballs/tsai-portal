# TSAI-PORTAL v0.4.2.beta — Phase 156: public exposures closed

**Version:** `TSAI-PORTAL.v0.4.2.beta` (package `0.4.2.beta`) · **Date:** 2026-11-16 · **Track:** FEAT-MASCE-H2O-001, mock/fake-data removal, Phase 156

**Gates (new, all in `pnpm test`):**
- `scripts/test-phase156-portal-exposures-closed.ts`: 11 checks.
- `scripts/test-no-real-names.ts`: the shared owner-only real-names matcher, copied from
  Spotlight/Periodical into `scripts/lib/real-names.ts`.
- `test:docs-content`: the docs content check, run over Spotlight's manual at the source.

**NOT DEPLOYED.** Everything below is fixed in source only. Each exposure stays live on
production until the owner deploys this release.

## What was exposed, and what changed

### 1. `/docs` served internal engineering docs to any account
- **Before:**
  - `scripts/copy-docs.sh` copied three trees into the image: Spotlight's customer manual, Periodical's
    whole `docs/` directory, and Watson's `docs/`.
  - The Periodical and Watson trees are internal material (architecture, runbooks, release notes). They
    carried operator identities, internal hostnames and real users' names. The new check finds
    127 findings in the Periodical tree and 5 in the Watson tree.
  - The page required only a session. The password sign-in never checked a licence, so any GoTrue
    account qualified.
  - The loader would open any file under a tree by path, not just the files in the sidebar.
  - The build line `copy-docs.sh || true` swallowed copy failures.
- **Now:**
  - Only Spotlight's manual is copied (`set -euo pipefail`). If the source is missing, the copy fails.
  - `scripts/check-docs-content.mjs` runs on the copy. It refuses any email address outside the
    reserved example domains, phone numbers, tailnet hosts, the DGX host name, private or tailnet IP
    addresses, JWTs, and `service_role`. Findings report file, line and rule only, never the matched
    text. `deploy.sh` runs the copy under `set -euo pipefail`, so a finding stops a deploy.
  - `src/lib/docs/manifest.ts` lists the only slugs the Portal publishes. `loadDoc(slug)` is
    Spotlight-only and resolves through it, so an unlisted file is "not found".
  - The page checks entitlement on the server (`getEntitledPortalUser`), which verifies the user with
    GoTrue `getUser` rather than trusting the cookie through `getSession`. An unlicensed account sees
    neither the documents nor the index. The Periodical and Watson tabs are gone.

### 2. Password sign-in skipped the licence check
- **Before:** the OAuth callback checked licences and signed unlicensed accounts out. The password
  form on `/login` redirected straight to `/`.
- **Now:**
  - `src/lib/auth/portal-entitlement.ts` holds the one rule, used by both the callback and the new
    route.
  - The new `POST /auth/entitlement` route runs after `signInWithPassword` and signs an unlicensed
    account out globally.
  - The login page also clears the local session, then redirects to the safe `next` path.
  - A failed profile or licence lookup now throws instead of reading as "no licence".

### 3. Unauthenticated roster import, with a committed HMAC secret
- **Before:** `POST /api/rosters/import` had no auth. `gamesheet-roster-service.ts` signed with
  `options.signingSecret || DEFAULT_SECRET`, and the default was a literal committed to the repo.
- **Now:** the route, the service and its test are deleted, along with `test:roster-import`.
- **Owner note:** the same literal is still in Watson (`lib/roster/gamesheet-importer.ts`, Phase 157).
  Anything that verifies signatures made with it should be treated as forgeable until it is rotated.

### 4. Open Stripe routes
- **Before:**
  - `POST /api/billing/stripe/connect` had no auth. It created real Stripe Express accounts from a club
    id and email in the request body, and answered with a simulated `acct_sim_…` "success" when the key
    was missing.
  - `POST /api/billing/hardware/checkout` simulated the same way.
  - `POST /api/billing/stripe/checkout` started anonymous subscriptions at a default price. The Portal
    has no Stripe webhook, so a payment there provisioned nothing.
  - No mounted page called any of the three. Their only caller was `ClubMonetizationWorkbench`, which
    was itself mounted nowhere.
- **Now:** all three routes and the workbench are deleted. The club tests assert the routes are absent.
  The gate fails on any Stripe route handler and on any `isSimulation`, `acct_sim_` or `_sim_` path.

### 5. Telemetry trusted the client's identity, and journeys never recorded
- **Before:**
  - `POST /api/telemetry/event` took `user_id` and `lead_id` from the request body, so any anonymous
    caller could attach events and journeys to any account.
  - Every journey write used columns that do not exist in the live table (`total_pageviews`,
    `total_session_sec`, `funnel_stage`, `first_touch_source`, `first_landing_page`) and stage values
    outside the `lifecycle_stage` enum.
  - The errors were dropped, so no visitor journey was ever recorded.
- **Now:**
  - The user is the verified session's user, or none. `lead_id` is never client-supplied, and nothing
    hands one to the browser.
  - Journey writes follow the live schema (Spotlight migration `20260725160000`), and a stage set
    elsewhere is never downgraded.
  - Every write error returns 500.

### 6. Hard-coded tailnet host
- **Before:** the OAuth callback and the `/supabase` proxy fell back to the DGX tailnet URL when the
  environment was missing. The proxy's redirect rewrite also named that host literally.
- **Now:**
  - The callback uses `resolveServerAuthUrl()`, like every other server path.
  - The proxy requires `TSAI_DGX_ORIGIN`, which the Cloud Run service template already sets.
  - The redirect rewrite compares against the configured upstream instead of the literal host.

### 7. Public, shared-cacheable headers on auth paths
- **Before:** `next.config.ts` sent `Cache-Control: public, s-maxage=86400` on every path, including
  the GoTrue proxy (token responses), the OAuth callback (session cookies) and `/docs`.
- **Now:**
  - `/api`, `/auth`, `/supabase`, `/docs` and `/login` (with or without a trailing slash) are sent as
    `private, no-store` with `Vary: Cookie, Authorization`.
  - A route handler's own header takes precedence over the config, so the gate also requires every
    `Cache-Control` set in a route handler to be `private`. The one such handler is the static
    telemetry health `GET`, which sends `private, max-age=15` and carries no user data.
  - The public marketing pages keep their public caching. This was verified on `next start`.

### 8. A real minor on public marketing pages
- **Before:** five public pages and components used a real minor (listed in the owner's name list) as a
  case study: first name, last initial, jersey number and a 14U team. A real coach's first name appeared
  there as well. Test fixtures carried the same minor's full name, real college prospects, and a real
  coach's name and email.
- **Now:** the pages say "the athlete" and "your coach". Fixtures use neutral stand-ins at
  `example.com`.
- `test-no-real-names` matches the owner-only list across `src/` (including the copied docs),
  `public/`, `scripts/`, `infra/`, `docs/` and the root files. Two single-token collisions are
  documented by hash: a lockfile package name, and part of a historical script file name. On this tree
  it scans 246 files with no hits; on the old coachs-corner page it fails.
- The gate also refuses any `#<jersey> <Name>` persona unless the word is a generic role (Skater,
  Athlete, …), and any contact address outside the reserved example names and the company domain.

## Verification (local)
- `pnpm test`: all 33 chained scripts pass, including the gate at 11/11 and `test-no-real-names`.
- `tsc` reports 0 errors.
- `pnpm lint` reports 0 errors and 153 warnings (155 on main).
- `pnpm build` passes.
- Gate mutations: 18 of 18 were killed. Each one reverted a fix: the docs entitlement, the manifest,
  the Periodical copy, the login licence check, the telemetry body user (in the destructure, and as a
  `body.user_id` read), the private cache (the rule, `/login/`, and the lookahead), a public
  route-handler header, the tailnet default, two personas (`#26 <First> <I>.` and `#26 <First>`), the
  entitlement error, the docs phone rule, a second entitlement copy, a phantom journey column, and the
  restored roster route.
- `test-no-real-names` fails on the pre-156 coachs-corner page.
- Smoke test on `next start`:
  - `/docs`, `/docs/spotlight/*` and `/docs/periodical/*` all return 307 to `/login`.
  - `POST /auth/entitlement` without a session returns 401.
  - The removed routes return 404.
  - Cache headers are as described in section 7.
- **Live-data note:** one smoke `POST /api/telemetry/event` reached the live identity tier before the
  journey fix. It wrote one anonymous `user_telemetry_events` row (`visitor_id = phase156-smoke`,
  `user_id` null, which shows the body's `user_id` was ignored). The row is left in place for the owner
  to keep or delete.

## Deploy notes
- No new environment variables. `TSAI_DGX_ORIGIN`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are already set on the service, and a
  missing one now fails loudly.
- `deploy.sh` must run where `../tsai-spotlight` is checked out. The docs copy now fails instead of
  shipping without the manual.

## Not in this release (follow-ups)
- Pages that show built-in fake data, a separate class from security and PII: `/tournament/director`,
  `/club-revshare`, `/byod-setup`, and the built-in `DEFAULT_CLUB_STRIPE_PROFILE`.
- `getPublicOrigin` in the OAuth callback trusts `X-Forwarded-Host`. A browser cannot set that header,
  but the code-exchange host should come from configuration.
- Watson (Phase 157): the same committed roster secret, and its own docs and routes.
