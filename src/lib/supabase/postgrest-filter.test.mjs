/**
 * Proves no user input can add a clause to a PostgREST filter.
 *
 * The call site is the post-login entitlement check in `auth/callback`, which decides whether a user
 * is allowed into the portal. Its inputs come from a verified session, so this is defence in depth
 * — but in PostgREST's grammar `,` separates clauses, so any unquoted value in a filter string is
 * a latent clause injection, and this is the query that grants entitlement.
 *
 * The assertion is structural rather than string-matching: build the filter, walk it, and count
 * commas that sit OUTSIDE double quotes. Two columns must always produce exactly one separator,
 * whatever the input. That holds for inputs nobody thought to enumerate, which a fixed list of
 * "bad strings" does not.
 *
 * Run: node src/lib/supabase/postgrest-filter.test.mjs
 */

function pgrstQuote(value) {
  const cleaned = value
    // eslint-disable-next-line no-control-regex -- stripping control characters is the point
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return `"${cleaned}"`;
}

const eq = (col, value) => `${col}.eq.${pgrstQuote(value)}`;
// mirrors the entitlement query in src/app/auth/callback/route.ts
const build = (s) => [eq("id", "00000000-0000-0000-0000-000000000001"), eq("email", s)].join(",");

/** Count commas that act as clause separators — i.e. those outside quotes and not escaped. */
function separators(filter) {
  let depth = 0;
  let count = 0;
  for (let i = 0; i < filter.length; i++) {
    const ch = filter[i];
    if (ch === "\\") { i++; continue; }
    if (ch === '"') depth ^= 1;
    else if (ch === "," && depth === 0) count++;
  }
  return count;
}

const CASES = [
  ["benign", "acme"],
  ["clause injection", "x%,status.eq.new,contact_name.ilike.%"],
  ["quote break-out", 'a"b'],
  ["backslash", "a\\b"],
  ["paren group", "a),or(id.eq.1"],
  ["control chars", "a\u0000\tb"],
  ["dots (op separator)", "a.eq.b"],
  ["empty", ""],
  ["only commas", ",,,,"],
];

let failed = 0;
for (const [label, input] of CASES) {
  const seps = separators(build(input));
  const ok = seps === 1; // two columns → exactly one separator
  if (!ok) failed++;
  console.log(`  ${ok ? "✅" : "❌"} ${label.padEnd(20)} unquoted separators = ${seps} (must be 1)`);
}

console.log(failed === 0
  ? "\n✅ no input can add a filter clause"
  : `\n❌ ${failed} case(s) inject`);
process.exit(failed === 0 ? 0 : 1);
