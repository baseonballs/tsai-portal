import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import React from "react";

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

const components: any = {
  AppCard: ({ children }: any) => (
    <div className="border border-white/10 rounded-lg p-5 my-5 bg-zinc-900/30 backdrop-blur-sm">
      {children}
    </div>
  ),
  DocCtaLink: ({ href, children }: any) => (
    <Link href={href} className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors">
      {children}
    </Link>
  ),
  DocCtaRow: ({ children }: any) => (
    <div className="flex flex-wrap gap-4 my-5 items-center">
      {children}
    </div>
  ),
  DocHero: ({ title, description }: any) => (
    <div className="py-6 border-b border-white/5 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
      {description && <p className="text-zinc-400 text-lg leading-relaxed">{description}</p>}
    </div>
  ),
  DocHubScreenshot: ({ src, alt }: any) => (
    <div className="my-6 overflow-hidden rounded-lg border border-white/10 shadow-lg shadow-cyan-950/10">
      <img src={src} alt={alt} className="w-full object-cover" />
    </div>
  ),
  DocParagraph: ({ children }: any) => (
    <p className="text-zinc-300 leading-7 my-4">{children}</p>
  ),
  DocPhaseCard: ({ title, children }: any) => (
    <div className="border border-white/10 rounded-lg p-5 bg-zinc-900/30 backdrop-blur-sm my-5">
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  ),
  DocPlaneGrid: ({ children }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {children}
    </div>
  ),
  DocPlaneItem: ({ title, children }: any) => (
    <div className="border border-white/5 rounded-lg p-4 bg-zinc-950/50 backdrop-blur-sm flex flex-col gap-1.5">
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <div className="text-zinc-400 text-xs leading-relaxed">{children}</div>
    </div>
  ),
  DocPullQuote: ({ children }: any) => (
    <blockquote className="border-l-4 border-cyan-500 pl-4 my-6 italic text-zinc-300 leading-relaxed">
      {children}
    </blockquote>
  ),
  EncoreLegacyFeatureHelpTable: () => (
    <div className="text-xs text-zinc-500 italic p-3 border border-white/5 bg-zinc-900/10 rounded-md my-4">
      Encore Legacy Feature Help Table
    </div>
  ),
  Prose: ({ children }: any) => (
    <div className="prose prose-invert max-w-none">
      {children}
    </div>
  ),
  Link: ({ href, children, ...props }: any) => (
    <Link href={href} className="text-cyan-400 hover:text-cyan-300 transition-colors" {...props}>
      {children}
    </Link>
  ),
  DocShortcut: ({ keys }: any) => (
    <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300 shadow-sm">
      {keys}
    </kbd>
  ),
};

export async function loadDoc(app: "spotlight" | "periodical" | "watson", slug: string): Promise<DocBundle | null> {
  let relativePath = slug;

  // Defaults for empty slug
  if (!relativePath) {
    if (app === "spotlight") relativePath = "welcome";
    else relativePath = "README";
  }

  // Format file extensions
  let extension = ".mdx";
  if (app === "periodical" || app === "watson") {
    extension = ".md";
  }

  // Handle welcome edge case for Spotlight
  if (app === "spotlight" && relativePath === "") {
    relativePath = "welcome";
  }

  const baseDir = path.join(CONTENT_ROOT, app);
  const targetFile = path.resolve(baseDir, relativePath.endsWith(extension) ? relativePath : `${relativePath}${extension}`);

  // Security bounds check
  if (!targetFile.startsWith(path.resolve(baseDir) + path.sep) && targetFile !== path.resolve(baseDir)) {
    return null;
  }

  try {
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

    return {
      content,
      frontmatter: {
        title: frontmatter.title || path.basename(relativePath, extension),
        description: frontmatter.description,
        lastUpdated: frontmatter.lastUpdated,
      },
    };
  } catch (e) {
    console.error(`Failed to load doc at ${targetFile}:`, e);
    return null;
  }
}
