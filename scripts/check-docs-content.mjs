#!/usr/bin/env node
/**
 * Refuse to package docs that carry contact details or internal identifiers.
 *
 * Phase 156. The Portal's /docs route once shipped Periodical's and Watson's internal docs, which
 * held operator identities, internal hostnames and real users' names. Only Spotlight's customer
 * manual is copied now (scripts/copy-docs.sh), and this check runs on the copy before the build
 * can package it. It exits non-zero on any finding, so a deploy stops instead of publishing.
 *
 * What it refuses, in every text file under the directory it is given:
 *   - an email address, unless it is at a reserved example domain (example.com/.org/.net);
 *   - a phone number;
 *   - a tailnet host (*.ts.net), the DGX host name, or a private / tailnet IP address;
 *   - a JWT, or the words "service_role".
 *
 * Real names cannot be detected by pattern; the Spotlight repository's own real-names check
 * covers its manual at the source.
 *
 * Usage: node scripts/check-docs-content.mjs <dir>
 */
import fs from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([".md", ".mdx", ".txt", ".json", ".yaml", ".yml", ".html", ".csv"]);

const RULES = [
  {
    name: "email address",
    pattern: /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g,
    allow: (match) => /^(?:[a-z0-9-]+\.)*example\.(?:com|org|net)$/i.test(match[1]),
  },
  { name: "phone number", pattern: /(?:\+?1[-.\s]?)?\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  { name: "tailnet host", pattern: /\b[\w-]+(?:\.[\w-]+)*\.ts\.net\b/gi },
  { name: "DGX host name", pattern: /spark-62db/gi },
  {
    name: "private or tailnet IP address",
    pattern: /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01])|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\.\d{1,3}\.\d{1,3}\b/g,
  },
  { name: "JWT", pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { name: "service-role reference", pattern: /service[_-]role/gi },
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

export function findDocsContentViolations(dir) {
  const findings = [];
  for (const file of walk(dir)) {
    if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        for (const match of line.matchAll(rule.pattern)) {
          if (rule.allow?.(match)) continue;
          // Report the location and the rule, never the matched text: the point is to keep
          // contact details out of output as well as out of the build.
          findings.push({ file: path.relative(dir, file), line: i + 1, rule: rule.name });
        }
      }
    });
  }
  return findings;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error("✖ check-docs-content: pass the docs directory to check.");
    process.exit(2);
  }
  const findings = findDocsContentViolations(dir);
  if (findings.length > 0) {
    console.error(`✖ check-docs-content: ${findings.length} finding(s) — refusing to package these docs:`);
    for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.rule}`);
    process.exit(1);
  }
  console.log("✔ check-docs-content: no contact details or internal identifiers found");
}
