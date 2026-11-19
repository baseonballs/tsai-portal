## 🛑 LIVE SYSTEM — NO MOCK / FAKE DATA, NO FALLBACKS, PERIOD (OWNER RULE — ABSOLUTE)

Transcend is a **live system with real users, including minors.** The owner has stated this rule repeatedly. It
outranks convenience, demos, deadlines and "temporary" workarounds, and it applies to every agent (Claude, Gemini /
Antigravity, Cursor, Codex) in every repo, app and platform: web, iOS, tvOS, CLI, scripts and pipelines.

1. **No mock or fake data — period.** Do not add sample, demo, seed, placeholder, preview, "beta" or built-in
   data of any kind to code that can run for a user. That includes built-in profiles, people, names, jerseys,
   rosters, teams, series, games, scores, schedules, film, photos and identities. No default, no feature flag, no
   "for now".
2. **No fallback to mock or fake data — period.** If the real source is empty, unreachable or refuses the
   request, show an honest empty state or an explicit error and fail loudly. Never substitute something that looks
   like data, a cached copy of someone else's data, or a guess.
3. **Core services come from the Transcend backend.** No app keeps its own copy of these, invents its own
   identity, or decides access on its own:

   | Core service | Comes from |
   |---|---|
   | Identity, sign-in and sessions | The platform's GoTrue: Google through the platform's OAuth edge, Apple through GoTrue's `id_token` exchange |
   | People, teams, rosters, schedules, games and film | hockey-api (`hockey_db`) |
   | Entitlement | The platform's licences and plans |
   | Mail | tsai-notify |

4. **If the backend endpoint you need does not exist, build it.** Build it in the backend, scope it to the
   caller, check access on the server and test it, then call it. Do not work around a missing endpoint with:
   - local data or a hard-coded list;
   - a guess made on the client;
   - a call to a route the caller is not authorised for.

   If you cannot build it in the current task, stop and say so. Leave the feature visibly unavailable; never fake it.
5. **Authentication is real or absent.** Every sign-in must end in a platform session that the backend verifies
   (a GoTrue access token). All of these are fake authentication and forbidden:
   - an identity kept only on the device;
   - a raw Apple or Google token, or a provider user id, sent as a bearer;
   - a role assigned by default;
   - a "preview" or "demo" login;
   - a built-in account picker.

**Tests:** fixtures may live only inside test files. They must be neutral (no real names or contacts), never
importable by app code, and never shipped in a build.

**Why this rule exists (2026-11-16):** the Spotlight iOS app shipped all of these:
- five built-in household profiles with real children's first names;
- a "Load Beta Preview Profiles" button that attached two minors to *any* signed-in account;
- a Sign in with Apple that never reached the platform (the identity stayed on the phone and the role defaulted
  to guardian);
- a catalogue of two hard-coded teams, answered by series built into the code with no login check.

As a result, entitled users could not see their own team's tournament. The fix was to build what was missing in
the backend: a caller-scoped season-index endpoint with a Teams-plan entitlement check, and real GoTrue sign-in.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know


<!-- END:nextjs-agent-rules -->

<!-- Kept OUTSIDE <!--BEGIN/END:nextjs-agent-rules-->. An earlier copy sat inside that
     managed block and was erased when the block regenerated, so the rule the owner asked
     to be permanent lasted until the next tool run. -->

## 🛑 REAL CAPABILITY ON LIVE DATA — RULE OF LAW (OWNER RULE — ABSOLUTE, 2026-11-18)

The LIVE SYSTEM rule above says what must never ship. This rule says what must ship instead. Both bind every agent
(Claude, Gemini / Antigravity, Cursor, Codex) and every human, in every repo, app and platform.

1. **We build real capability on live data. Nothing else counts as progress.** A feature is done only when it reads
   and writes live backend data end to end for a real signed-in account. Modules, batches, tranches, test counts,
   version bumps and "COMPLETED" checkmarks are not progress. A status that says COMPLETED without live-data
   evidence is false and must be corrected.
2. **Removal is not a fix.** Never delete a user-facing capability (page, view, menu entry, route, endpoint, export,
   pipeline stage) because its data is fake. Replace the data source with the live backend. If the endpoint, table
   writer or ingest does not exist, build it (LIVE SYSTEM rule 4). While you build it, the feature stays in place
   and shows an honest empty or "not yet available" state.
