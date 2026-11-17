/**
 * tsai-portal (Phase 156): copied unchanged from tsai-spotlight src/scripts/lib/real-names.ts, which is itself
 * copied from tsai-periodical — keep all three in sync.
 *
 * Copied from tsai-periodical (4ad373b, src/scripts/lib/real-names.ts) — keep the two in sync. Only deviation:
 * two `m.index!` non-null assertions dropped (this repo's lint rejects them as unnecessary) and prettier formatting.
 * Real-name matching against the OWNER-ONLY name list (never in the repo).
 *
 * A TypeScript port of the toolchain guard
 *   tier-2.3-services-ai-pipelines/hockey-intelligence/tests/test_no_real_names_in_worker_images.py
 * (tsai-toolchain c77ef64a9): same list format, same loader semantics, same matching rules.
 *
 *     TSAI_REAL_NAME_LIST=/path/to/real-names.json   (default: ~/tools/secure/name-scrub/real-names.json)
 *
 *  * variable SET: the file must exist, be readable and hold a non-empty list of the expected shape,
 *    or the check FAILS (a typo'd or empty list must never turn into a vacuous pass);
 *  * variable unset and the default file absent: SKIPPED, unless HOCKEY_TESTS_STRICT=1 (or
 *    TSAI_TESTS_STRICT=1), which makes the missing list a FAILURE.
 *
 * A hit is a full name (first and last adjacent, any case, separated by space/_/./- or nothing,
 * optional middle initial), a distinctive single name token (not a dictionary word, not owner-only,
 * not a short hex-only token, not in `guard_exclude_tokens`; text files only), or a listed email
 * or phone number. The owner's identity (persons flagged `owner`, and `owner_email`) may appear.
 * Periodical addition (kept in Spotlight): the product's own role mailboxes (@tsai-spotlight.com support/no-reply/…)
 * are not people and are not reported.
 *
 * This module never contains a real name. Results carry kinds and list indices, never text.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";

export const LIST_ENV = "TSAI_REAL_NAME_LIST";
export const LIST_DEFAULT = "~/tools/secure/name-scrub/real-names.json";

export type NameList = {
  owner_email?: string;
  persons: Array<{ full: string; owner?: boolean }>;
  tokens: Array<{ token: string; dictionary_word?: boolean; owner_only?: boolean }>;
  emails: string[];
  phones: string[];
  guard_exclude_tokens?: Record<string, string>;
};
export type Hit = { kind: "full_name" | "name" | "email" | "phone"; ref: number };
export type ListVerdict = { verdict: "ok"; data: NameList } | { verdict: "fail" | "skip"; reason: string };

const RUN = /[A-Za-z]+/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const PHONE = /(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g;
const SEP = /^[\s_.-]{0,3}$/;
const PRODUCT_ROLE_MAILBOX =
  /^(support|no-?reply|notifications?|invites?|beta|hello|privacy|legal|security|admin|apple-admin|ops|platform|periodical|spotlight|watson)@(tsai-spotlight\.com|transcendental-sports\.ai)$/;

function stripEdges(s: string): string {
  return s.replace(/^[.'’]+|[.'’]+$/g, "");
}

export class NameMatcher {
  private emails: Set<string>;
  private phones: Set<string>;
  readonly index: Map<string, number>;
  private single: Set<string>;
  private full = new Map<string, string[][]>();
  private ownerFull = new Map<string, string[][]>();
  private concat = new Map<string, string>();

  constructor(data: NameList) {
    const ownerEmail = (data.owner_email ?? "").toLowerCase();
    this.emails = new Set((data.emails ?? []).map((e) => e.toLowerCase()));
    this.emails.delete(ownerEmail);
    this.phones = new Set(data.phones ?? []);
    this.index = new Map((data.tokens ?? []).map((t, i) => [t.token, i] as [string, number]));
    const exclude = new Set(Object.keys(data.guard_exclude_tokens ?? {}));
    this.single = new Set(
      (data.tokens ?? [])
        .filter((t) => !t.dictionary_word && !t.owner_only && !exclude.has(t.token) && !/^[a-f]{1,4}$/.test(t.token))
        .map((t) => t.token),
    );
    for (const p of data.persons ?? []) {
      const parts = p.full
        .split(/\s+/)
        .map((x) => stripEdges(x).toLowerCase())
        .filter((x) => x.length > 1);
      if (parts.length < 2) continue;
      const target = p.owner ? this.ownerFull : this.full;
      const seqs = new Map<string, string[]>();
      for (const seq of [parts, [parts[0], parts[parts.length - 1]]]) seqs.set(seq.join("\u0000"), seq);
      for (const seq of seqs.values()) {
        const rests = target.get(seq[0]) ?? [];
        const rest = seq.slice(1);
        if (!rests.some((r) => r.join("\u0000") === rest.join("\u0000"))) rests.push(rest);
        target.set(seq[0], rests);
        if (!p.owner) this.concat.set(seq.join(""), seq[0]);
      }
    }
  }

  private seqEnd(runs: Array<[number, number, string]>, i: number, rest: string[], text: string): number | null {
    let j = i;
    for (const want of rest) {
      let k = j + 1;
      if (
        k < runs.length &&
        runs[k][2].length === 1 &&
        want !== runs[k][2] &&
        SEP.test(text.slice(runs[j][1], runs[k][0]))
      ) {
        k += 1; // skip a middle initial
      }
      if (k >= runs.length || runs[k][2] !== want || !SEP.test(text.slice(runs[k - 1][1], runs[k][0]))) return null;
      j = k;
    }
    return j;
  }

  hits(text: string, binary = false): Hit[] {
    const runs: Array<[number, number, string]> = [];
    for (const m of text.matchAll(RUN)) runs.push([m.index, m.index + m[0].length, m[0].toLowerCase()]);
    const out: Hit[] = [];
    const owned = new Set<number>();
    runs.forEach((r, i) => {
      for (const rest of this.ownerFull.get(r[2]) ?? []) {
        const j = this.seqEnd(runs, i, rest, text);
        if (j !== null) for (let n = i; n <= j; n++) owned.add(n);
      }
    });
    runs.forEach((r, i) => {
      if (owned.has(i)) return;
      for (const rest of this.full.get(r[2]) ?? []) {
        const j = this.seqEnd(runs, i, rest, text);
        if (j !== null) {
          out.push({ kind: "full_name", ref: this.index.get(r[2]) ?? -1 });
          for (let n = i; n <= j; n++) owned.add(n);
          break;
        }
      }
      if (this.concat.has(r[2]) && !owned.has(i)) {
        out.push({ kind: "full_name", ref: this.index.get(this.concat.get(r[2])!) ?? -1 });
        owned.add(i);
      }
      if (!binary && !owned.has(i) && this.single.has(r[2])) out.push({ kind: "name", ref: this.index.get(r[2])! });
    });
    if (text.includes("@")) {
      for (const m of text.matchAll(EMAIL)) {
        const e = m[0].toLowerCase();
        if (this.emails.has(e) && !PRODUCT_ROLE_MAILBOX.test(e)) out.push({ kind: "email", ref: -1 });
      }
    }
    for (const m of text.matchAll(PHONE)) {
      if (this.phones.has(m[0].replace(/\D/g, "").slice(-10))) out.push({ kind: "phone", ref: -1 });
    }
    return out;
  }

  /** Every listed token, for behavioural tests that must not spell a name out. */
  tokens(): string[] {
    return [...this.index.keys()];
  }
}

