import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { loadDoc } from "@/utils/docs";
import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import { SPOTLIGHT_DOCS, type DocItem } from "@/lib/docs/manifest";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { 
  Lock, 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  Layers,
} from "lucide-react";

type Props = { params: Promise<{ slug?: string[] }> };

/**
 * /docs — the Spotlight customer manual, for entitled Portal accounts.
 *
 * Phase 156: this page used to serve Spotlight, Periodical and Watson docs to ANY signed-in
 * account (the password sign-in never checked a licence), and the Periodical/Watson trees were
 * internal engineering material carrying real identities. It now serves only the pages in
 * src/lib/docs/manifest.ts, and only to a caller the server has verified and found entitled.
 * Old /docs/periodical/* and /docs/watson/* links resolve to "not found".
 */
export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  const segments = slug ?? [];
  const currentPath = segments.join("/");

  const access = await getEntitledPortalUser();
  if (access.status === "signed-out") {
    redirect(`/login?next=${encodeURIComponent("/docs" + (currentPath ? "/" + currentPath : ""))}`);
  }
  const isEntitled = access.status === "entitled";

  // /docs and /docs/spotlight/<page> are the manual; any other first segment is not published.
  const isSpotlightPath = segments.length === 0 || segments[0] === "spotlight";
  const docPath = isSpotlightPath ? segments.slice(1).join("/") : "";
  const app = "spotlight";
  const appName = "Spotlight";
  // An account without a licence sees no index of the manual either.
  const docItems: readonly DocItem[] = isEntitled ? SPOTLIGHT_DOCS : [];

  const docBundle = isEntitled && isSpotlightPath ? await loadDoc(docPath) : null;
  const errorMsg = !isEntitled
    ? "An active Transcend licence is required to read the documentation."
    : docBundle
      ? null
      : "Documentation page not found.";

  // Group by category
  const categories = docItems.reduce((acc: Record<string, DocItem[]>, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <LandingHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 md:px-8 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-6 border-r border-white/5 pr-8">
          {/* App Switcher Tabs */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-500" />
              Applications Documentation
            </h2>
            <div className="grid grid-cols-1 gap-1">
              <Link
                href="/docs/spotlight"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  app === "spotlight"
                    ? "bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-semibold"
                    : "hover:bg-white/5 text-zinc-400"
                }`}
              >
                <span>Spotlight</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Manual</span>
              </Link>
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-280px)] flex flex-col gap-6">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-1.5">
                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3">
                  {category}
                </h3>
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const itemUrl = `/docs/${app}${item.slug ? "/" + item.slug : ""}`;
                    const isActive = docPath === item.slug || (item.slug === "" && docPath === "welcome" && app === "spotlight");
                    return (
                      <li key={item.slug}>
                        <Link
                          href={itemUrl}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                            isActive
                              ? "bg-white/5 border-l-2 border-cyan-500 text-white font-medium pl-2.5"
                              : "text-zinc-400 hover:text-white hover:bg-white/2"
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile App Selector Header */}
        <div className="lg:hidden w-full flex flex-col gap-4 mb-4">
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
            <Link
              href="/docs/spotlight"
              className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                app === "spotlight" ? "bg-cyan-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Spotlight
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl min-w-0">
          {errorMsg ? (
            !isEntitled ? (
              <div className="border border-red-500/20 bg-red-950/10 rounded-xl p-8 text-center flex flex-col items-center max-w-xl mx-auto my-12">
                <Lock className="h-12 w-12 text-red-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold text-white mb-2">Licence Required</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {errorMsg}
                </p>
                <Link
                  href="/"
                  className="rounded-lg bg-zinc-900 border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-all hover:bg-zinc-800"
                >
                  Return Home
                </Link>
              </div>
            ) : (
              <div className="border border-white/10 bg-zinc-900/10 rounded-xl p-8 text-center flex flex-col items-center max-w-xl mx-auto my-12">
                <AlertTriangle className="h-12 w-12 text-zinc-500 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Document Not Found</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  The requested document path could not be resolved. It may have been moved or is currently not federated.
                </p>
                <Link
                  href="/docs"
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-all"
                >
                  Back to {appName} Overview
                </Link>
              </div>
            )
          ) : (
            <article className="prose prose-invert prose-cyan max-w-none">
              {/* Doc Header */}
              <div className="border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium uppercase tracking-wider mb-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{appName} Documentation</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                  {docBundle?.frontmatter.title}
                </h1>
                {docBundle?.frontmatter.description && (
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">
                    {docBundle.frontmatter.description}
                  </p>
                )}
                {docBundle?.frontmatter.lastUpdated && (
                  <div className="text-[10px] text-zinc-500 font-mono mt-4">
                    Last updated: {docBundle.frontmatter.lastUpdated}
                  </div>
                )}
              </div>

              {/* Doc Body */}
              <div className="markdown-body">
                {docBundle?.content}
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
