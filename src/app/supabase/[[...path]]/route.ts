import { NextRequest, NextResponse } from "next/server";
import { errorMessage } from "@/lib/errors"

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

function resolveProxyTargetBase(request: NextRequest): string {
  const internalUrl = process.env.SUPABASE_INTERNAL_URL?.trim().replace(/\/$/, "");
  if (internalUrl) return internalUrl;

  const configured = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  if (configured) {
    try {
      const parsed = new URL(configured);
      const reqHost = request.nextUrl.hostname;
      const reqPort = request.nextUrl.port || (request.nextUrl.protocol === "https:" ? "443" : "80");
      const targetPort = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
      const isSelfOrigin =
        (parsed.hostname === reqHost ||
          (["localhost", "127.0.0.1"].includes(parsed.hostname) &&
            ["localhost", "127.0.0.1"].includes(reqHost))) &&
        targetPort === reqPort &&
        parsed.pathname.startsWith("/supabase");
      if (!isSelfOrigin) {
        return configured;
      }
    } catch {
      // ignore invalid URL and fall back below
    }
  }

  if (process.env.TSAI_DEPLOY_TARGET === "cloudrun") {
    const dgx = (process.env.TSAI_DGX_ORIGIN ?? "https://spark-62db.tail18f71b.ts.net:8443").trim().replace(/\/$/, "");
    return `${dgx}/supabase`;
  }

  return "http://127.0.0.1:5550";
}

async function handleProxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params;
  const pathString = path ? path.join("/") : "";
  const search = request.nextUrl.search;

  const targetBase = resolveProxyTargetBase(request);
  const targetUrl = `${targetBase}/${pathString}${search}`;

  const reqHeaders = request.headers;
  const headers = new Headers();
  const forwardHeaderKeys = ["authorization", "apikey", "content-type", "accept", "x-client-info", "cookie"];
  for (const key of forwardHeaderKeys) {
    if (reqHeaders.has(key)) {
      headers.set(key, reqHeaders.get(key)!);
    }
  }

  // Set explicit Host header to match target URL host for Tailscale Funnel TLS SNI
  try {
    const targetParsed = new URL(targetUrl);
    headers.set("host", targetParsed.host);
  } catch {
    /* ignore */
  }

  try {
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual", // CRITICAL: Do not follow redirects server-side; pass 302/303 back to browser!
    });

    const resHeaders = new Headers();
    res.headers.forEach((val, key) => {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
        resHeaders.set(key, val);
      }
    });

    // If GoTrue returned a redirect Location:
    // Only rewrite internal backend hosts to the browser's origin.
    // External OAuth provider URLs (e.g. accounts.google.com) MUST remain untouched!
    const location = res.headers.get("location");
    if (location) {
      try {
        const locUrl = new URL(location, targetUrl);
        const isInternalHost =
          locUrl.hostname === "spark-62db.tail18f71b.ts.net" ||
          locUrl.hostname === "127.0.0.1" ||
          locUrl.hostname === "0.0.0.0" ||
          locUrl.hostname === "localhost";

        if (isInternalHost) {
          const browserOrigin = request.nextUrl.origin;
          const rewrittenLoc = `${browserOrigin}${locUrl.pathname}${locUrl.search}${locUrl.hash}`;
          resHeaders.set("location", rewrittenLoc);
        } else {
          resHeaders.set("location", location);
        }
      } catch {
        resHeaders.set("location", location);
      }
    }

    const resBody = await res.arrayBuffer();
    return new NextResponse(resBody, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorMessage(err) || "Proxy error",
        // `cause` is read behind an instanceof guard: the caught value is `unknown`, and
        // reading .cause off it unguarded is exactly what the old `: any` was hiding.
        cause: err instanceof Error && err.cause ? String(err.cause) : undefined,
      },
      { status: 502 }
    );
  }
}
