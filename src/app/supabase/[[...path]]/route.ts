import { NextRequest, NextResponse } from "next/server";

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

async function handleProxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params;
  const pathString = path ? path.join("/") : "";
  const search = request.nextUrl.search;

  const rawBase = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://spark-62db.tail18f71b.ts.net/supabase").replace(/\/$/, "");
  
  const urlsToTry: string[] = [];
  urlsToTry.push(`${rawBase}/${pathString}${search}`);

  if (rawBase.includes(":8443")) {
    const cleanBase = rawBase.replace(":8443", "");
    urlsToTry.push(`${cleanBase}/${pathString}${search}`);
  }

  const reqHeaders = request.headers;
  const headers = new Headers();
  const forwardHeaderKeys = ["authorization", "apikey", "content-type", "accept", "x-client-info", "cookie"];
  for (const key of forwardHeaderKeys) {
    if (reqHeaders.has(key)) {
      headers.set(key, reqHeaders.get(key)!);
    }
  }

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

  let lastError: any = null;
  for (const targetUrl of urlsToTry) {
    try {
      const res = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      });

      const resHeaders = new Headers();
      res.headers.forEach((val, key) => {
        if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
          resHeaders.set(key, val);
        }
      });

      const resBody = await res.arrayBuffer();
      return new NextResponse(resBody, {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
      });
    } catch (err: any) {
      lastError = err;
    }
  }

  return NextResponse.json({ error: lastError?.message || "Proxy error" }, { status: 502 });
}
