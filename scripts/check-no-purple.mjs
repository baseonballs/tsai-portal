#!/usr/bin/env node
/**
 * Fail the build if any purple, indigo, violet, or fuchsia tokens exist in UI code.
 *
 * WHY THIS EXISTS
 *   Platform UI standards mandate a zero-purple palette.
 *   All interactive and branding elements strictly adhere to the canonical palette:
 *   cyan, sky, teal, emerald, amber, rose, blue, and orange.
 *
 * WHAT IT CHECKS
 *   1. Tailwind utility classes matching (purple|indigo|violet|fuchsia) across all prefixes:
 *      text, bg, border, from, via, to, ring, shadow, accent, outline, stroke, fill,
 *      divide, placeholder, decoration, caret.
 *   2. Named color tokens ("purple", "indigo", "violet", "fuchsia") in styles and classNames.
 *   3. Hex color literals for all Tailwind purple/indigo/violet/fuchsia shades (50 to 950).
 *   4. RGB / RGBA color literals for purple/indigo/violet/fuchsia shades.
 *   5. OKLCH color literals with purple/indigo/violet hue angles (260 to 330).
 *
 * FAIL-LOUD INTEGRITY
 *   - Derives scan roots and asserts directory existence (no silent catches).
 *   - Refuses to report success if zero files are scanned.
 *
 * Run: pnpm run check:purple
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const CORE_SCAN_DIRS = [
  "src/app",
  "src/components",
  "src/data",
  "src/lib",
  "src/utils",
];
const OPTIONAL_SCAN_DIRS = [
  "src/content",
];
const EXTS = [".tsx", ".jsx", ".ts", ".js", ".mjs", ".css", ".mdx"];
const SKIP_DIRS = new Set(["node_modules", ".next", "build", "dist", ".git", "coverage"]);

// 1. Tailwind color classes: e.g. text-indigo-400, bg-purple-500/20, border-fuchsia-400, divide-indigo-500
const TAILWIND_COLOR_REGEX = /(?:[a-z0-9:-]+)?(?:text|bg|border|from|via|to|ring|shadow|accent|outline|stroke|fill|divide|placeholder|decoration|caret)-(?:purple|indigo|violet|fuchsia)-(?:[0-9]{2,3}(?:\/[0-9]{1,3})?)/i;

// 2. Generic named color tokens: e.g. hue: "indigo", color: "purple"
const NAMED_COLOR_REGEX = /["'](?:purple|indigo|violet|fuchsia)["']/i;

// 3. Hex codes for all Tailwind purple, indigo, violet, fuchsia shades (50 to 950)
const HEX_COLOR_REGEX = /#(?:eef2ff|e0e7ff|c7d2fe|a5b4fc|818cf8|6366f1|4f46e5|4338ca|3730a3|312e81|1e1b4b|f5f3ff|ede9fe|ddd6fe|c4b5fd|a78bfa|8b5cf6|7c3aed|6d28d9|5b21b6|4c1d95|2e1065|faf5ff|f3e8ff|e9d5ff|d8b4fe|c084fc|a855f7|9333ea|7e22ce|6b21a8|581c87|3b0764|fdf4ff|fae8ff|f5d0fe|f0abfc|e879f9|d946ef|c026d3|a21caf|86198f|701a75|4a044e)\b/i;

// 4. RGB/RGBA literals matching indigo, violet, purple, fuchsia shades
const RGB_COLOR_REGEX = /(?:rgb|rgba)\(\s*(?:99\s*,\s*102\s*,\s*241|139\s*,\s*92\s*,\s*246|168\s*,\s*85\s*,\s*247|217\s*,\s*70\s*,\s*239|129\s*,\s*140\s*,\s*248|167\s*,\s*139\s*,\s*250|192\s*,\s*132\s*,\s*252|232\s*,\s*121\s*,\s*249|79\s*,\s*70\s*,\s*229|124\s*,\s*58\s*,\s*237|147\s*,\s*51\s*,\s*234|192\s*,\s*38\s*,\s*211)/i;

// 5. OKLCH color literals with purple/indigo/violet hue angles (260 to 330)
const OKLCH_COLOR_REGEX = /oklch\(\s*[0-9.]+\s+[0-9.]+\s+(?:26[0-9]|27[0-9]|28[0-9]|29[0-9]|30[0-9]|31[0-9]|32[0-9]|330)(?:\s*\/|\s*\))/i;

let filesScanned = 0;
const violations = [];

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && EXTS.some((ext) => entry.name.endsWith(ext))) {
      filesScanned++;
      const content = readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Skip comment lines
        if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
          return;
        }

        let matchType = null;
        let matchSnippet = null;

        if (TAILWIND_COLOR_REGEX.test(line)) {
          matchType = "Tailwind utility";
          matchSnippet = line.match(TAILWIND_COLOR_REGEX)?.[0];
        } else if (NAMED_COLOR_REGEX.test(line)) {
          matchType = "Named color string";
          matchSnippet = line.match(NAMED_COLOR_REGEX)?.[0];
        } else if (HEX_COLOR_REGEX.test(line)) {
          matchType = "Hex color literal";
          matchSnippet = line.match(HEX_COLOR_REGEX)?.[0];
        } else if (RGB_COLOR_REGEX.test(line)) {
          matchType = "RGB/RGBA color literal";
          matchSnippet = line.match(RGB_COLOR_REGEX)?.[0];
        } else if (OKLCH_COLOR_REGEX.test(line)) {
          matchType = "OKLCH color literal";
          matchSnippet = line.match(OKLCH_COLOR_REGEX)?.[0];
        }

        if (matchType) {
          violations.push({
            file: relative(ROOT, fullPath),
            line: index + 1,
            matchType,
            matchSnippet,
            snippet: trimmed,
          });
        }
      });
    }
  }
}

// Fail loud if any required core directory does not exist or is not a directory
for (const dir of CORE_SCAN_DIRS) {
  const fullPath = join(ROOT, dir);
  if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
    console.error(`❌ Required scan directory does not exist or is not a directory: ${dir}`);
    process.exit(1);
  }
  walkDir(fullPath);
}

// Optionally scan ephemeral / copied content directory if present
for (const dir of OPTIONAL_SCAN_DIRS) {
  const fullPath = join(ROOT, dir);
  if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    walkDir(fullPath);
  }
}

// Fail loud if zero files were scanned (prevent silent passes)
if (filesScanned === 0) {
  console.error("❌ Purple gate scanned 0 files — refusing to report success.");
  process.exit(1);
}

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} forbidden purple/indigo/violet/fuchsia violation(s) across ${filesScanned} files scanned:`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.matchType}: ${v.matchSnippet}]`);
    console.error(`    ${v.snippet}\n`);
  }
  process.exit(1);
}

console.log(`✅ Zero purple/indigo/violet/fuchsia tokens found (Tailwind, named strings, hex, RGB/RGBA, and OKLCH) across ${filesScanned} UI source files.`);
process.exit(0);
