import type { NextConfig } from "next";

const SUPABASE_AUTH_ORIGIN = process.env.TSAI_SUPABASE_AUTH_ORIGIN ?? 'http://auth.dev.tsai.local';
const SUPABASE_REST_ORIGIN = process.env.TSAI_SUPABASE_REST_ORIGIN ?? 'http://localhost:5550';

const nextConfig: any = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: [
    '127.0.0.1',
    '192.168.86.20',
    '100.74.23.2',
    'spark-62db.tail18f71b.ts.net',
    'landing.dev.tsai.local'
  ],
  async rewrites() {
    const dgx = (process.env.TSAI_DGX_ORIGIN ?? "").trim().replace(/\/$/, "");

    if (process.env.TSAI_DEPLOY_TARGET === "cloudrun" && dgx) {
      return [
        {
          source: "/supabase/auth/v1/:path*",
          destination: `${dgx}/supabase/auth/v1/:path*`,
        },
        {
          source: "/supabase/rest/v1/:path*",
          destination: `${dgx}/supabase/rest/v1/:path*`,
        },
      ];
    }

    return [
      {
        source: "/supabase/auth/v1/:path*",
        destination: `${SUPABASE_AUTH_ORIGIN}/:path*`,
      },
      {
        source: "/supabase/rest/v1/:path*",
        destination: `${SUPABASE_REST_ORIGIN}/rest/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
