import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import React from "react";
import { resolvePublishedSpotlightSlug } from "@/lib/docs/manifest";

export type DocMeta = {
  title: string;
  description?: string;
  lastUpdated?: string;
};

export type DocBundle = {
  content: React.ReactElement;
  frontmatter: DocMeta;
};

const CONTENT_ROOT = path.join(process.cwd(), "src/content/docs");

const components = {
  AppCard: ({ children }: { children?: React.ReactNode }) => (
    <div className="border border-white/10 rounded-lg p-5 my-5 bg-zinc-900/30 backdrop-blur-sm">
      {children}
    </div>
  ),
  DocCtaLink: ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <Link href={href} className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors">
      {children}
    </Link>
  ),
  DocCtaRow: ({ children }: { children?: React.ReactNode }) => (
    <div className="flex flex-wrap gap-4 my-5 items-center">
      {children}
    </div>
  ),
  DocHero: ({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) => (
    <div className="py-6 border-b border-white/5 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
      {description && <p className="text-zinc-400 text-lg leading-relaxed">{description}</p>}
    </div>
  ),
  DocHubScreenshot: ({ src, alt }: { src: string; alt?: string }) => (
    <div className="my-6 overflow-hidden rounded-lg border border-white/10 shadow-lg shadow-cyan-950/10">
      <img src={src} alt={alt || ""} className="w-full object-cover" />
    </div>
  ),
  DocParagraph: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-zinc-300 leading-7 my-4">{children}</p>
  ),
  DocPhaseCard: ({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) => (
    <div className="border border-white/10 rounded-lg p-5 bg-zinc-900/30 backdrop-blur-sm my-5">
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  ),
  DocPlaneGrid: ({ children }: { children?: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {children}
    </div>
  ),
  DocPlaneItem: ({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) => (
    <div className="border border-white/5 rounded-lg p-4 bg-zinc-950/50 backdrop-blur-sm flex flex-col gap-1.5">
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <div className="text-zinc-400 text-xs leading-relaxed">{children}</div>
    </div>
  ),
  DocPullQuote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-cyan-500 pl-4 my-6 italic text-zinc-300 leading-relaxed">
      {children}
    </blockquote>
  ),
  EncoreLegacyFeatureHelpTable: () => (
    <div className="text-xs text-zinc-500 italic p-3 border border-white/5 bg-zinc-900/10 rounded-md my-4">
      Encore Legacy Feature Help Table
    </div>
  ),
  Prose: ({ children }: { children?: React.ReactNode }) => (
    <div className="prose prose-invert max-w-none">
      {children}
    </div>
  ),
  Link: ({ href, children, ...props }: React.ComponentProps<typeof Link>) => (
    <Link href={href} className="text-cyan-400 hover:text-cyan-300 transition-colors" {...props}>
      {children}
    </Link>
  ),
  DocShortcut: ({ keys }: { keys: React.ReactNode }) => (
    <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300 shadow-sm">
      {keys}
    </kbd>
  ),
};

const DOC_BUNDLE_CACHE_TTL_MS = 30_000;
const DOC_BUNDLE_CACHE_MAX_ENTRIES = 128;
const DOC_BUNDLE_CACHE = new Map<
  string,
  { bundle: DocBundle; mtimeMs: number; expiresAt: number }
>();

export function invalidateDocBundleCache(cacheKey?: string): void {
  if (cacheKey) {
    DOC_BUNDLE_CACHE.delete(cacheKey);
    return;
  }
  DOC_BUNDLE_CACHE.clear();
}

/**
 * Load one published Spotlight manual page. Phase 156: the Portal serves Spotlight's customer
 * manual ONLY, and only the slugs in src/lib/docs/manifest.ts — a file on disk that is not in the
 * manifest is "not found". The Periodical and Watson trees (internal engineering docs) are no
 * longer copied into the image or readable through this loader.
 */
export async function loadDoc(slug: string): Promise<DocBundle | null> {
  const relativePath = resolvePublishedSpotlightSlug(slug);
  if (!relativePath) {
    return null;
  }

  const extension = ".mdx";
  const baseDir = path.join(CONTENT_ROOT, "spotlight");
  const targetFile = path.resolve(baseDir, `${relativePath}${extension}`);

  // Defence in depth: the manifest already rules out traversal, but never read outside the tree.
  if (!targetFile.startsWith(path.resolve(baseDir) + path.sep)) {
    return null;
  }

  const cacheKey = targetFile;

  try {
    const stat = await fs.stat(targetFile);
    const now = Date.now();
    const cached = DOC_BUNDLE_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > now && cached.mtimeMs === stat.mtimeMs) {
      return cached.bundle;
    }

    const source = await fs.readFile(targetFile, "utf8");
    const { content, frontmatter } = await compileMDX<DocMeta>({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
      components,
    });

    const bundle: DocBundle = {
      content,
      frontmatter: {
        title: frontmatter.title || path.basename(relativePath, extension),
        description: frontmatter.description,
        lastUpdated: frontmatter.lastUpdated,
      },
    };

    if (DOC_BUNDLE_CACHE.size >= DOC_BUNDLE_CACHE_MAX_ENTRIES) {
      const oldestKey = DOC_BUNDLE_CACHE.keys().next().value;
      if (oldestKey) DOC_BUNDLE_CACHE.delete(oldestKey);
    }
    DOC_BUNDLE_CACHE.set(cacheKey, {
      bundle,
      mtimeMs: stat.mtimeMs,
      expiresAt: now + DOC_BUNDLE_CACHE_TTL_MS,
    });

    return bundle;
  } catch (e) {
    console.error(`Failed to load doc at ${targetFile}:`, e);
    return null;
  }
}
