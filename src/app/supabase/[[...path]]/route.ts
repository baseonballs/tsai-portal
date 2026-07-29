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

  const targetBase = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://spark-62db.tail18f71b.ts.net:8443/supabase").replace(/\/$/, "");
  const targetUrl = `${targetBase}/${pathString}${search}`;

  try {
    const headers = new Headers();
    const reqHeaders = request.headers;
    const forwardHeaderKeys = ["authorization", "apikey", "content-type", "accept", "x-client-info", "cookie"];
    for (const key of forwardHeaderKeys) {
      if (reqHeaders.has(key)) {
        headers.set(key, reqHeaders.get(key)!);
      }
    }

    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

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
    return NextResponse.json({ error: err.message || "Proxy error" }, { status: 502 });
  }
}
