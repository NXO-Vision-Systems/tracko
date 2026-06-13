const yts = require("yt-search");

async function test() {
  const query = "tiakola";
  try {
    console.log("Fetching iTunes...");
    const itunesRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=15`,
      { signal: AbortSignal.timeout(4000) }
    );
    const itunesData = await itunesRes.json();
    console.log(`Found ${itunesData.results?.length} on iTunes`);

    const officialSongs = [];
    const seen = new Set();
    
    for (const track of itunesData.results) {
      const key = `${track.artistName} - ${track.trackName}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        officialSongs.push(track);
      }
      if (officialSongs.length >= 8) break;
    }

    console.log(`Deduplicated to ${officialSongs.length} songs. Fetching YT...`);

    const songs = await Promise.all(
      officialSongs.map(async (track) => {
        try {
          const ytQuery = `${track.artistName} ${track.trackName} topic OR official audio`;
          console.log("Searching yt:", ytQuery);
          const ytResult = await yts(ytQuery);
          const video = ytResult.videos[0];
          console.log("YT found:", video ? video.title : "null");
          if (!video) return null;
          return { id: video.videoId };
        } catch (e) {
          console.error("YT error for", track.trackName, e.message);
          return null;
        }
      })
    );

    const validSongs = songs.filter((s) => s !== null);
    console.log("Valid songs count:", validSongs.length);
  } catch (err) {
    console.error("Fatal error:", err.message);
  }
}

test();
