import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get("url");

  if (!streamUrl) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(streamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      return new Response(`Failed to fetch stream: ${res.statusText}`, { status: res.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "audio/mpeg");
    if (res.headers.get("Content-Length")) {
      headers.set("Content-Length", res.headers.get("Content-Length")!);
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "no-cache");

    return new Response(res.body, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error("Stream Proxy Error:", err);
    return new Response(err.message, { status: 500 });
  }
}
