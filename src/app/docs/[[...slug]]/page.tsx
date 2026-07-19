import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { loadDoc } from "@/utils/docs";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { 
  Lock, 
  FileText, 
  ChevronRight, 
  AlertTriangle, 
  BookOpen, 
  ArrowLeft,
  Search,
  Activity,
  Layers,
  Cpu,
  Bookmark
} from "lucide-react";

type Props = { params: Promise<{ slug?: string[] }> };

interface DocItem {
  title: string;
  slug: string;
  category?: string;
}

const SPOTLIGHT_DOCS: DocItem[] = [
  { title: "Orientation & Chrome", slug: "user-guide/orientation", category: "User Guide" },
  { title: "Workspace & Media", slug: "user-guide/workspace", category: "User Guide" },
  { title: "Players, Teams & Seasons", slug: "user-guide/players-seasons", category: "User Guide" },
  { title: "Jobs, Tasks & Workflows", slug: "user-guide/jobs-workflows", category: "User Guide" },
  { title: "Video Review — Intro", slug: "user-guide/video-review-intro", category: "User Guide" },
  { title: "Video Review — Workflows", slug: "user-guide/video-review-workflows", category: "User Guide" },
  { title: "Encore Legacy Bridge", slug: "user-guide/encore-legacy-bridge", category: "User Guide" },
  { title: "Settings & Support", slug: "user-guide/settings-support", category: "User Guide" },
  { title: "How-Tos", slug: "knowledge-base/how-tos", category: "Knowledge Base" },
  { title: "FAQ", slug: "knowledge-base/faq", category: "Knowledge Base" },
  { title: "Delivery Roadmap", slug: "roadmap", category: "Roadmap" },
  { title: "EdgeIQ Application", slug: "applications/edgeiq", category: "Core Apps" },
  { title: "Encore Application", slug: "applications/encore", category: "Core Apps" },
  { title: "Stratus Application", slug: "applications/stratus", category: "Core Apps" },
  { title: "Tempest Application", slug: "applications/tempest", category: "Core Apps" },
];

const PERIODICAL_DOCS: DocItem[] = [
  { title: "Introduction", slug: "", category: "Getting Started" },
  { title: "Integration & Architecture", slug: "1-architecture/TSAI-INTEGRATION-GAP-ANALYSIS", category: "Architecture" },
  { title: "Verification Runbook", slug: "2-operations/VERIFICATION-RUNBOOK", category: "Operations" },
  { title: "Releases Overview", slug: "6-releases/README", category: "Releases" },
  { title: "Release v0.2.0 (Onboarding)", slug: "6-releases/RELEASE-v0.2.0.onboarding", category: "Releases" },
  { title: "Release v0.2.1 (Internet Beta)", slug: "6-releases/RELEASE-v0.2.1.internet-beta", category: "Releases" },
  { title: "Release v0.2.12 (Cloud Run)", slug: "6-releases/RELEASE-v0.2.12.cloudrun-onboarding", category: "Releases" },
  { title: "Release v0.2.13 (Cross-Origin)", slug: "6-releases/RELEASE-v0.2.13.cross-origin-onboarding", category: "Releases" },
  { title: "Release v0.2.14 (Hockey API)", slug: "6-releases/RELEASE-v0.2.14.cloudrun-hockey-api-path", category: "Releases" },
  { title: "Release v0.2.3 (Provisioning)", slug: "6-releases/RELEASE-v0.2.3.provisioning-reconcile", category: "Releases" },
  { title: "Release v0.2.4 (Navigation)", slug: "6-releases/RELEASE-v0.2.4.navigation-performance", category: "Releases" },
];

