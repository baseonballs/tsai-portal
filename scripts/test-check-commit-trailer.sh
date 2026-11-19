#!/usr/bin/env bash
# Self-test for check-commit-trailer (T2.7). Builds a throwaway repo, so it proves the check FAILS on an
# untrailered commit and on an unreadable base, and passes on trailered ones. Identical in every repo.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK="$HERE/check-commit-trailer"
[[ -x "$CHECK" ]] || { echo "❌ $CHECK is missing or not executable"; exit 1; }
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
fail=0
expect() { # expect <0|1> <description> <cmd...>
  local want="$1" what="$2"; shift 2
  if "$@" >/dev/null 2>&1; then got=0; else got=1; fi
  if [[ "$got" == "$want" ]]; then echo "  ✓ $what"; else echo "  ✗ $what (exit $got, wanted $want)"; fail=1; fi
}
g() { git -C "$T" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false "$@"; }
git init -q -b main "$T"
g commit -q --allow-empty -m "base"
g branch base
g commit -q --allow-empty -m $'agent change\n\nCo-Authored-By: Claude Opus 5.5 <noreply@example.com>'
g commit -q --allow-empty -m $'human change\n\nHuman-Authored: yes'
(cd "$T" && expect 0 "trailered commits pass" "$CHECK" base..HEAD)
g commit -q --allow-empty -m "untrailered change"
(cd "$T" && expect 1 "an untrailered commit fails" "$CHECK" base..HEAD)
g commit -q --allow-empty -m $'mentions Co-Authored-By: Claude <x@y> in the body\n\nbut no trailer here'
(cd "$T" && expect 1 "a trailer-looking line in the body is not a trailer" "$CHECK" HEAD~1..HEAD)
g commit -q --allow-empty -m $'human co-author only\n\nCo-Authored-By: Some Person <person@example.com>'
(cd "$T" && expect 1 "a non-agent co-author is not an attribution" "$CHECK" HEAD~1..HEAD)
(cd "$T" && expect 1 "an unresolvable base fails closed" "$CHECK" no-such-ref..HEAD)
(cd "$T" && expect 1 "a malformed range fails closed" "$CHECK" "HEAD")
printf 'msg\n\nHuman-Authored: no\n' >"$T/m1"; (cd "$T" && expect 1 "Human-Authored: no fails" "$CHECK" --msg-file "$T/m1")
printf 'msg\n\nCo-Authored-By: Gemini <noreply@example.com>\n# comment line\n' >"$T/m2"; (cd "$T" && expect 0 "commit-msg mode passes an agent trailer" "$CHECK" --msg-file "$T/m2")
(cd "$T" && expect 1 "commit-msg mode fails on a missing file" "$CHECK" --msg-file "$T/nope")
(cd "$T" && expect 1 "commit-msg mode fails with no file argument" "$CHECK" --msg-file)
printf 'msg\n\nAgent: cursor\n' >"$T/m3"; (cd "$T" && expect 0 "an Agent: cursor trailer passes" "$CHECK" --msg-file "$T/m3")
printf 'msg\n\nAgent: someone\n' >"$T/m4"; (cd "$T" && expect 1 "an Agent: trailer naming no agent fails" "$CHECK" --msg-file "$T/m4")
printf 'msg\n\nCo-authored-by: Cursor <cursoragent@example.com>\n' >"$T/m5"; (cd "$T" && expect 0 "a Cursor co-author line passes" "$CHECK" --msg-file "$T/m5")
g branch -f base HEAD
(cd "$T" && expect 0 "an empty range passes (nothing to attribute)" "$CHECK" base..HEAD)
if ((fail)); then echo "❌ check-commit-trailer self-test failed"; exit 1; fi
echo "✅ check-commit-trailer self-test"
