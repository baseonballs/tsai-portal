import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
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
  async rewrites() {
    const supabaseBase = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://spark-62db.tail18f71b.ts.net:8443/supabase")
      .replace(/\/supabase\/?$/, "");
    return [
      {
        source: "/supabase/:path*",
        destination: `${supabaseBase}/supabase/:path*`,
      },
    ];
  },
};

export default nextConfig;
