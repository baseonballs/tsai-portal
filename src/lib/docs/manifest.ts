/**
 * The documents the Portal publishes — and the ONLY ones it will serve.
 *
 * Phase 156. The /docs route used to serve three trees copied in from sibling repositories:
 * Spotlight's customer manual, Periodical's whole `docs/` directory, and Watson's. The Periodical
 * and Watson trees are internal engineering material — architecture, runbooks, release notes —
 * and they carried operator identities, internal hostnames and the names of real users. Any
 * signed-in account could read them, and the loader would open any file under the tree by path,
 * not just the ones in the sidebar.
 *
 * Now the Portal publishes Spotlight's customer manual only, and only the pages listed here. A
 * slug that is not in this list is "not found" even if a file of that name exists on disk.
 */

export interface DocItem {
  title: string;
  slug: string;
  category: string;
}

/** The welcome page, served at /docs and /docs/spotlight. */
export const SPOTLIGHT_WELCOME_SLUG = "welcome";

export const SPOTLIGHT_DOCS: readonly DocItem[] = [
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

const PUBLISHED = new Set<string>([SPOTLIGHT_WELCOME_SLUG, ...SPOTLIGHT_DOCS.map((d) => d.slug)]);

/**
 * Resolve a requested slug to a published one, or null. An empty slug is the welcome page.
 * Anything else must match a listed slug exactly — no extensions, no `..`, no other trees.
 */
export function resolvePublishedSpotlightSlug(slug: string): string | null {
  const wanted = slug === "" ? SPOTLIGHT_WELCOME_SLUG : slug;
  return PUBLISHED.has(wanted) ? wanted : null;
}