export function shapeProblem(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "top level is not an object";
  const d = data as Record<string, unknown>;
  const persons = d.persons as unknown[];
  const tokens = d.tokens as unknown[];
  if (!Array.isArray(persons) || persons.length === 0) return "'persons' is missing or empty";
  if (
    !persons.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof (p as { full?: unknown }).full === "string" &&
        (p as { full: string }).full.trim(),
    )
  )
    return "a 'persons' entry has no 'full' name string";
  if (!Array.isArray(tokens) || tokens.length === 0) return "'tokens' is missing or empty";
  if (
    !tokens.every(
      (t) =>
        t &&
        typeof t === "object" &&
        typeof (t as { token?: unknown }).token === "string" &&
        (t as { token: string }).token,
    )
  )
    return "a 'tokens' entry has no 'token' string";
  for (const key of ["emails", "phones"]) {
    const v = d[key];
    if (!Array.isArray(v) || !v.every((x) => typeof x === "string"))
      return `'${key}' is missing or not a list of strings`;
  }
  const ex = d.guard_exclude_tokens;
  if (ex !== undefined && (typeof ex !== "object" || ex === null || Array.isArray(ex)))
    return "'guard_exclude_tokens' is not an object";
  return null;
}

/** ok | fail | skip. Reasons name the variable/path, never the data. */
export function loadRealNameList(env: Record<string, string | undefined> = process.env): ListVerdict {
  const explicit = env[LIST_ENV];
  if (explicit !== undefined && !explicit.trim()) {
    return { verdict: "fail", reason: `${LIST_ENV} is set but empty: point it at the owner-only list, or unset it` };
  }
  const raw = explicit || LIST_DEFAULT;
  const home = env.HOME || homedir();
  const path = raw.startsWith("~/") ? home + raw.slice(1) : raw;
  if (!explicit && !existsSync(path)) {
    if (env.HOCKEY_TESTS_STRICT === "1" || env.TSAI_TESTS_STRICT === "1") {
      return {
        verdict: "fail",
        reason: `strict mode but the owner-only name list is unavailable (${LIST_ENV} unset, ${LIST_DEFAULT} absent): the real check cannot run`,
      };
    }
    return {
      verdict: "skip",
      reason: `owner-only name list unavailable (set ${LIST_ENV}); nothing real to check against`,
    };
  }
  const where = explicit ? `${LIST_ENV}=${explicit}` : path;
  let text: string;
  try {
    text = readFileSync(path, "utf-8");
  } catch (e) {
    return { verdict: "fail", reason: `owner-only name list at ${where} cannot be read (${(e as Error).name})` };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { verdict: "fail", reason: `owner-only name list at ${where} is not valid JSON` };
  }
  const problem = shapeProblem(data);
  if (problem) return { verdict: "fail", reason: `owner-only name list at ${where} is unusable: ${problem}` };
  return { verdict: "ok", data: data as NameList };
}
