import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing target URL parameter" }, { status: 400 });
    }

    const res = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Deezer API error: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Deezer proxy error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
