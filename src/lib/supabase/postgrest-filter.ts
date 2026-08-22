/**
 * Safely embed a user-supplied value inside a PostgREST filter string.
 *
 * WHY
 *   `query.or(`contact_name.ilike.%${search}%,email.ilike.%${search}%`)` interpolates a raw request
 *   parameter into PostgREST's filter grammar. In that grammar `,` separates clauses, `.` separates
 *   column.operator.value, and `()` groups — so a search term containing a comma does not search for
 *   a comma, it adds filter clauses:
 *
 *     search = 'x%,status.eq.new,contact_name.ilike.%'
 *     →  contact_name.ilike.%x%,status.eq.new,contact_name.ilike.%%,email.ilike.…
 *
 *   In this repo the call site is the post-login entitlement check in `auth/callback`, which runs
 *   on the admin client. Its inputs (`userId`, `userEmail`) come from an already-verified session,
 *   so this is defence in depth rather than a live hole — but it is the query that decides whether
 *   a user is entitled to the portal, and it is the last place worth leaving an unquoted value.
 *
 * HOW
 *   PostgREST allows a value to be double-quoted, and treats everything inside the quotes as
 *   literal. So the fix is to quote the value and escape any `"` or `\` within it, rather than to
 *   blacklist characters — a blacklist has to enumerate the grammar correctly and stays correct only
 *   until the grammar changes.
 *
 *   Control characters are stripped rather than escaped: they have no business in a search term and
 *   quoting them merely preserves them.
 */

/** Quote a value for use as the `value` part of a PostgREST `column.op.value` clause. */
export function pgrstQuote(value: string): string {
  const cleaned = value
    // eslint-disable-next-line no-control-regex -- stripping control characters is the point
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return `"${cleaned}"`;
}

/**
 * Build an `ilike` contains-match clause for one column, with the term safely quoted.
 * `pgrstIlikeContains("email", 'a,b')` → `email.ilike."%a,b%"`
 */
export function pgrstIlikeContains(column: string, term: string): string {
  return `${column}.ilike.${pgrstQuote(`%${term}%`)}`;
}

/** Build an `eq` clause with the value safely quoted. */
export function pgrstEq(column: string, value: string): string {
  return `${column}.eq.${pgrstQuote(value)}`;
}
