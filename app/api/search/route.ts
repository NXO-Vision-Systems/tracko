import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query) return NextResponse.json({ songs: [] });

  try {
    const deezerRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=50&order=RANKING`,
      { signal: AbortSignal.timeout(5000) }
    );

    const deezerData = deezerRes.ok ? await deezerRes.json() : { data: [] };
    const seen = new Set<string>();
    const songs: any[] = [];

    // 1. Try Deezer first (Official Catalog)
    if (deezerData.data?.length > 0) {
      for (const track of deezerData.data) {
        if (!track.title || !track.artist?.name) continue;
        const key = `${track.artist.name}|${track.title}`.toLowerCase();
        
        if (!seen.has(key)) {
          seen.add(key);
          songs.push({
            id: track.id.toString(),
            title: track.title,
            artist: track.artist.name,
            img: track.album?.cover_xl || track.album?.cover_big || null,
            thumbnail: track.album?.cover_xl || track.album?.cover_big || null,
            url: null,
            durationText: formatDuration(track.duration * 1000),
          });
        }
      }
    }

    // 2. SMART FALLBACK: If Deezer returns 0 results (likely due to a typo), use Google/YouTube autocorrect
    if (songs.length === 0) {
      const ytVideos = await searchYouTube(query);
      for (const video of ytVideos) {
        // Filter out extreme lengths and obvious junk
        if (video.seconds < 60 || video.seconds > 600) continue;
        const lowerTitle = video.title.toLowerCase();
        if (lowerTitle.includes("karaoke") || lowerTitle.includes("type beat") || lowerTitle.includes("instrumental cover")) continue;
        
        const key = `${video.author}|${video.title}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          songs.push({
            id: video.videoId,
            title: video.title,
            artist: video.author.replace(" - Topic", "").replace("VEVO", ""),
            img: video.thumbnail,
            thumbnail: video.thumbnail,
            url: video.url, // Already resolved!
            durationText: video.durationText,
          });
        }
        if (songs.length >= 20) break;
      }
    }

    return NextResponse.json({ songs });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ songs: [] });
  }
}

function formatDuration(millis: number) {
  if (!millis) return "";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
