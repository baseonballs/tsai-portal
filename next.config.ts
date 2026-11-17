import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    // Phase 156: the public, shared-cacheable header below used to apply to EVERY path —
    // including the GoTrue proxy (/supabase/auth/v1/token returns access tokens), the OAuth
    // callback (sets session cookies) and the licence-gated /docs. A shared cache honouring it
    // could hand one user's tokens or pages to the next. It now covers only the public
    // marketing surface; signed-in and API paths are private and never stored.
    const PRIVATE_PATHS = ["/api/:path*", "/auth/:path*", "/supabase/:path*", "/docs/:path*", "/login/:path*"];
    return [
      ...PRIVATE_PATHS.map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Vary", value: "Cookie, Authorization" },
        ],
      })),
      {
        source: "/((?!api/|api$|auth/|auth$|supabase/|supabase$|docs/|docs$|login/|login$).*)",
        headers: [
          {
            key: "Vary",
            value: "User-Agent, Accept-Encoding, RSC, Next-Router-State-Tree, Next-Router-Prefetch",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
