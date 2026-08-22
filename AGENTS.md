<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fail-Fast Architecture & Zero Silent Fallbacks Invariant (First Principles)
- **Zero Silent Fallbacks:** NEVER implement silent fallbacks, synthetic mock objects in production runtime paths, secondary fallback routing that papers over missing configuration, or unauthenticated dummy defaults.
- **Fail Fast, Fail Loud:** If a required credential, environment variable, upstream service, session context, or database record is missing, corrupted, or unreachable, fail immediately and explicitly with an actionable error message describing the exact missing prerequisite.
- **Root Cause Transparency:** Papering over failures with synthetic fallbacks causes state desynchronization, ghost bugs, mixed profile persona bugs, and false-positive health passes. Systems must always enforce strict precondition assertions at the boundary.
