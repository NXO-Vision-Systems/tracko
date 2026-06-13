interface YouTubeVideo {
  videoId: string;
  title: string;
  author: string;
  durationText: string;
  seconds: number;
  thumbnail: string;
  url: string;
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const data = extractJson(html);
    if (!data) return [];

    const videoRenderers: any[] = [];
    function findVideos(obj: any) {
      if (!obj || typeof obj !== "object") return;
      if (obj.videoRenderer) {
        videoRenderers.push(obj.videoRenderer);
        return;
      }
      for (const key of Object.keys(obj)) {
        findVideos(obj[key]);
      }
    }
    findVideos(data);

    const videos: YouTubeVideo[] = [];
    for (const v of videoRenderers) {
      const videoId = v.videoId;
      if (!videoId) continue;
      const title = v.title?.runs?.[0]?.text || v.title?.simpleText || "";
      const author = v.ownerText?.runs?.[0]?.text || "";
      const durationText = v.lengthText?.simpleText || "";
      const thumbnail = v.thumbnail?.thumbnails?.[0]?.url || "";

      let seconds = 0;
      if (durationText) {
        const parts = durationText.split(":").map(Number);
        if (parts.length === 2) {
          seconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }

      videos.push({
        videoId,
        title,
        author,
        durationText,
        seconds,
        thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`
      });
    }
    return videos;
  } catch (err) {
    console.error("YouTube search error:", err);
    return [];
  }
}

function extractJson(html: string): any {
  const marker = "ytInitialData = ";
  const index = html.indexOf(marker);
  if (index === -1) return null;
  const start = index + marker.length;
  let braceCount = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          try {
            return JSON.parse(html.slice(start, i + 1));
          } catch (e) {
            return null;
          }
        }
      }
    }
  }
  return null;
}
