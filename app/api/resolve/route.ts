import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube";

export const dynamic = "force-dynamic";

// Redirect cache directory to /tmp on Vercel to avoid EROFS error
process.env.YTDL_NO_DEBUG_FILE = "true";
if (process.env.NODE_ENV === "production" || !process.env.HOME) {
  process.env.HOME = "/tmp";
}
const ytdl = require("@distube/ytdl-core");

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

    try {
      const info = await ytdl.getInfo(video.videoId);
      const format = ytdl.chooseFormat(info.formats, { filter: "audioonly", quality: "highestaudio" });
      
      if (format && format.url) {
        const proxyUrl = `/api/stream?url=${encodeURIComponent(format.url)}`;
        return NextResponse.json({ url: proxyUrl });
      }
    } catch (ytdlError: any) {
      console.warn("ytdl-core resolution failed, falling back to YouTube watch URL:", ytdlError.stack || ytdlError);
    }

    // Fallback to watch URL
    return NextResponse.json({ url: video.url });
  } catch (error) {
    console.error("Resolve API Error:", error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