3. **Only the owner retires a capability.** Retiring a capability needs the owner's written decision, recorded in
   the retirement ledger of the Conductor epic `PLAT-DATA-EPIC-REAL-DATA-FOUNDATION` (tsai-sitedocs), with the
   commit that removes it. A removal without a ledger entry is a regression and gets reverted, then rebuilt.
4. **The two committed real seasons are the reference data.** The owner has committed two team seasons for real-data
   use: **16U AAA 2026-27** and **14U-2 A 2026-27**. They enter the platform only through the backend's ingest:
   schedule sync, the GameSheet / box-score importers and hockey-api. They are never embedded in code, fixtures,
   seeds or migrations. Every feature is validated against them on the local stack before it ships.
5. **Every surface states its live-data provenance.** Any change that adds, changes or removes a user-facing
   surface states, in its PR and in the epic's audit log:
   - which backend endpoint it reads;
   - which table backs that endpoint;
   - which real writer fills that table (an importer, a sync, or a user action).

   A surface with no live source does not ship. The release surface guard enforces this and blocks the release.
6. **A test against a fixture does not prove a feature.** Unit tests may use neutral fixtures inside test files.
   Each feature also needs one recorded verification against the live local stack, signed in as a real account on
   one of the committed teams. That verification goes in the epic's `status.md`.
7. **Everything is audited, from now on.** Each change follows the Conductor SDLC: canonical spec, then epic
   track, then build, then verification, then sign-off. It gets an independent review (Gemini / agy, read-only),
   and its audit entry goes in the epic. When an agent finds a removed or fake-backed capability, it records the
   gap in the epic's gap register. It never quietly works around the gap.

**Why this rule exists (2026-11-18):** the fake-data cleanup deleted features instead of rebuilding them on live
data. Periodical lost its Season & Game Series view, and the linked athlete's real season disappeared. The forensic
audit then showed the platform had been growing on a demo foundation: features were measured by module and tranche
counts and fed by built-in data, while the backend tables they needed had no writer. The roadmap that rebases the
foundation on the two committed seasons is `PLAT-DATA-EPIC-REAL-DATA-FOUNDATION`, and its gap analysis is GA-030.

## 🚫 NO CLOUD BUILD OR CLOUD RUN DEPLOYS AFTER ITERATIONS — BINDING GOVERNANCE

**Cloud Build and Cloud Run deploy directly to production.** Agents must NEVER run Cloud Build or deploy to
Cloud Run (`./deploy.sh`, `gcloud builds submit`, `gcloud run deploy` / `services update`, `bifrost release`)
during task iterations, UI tweaks, bug fixes or routine pair programming. Test that work locally (`pnpm dev`,
`pnpm dev:lan`, `pnpm run daemon:restart`, local test suites, or the LAN/tailnet path to local ports).

**A full rebuild is the exception, and it covers EVERY component (owner, 2026-11-17).** When the owner asks for a
full rebuild or a release, nothing is left out: the DGX tier *and* the Cloud Run frontends. It runs behind
maintenance mode, which keeps everyone except the owner and designated testers out:

1. `bifrost cloud maintenance on`, then `bifrost cloud verify` shows 503 on every public hostname.
2. `sudo bifrost deploy stage0` through `stage6`, in order (stage 0 takes and verifies a backup first).
3. Each frontend's full suite and `pnpm build` pass locally on the exact commit being released, and its release
   notes exist in `docs/6-releases/RELEASE-<version>.md`.
4. `bifrost release --dry-run`, then `bifrost release`: Cloud Build → Cloud Run. It keeps `MAINTENANCE_MODE`,
   counts the gate's 503 as healthy, and rolls back a revision that fails its health check. Never the per-repo
   `deploy.sh`.
5. Watson (the local admin plane): suite and build pass, then `systemctl --user restart tsai-watson.service`.
6. The owner verifies through `bifrost cloud operator-pass`.
7. **Go-live is `bifrost cloud maintenance off`, and only on the owner's explicit word.**

Every gap the procedure hits is fixed in the procedure itself (bifrost, scripts, tests) and the run starts again,
never worked around by hand. Maintenance gates the web frontends only: native apps sign in against GoTrue directly,
which the gate does not cover (open gap). Runbook: `ops-maintenance-window-runbook.md` in tsai-sitedocs.

