import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const title = searchParams.get("title");

  if (!artist || !title) {
    return NextResponse.json({ url: null }, { status: 400 });
  }

  try {
    const ytQuery = `${artist} ${title} topic`;
    const ytVideos = await searchYouTube(ytQuery);

    const video = ytVideos.find((v) => v.seconds >= 60 && v.seconds <= 720) 
               || ytVideos[0];

    if (!video) {
      return NextResponse.json({ url: null }, { status: 404 });
    }

    return NextResponse.json({ url: video.url });
  } catch (error) {
    console.error("Resolve API Error:", error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