const WATSON_DOCS: DocItem[] = [
  { title: "Developer Orientation", slug: "LOCAL-DEV", category: "Orientation" },
  { title: "System Design Spec", slug: "design/prd-ux-system-design", category: "Design" },
  { title: "Technology Stacks", slug: "devops/tech-stacks", category: "DevOps" },
  { title: "Release v0.1.15", slug: "6-releases/RELEASE-WATSON-v0.1.15.alpha", category: "Releases" },
  { title: "Release v0.1.16", slug: "6-releases/RELEASE-WATSON-v0.1.16.alpha", category: "Releases" },
  { title: "Release v0.1.17", slug: "6-releases/RELEASE-WATSON-v0.1.17.alpha", category: "Releases" },
  { title: "Release v0.1.18", slug: "6-releases/RELEASE-WATSON-v0.1.18.alpha", category: "Releases" },
  { title: "Release v0.1.19", slug: "6-releases/RELEASE-WATSON-v0.1.19.alpha", category: "Releases" },
  { title: "Release v0.1.20", slug: "6-releases/RELEASE-WATSON-v0.1.20.alpha", category: "Releases" },
  { title: "Release v0.1.21", slug: "6-releases/RELEASE-WATSON-v0.1.21.alpha", category: "Releases" },
  { title: "Release v0.1.22", slug: "6-releases/RELEASE-WATSON-v0.1.22.alpha", category: "Releases" },
];

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentPath = slug?.join("/") || "";

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/docs/" + currentPath)}`);
  }

  // Get user type from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  const role = profile?.user_type?.toLowerCase() || "";
  const isSuperadmin = role === "superadmin" || role === "superuser" || role === "devops";

  // Parse active app and doc from slug
  const app = (slug?.[0] as "spotlight" | "periodical" | "watson") || "spotlight";
  const docPath = slug?.slice(1).join("/") || "";

  // Get documents for active app
  let docItems: DocItem[] = SPOTLIGHT_DOCS;
  let appName = "Spotlight";
  if (app === "periodical") {
    docItems = PERIODICAL_DOCS;
    appName = "Periodical";
  } else if (app === "watson") {
    docItems = WATSON_DOCS;
    appName = "Watson Control Plane";
  }

  const isWatsonGated = app === "watson" && !isSuperadmin;
  let docBundle = null;
  let errorMsg = null;

  if (isWatsonGated) {
    errorMsg = "Access Denied: Superadmin / DevOps privileges required.";
  } else {
    docBundle = await loadDoc(app, docPath);
    if (!docBundle) {
      errorMsg = "Documentation page not found.";
    }
  }

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
              <Link
                href="/docs/periodical"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  app === "periodical"
                    ? "bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-semibold"
                    : "hover:bg-white/5 text-zinc-400"
                }`}
              >
                <span>Periodical</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Journal</span>
              </Link>
              <Link
                href="/docs/watson"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  app === "watson"
                    ? "bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-semibold"
                    : "hover:bg-white/5 text-zinc-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>Watson</span>
                  {!isSuperadmin && <Lock className="h-3 w-3 text-zinc-500" />}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Admin</span>
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
            <Link
              href="/docs/periodical"
              className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                app === "periodical" ? "bg-cyan-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Periodical
            </Link>
            <Link
              href="/docs/watson"
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                app === "watson" ? "bg-cyan-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <span>Watson</span>
              {!isSuperadmin && <Lock className="h-3 w-3" />}
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl min-w-0">
          {errorMsg ? (
            isWatsonGated ? (
              <div className="border border-red-500/20 bg-red-950/10 rounded-xl p-8 text-center flex flex-col items-center max-w-xl mx-auto my-12">
                <Lock className="h-12 w-12 text-red-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold text-white mb-2">Watson Access Denied</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Only users with verified Superadmin, Superuser, or DevOps roles are permitted to access the Watson Control Plane documentation.
                </p>
                <Link
                  href="/docs/spotlight"
                  className="rounded-lg bg-zinc-900 border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-all hover:bg-zinc-800"
                >
                  Return to Spotlight Manual
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
                  href={`/docs/${app}`}
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