## 🚫 GITHUB ACTIONS IS NOT OUR CI — BINDING, NOT A PREFERENCE

**There is no GitHub Enterprise licence and no Actions budget.** Tests do not run on GitHub, and
that is a settled decision — not a temporary state awaiting a fix. It applies to every repo under
`dev/tsai/`.

Agents must NEVER:

- add a workflow that runs tests, or extend an existing one to run them;
- re-enable a workflow that is `disabled_manually` — **disabled means decided**, not broken;
- propose enabling GitHub CI, buying quota, or upgrading the plan as a remedy for anything;
- wait on, poll, or gate a merge on GitHub Checks;
- report a red, missing, or disabled GitHub check as a problem to solve.

Finding a disabled workflow is not a discovery. It is the documented state, and proposing its
return costs the owner a repeat of this paragraph.

**What IS allowed — the minimum, and only the minimum:** linting and typechecking, plus any narrow
smoke sweep already in place. Those are cheap, and they may run on Actions. Everything heavier —
unit, integration, e2e, database-backed suites — runs locally. Keep a permitted check at that size;
do not let one grow into a test runner.

**Verification happens locally, before you commit — and you run it and paste the output.** A local
run is the only evidence that counts here.

```bash
pnpm test:redirect-safety
pnpm build
```


This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


## 🔍 ALWAYS USE GRAPHIFY FIRST FOR CODEBASE QUERIES (NO BROAD GREP)
- **Graphify First Invariant:** Whenever exploring the codebase, researching architecture, tracing relationships, or locating symbols across `dev/tsai`, agents MUST query the existing knowledge graph FIRST using graphify (e.g. MCP tool `query_graph`, CLI `graphify query "<question>"`, or `./graphify-query.sh`).
- **Strict Prohibition on Broad Grep Scans:** Agents must NEVER run recursive, unbounded `grep -rn` or tree-wide scans across `dev/tsai`. Grep wastes execution context, triggers background command timeouts, and bypasses the pre-computed AST index. Grep is only permitted for pinpoint verification of an exact string within a specific, already-identified file or tight directory.
- **Querying Does Not Rebuild:** Querying the existing graph (`graphify query` / MCP `query_graph`) is instant and read-only. It provides scoped subgraphs without triggering a rebuild.

# Fail-Fast Architecture & Zero Silent Fallbacks Invariant (First Principles)
- **Zero Silent Fallbacks:** NEVER implement silent fallbacks, synthetic mock objects in production runtime paths, secondary fallback routing that papers over missing configuration, or unauthenticated dummy defaults.
- **Fail Fast, Fail Loud:** If a required credential, environment variable, upstream service, session context, or database record is missing, corrupted, or unreachable, fail immediately and explicitly with an actionable error message describing the exact missing prerequisite.
- **Root Cause Transparency:** Papering over failures with synthetic fallbacks causes state desynchronization, ghost bugs, mixed profile persona bugs, and false-positive health passes. Systems must always enforce strict precondition assertions at the boundary.

## 🔴 LIVE DATA MANDATE — TRANSCEND BETA PRODUCTION STAGING (BINDING INVARIANT)

- **Live Data Only:** Going forward, all development, testing, validation, and runtime operations across the Transcend platform MUST use live data.
- **Production Staged as Live:** The product is officially staged in production as live for the Transcend Beta.
- **Strict Prohibition on Synthetic / Mock / Dummy Data:** Mock fallback datasets, hardcoded placeholder rosters (e.g., `DEFAULT_16AAA_ROSTER`, static webcal JSON fixtures, dummy schedules, synthetic persona records) must NEVER be substituted into runtime paths or used as fallbacks.
- **Fail-Closed on Missing Data:** If real-world or live team/athlete data is absent, the system must fail-closed into an authentic empty state (e.g., Off-Season / Independent Training mode) or throw an explicit, actionable error. Never paper over absent data with mock or cross-tenant datasets.
- **COPPA & Tenancy Guard:** All live data access must strictly respect tenant boundaries and legal guardian consent scopes (e.g., 15U athletes must never be exposed to 16U team records, and vice versa). Cross-pollination between minor athlete profiles or rosters is a severe COPPA violation.

