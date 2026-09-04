<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know


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
<!-- END:nextjs-agent-rules -->

# Fail-Fast Architecture & Zero Silent Fallbacks Invariant (First Principles)
- **Zero Silent Fallbacks:** NEVER implement silent fallbacks, synthetic mock objects in production runtime paths, secondary fallback routing that papers over missing configuration, or unauthenticated dummy defaults.
- **Fail Fast, Fail Loud:** If a required credential, environment variable, upstream service, session context, or database record is missing, corrupted, or unreachable, fail immediately and explicitly with an actionable error message describing the exact missing prerequisite.
- **Root Cause Transparency:** Papering over failures with synthetic fallbacks causes state desynchronization, ghost bugs, mixed profile persona bugs, and false-positive health passes. Systems must always enforce strict precondition assertions at the boundary.
