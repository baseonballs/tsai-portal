import type { NextConfig } from "next";

const SUPABASE_AUTH_ORIGIN = process.env.TSAI_SUPABASE_AUTH_ORIGIN ?? 'http://auth.dev.tsai.local';
const SUPABASE_REST_ORIGIN = process.env.TSAI_SUPABASE_REST_ORIGIN ?? 'http://localhost:5550';

const nextConfig: any = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    '127.0.0.1',
    '192.168.86.20',
    '100.74.23.2',
    'spark-62db.tail18f71b.ts.net',
    'landing.dev.tsai.local'
  ],
  async rewrites() {
    return [
      {
        source: "/supabase/auth/v1/:path*",
        destination: `${SUPABASE_AUTH_ORIGIN}/:path*`,
      },
      {
        source: "/supabase/rest/v1/:path*",
        destination: `${SUPABASE_REST_ORIGIN}/rest/v1/:path*`,
      },
    ]
  },
};

export default nextConfig;
