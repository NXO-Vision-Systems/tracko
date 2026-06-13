import { NextResponse } from "next/server";

// Fetch a real Deezer album cover for a given artist + title
async function getDeezerCover(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=1`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.cover_xl || data.data?.[0]?.cover_big || null;
  } catch {
    return null;
  }
}

// Hybrid featured: for a recognizable artist, fetch their LATEST studio album live.
// Auto-updates when they release something new, but stays curated to big names.
async function getLatestAlbum(artistName: string) {
  try {
    const sRes = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`,
      { signal: AbortSignal.timeout(4000) }
    );
    const sData = await sRes.json();
    const artist = sData.data?.[0];
    if (!artist?.id) return null;

    const aRes = await fetch(`https://api.deezer.com/artist/${artist.id}/albums?limit=50`, {
      signal: AbortSignal.timeout(4000),
    });
    const aData = await aRes.json();
    // Keep original studio albums; drop live/reissue/deluxe/remix editions whose
    // fresh "re-release" dates would otherwise masquerade as new music.
    const EXCLUDE =
      /\blive\b|anniversary|deluxe|edition|\bversion\b|remaster|commentary|karaoke|instrumental|sped up|slowed|acoustic|remix|tour/i;
    let albums = (aData.data || []).filter(
      (a: any) => a.record_type === "album" && !EXCLUDE.test(a.title || "")
    );
    // Drop self-titled debut reissues (they get a fresh re-release date and would
    // masquerade as the newest album) — but only if the artist has other albums.
    if (albums.length > 1) {
      const norm = (s: string) => (s || "").trim().toLowerCase();
      const filtered = albums.filter((a: any) => norm(a.title) !== norm(artist.name));
      if (filtered.length > 0) albums = filtered;
    }
    if (albums.length === 0) return null;

    // Newest by release date
    albums.sort((a: any, b: any) =>
      (b.release_date || "").localeCompare(a.release_date || "")
    );
    const latest = albums[0];

    return {
      albumId: latest.id,
      title: latest.title,
      subtitle: artist.name,
      img: latest.cover_xl || latest.cover_big || null,
      releaseDate: latest.release_date || "",
      fans: artist.nb_fan || 0,
    };
  } catch {
    return null;
  }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function GET() {
  try {
    // 1. Featured Hero — HYBRID: curated allowlist of recognizable artists, each
    // resolved to their LATEST album live. Refreshes automatically when these
    // artists drop new music, but never surfaces obscure/regional noise.
    const FEATURED_ARTISTS = [
      "The Weeknd",
      "Kendrick Lamar",
      "Billie Eilish",
      "Sabrina Carpenter",
      "Tyler, The Creator",
      "Drake",
      "SZA",
      "Travis Scott",
      "Taylor Swift",
      "Ariana Grande",
    ];
    const albumResults = (await Promise.all(FEATURED_ARTISTS.map(getLatestAlbum))).filter(
      (a): a is NonNullable<typeof a> => a !== null && a.img !== null
    );

    // Freshest releases first; show the top picks
    albumResults.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    const featured = albumResults.slice(0, 6).map((a) => ({
      albumId: a.albumId,
      title: a.title,
      subtitle: a.subtitle,
      desc: "TRENDING ALBUM",
      img: a.img,
    }));

    // 2. Quick Play (Massive Global Playlists) — each seeded with a real track so
    // tapping the tile actually plays music instead of searching the playlist name.
    const quickPlayQueries = [
      { title: "RapCaviar", query: "RapCaviar" },
      { title: "Today's Top Hits", query: "Today's Top Hits" },
      { title: "Lofi Beats", query: "Lofi Beats" },
      { title: "R&B Classics", query: "R&B Classics" },
    ];
    const quickPlay = await Promise.all(
      quickPlayQueries.map(async (q) => {
        let img: string | null = null;
        let playlistId: number | null = null;
        try {
          const res = await fetch(
            `https://api.deezer.com/search/playlist?q=${encodeURIComponent(q.query)}&limit=1`,
            { signal: AbortSignal.timeout(4000) }
          );
          const data = await res.json();
          const pl = data.data?.[0];
          img = pl?.picture_xl || pl?.picture_big || null;
          playlistId = pl?.id ?? null;
        } catch {
          /* tile still renders even if the lookup fails */
        }
        return { title: q.title, img, playlistId };
      })
    );

    // 3. Trending Tracks — curated big hits, with live details/artwork from Deezer
    const trendingQueries = [
      { artist: "Kendrick Lamar", title: "squabble up" },
      { artist: "Sabrina Carpenter", title: "Espresso" },
      { artist: "The Weeknd, Playboi Carti", title: "Timeless" },
      { artist: "Billie Eilish", title: "Birds Of A Feather" },
      { artist: "Tyler, The Creator", title: "Noid" },
    ];
    const trendingData = await Promise.all(
      trendingQueries.map(async (q) => {
        try {
          const res = await fetch(
            `https://api.deezer.com/search/track?q=${encodeURIComponent(q.artist + " " + q.title)}&limit=1`,
            { signal: AbortSignal.timeout(4000) }
          );
          const data = await res.json();
          const t = data.data?.[0];
          if (!t) return null;
          return {
            id: t.id.toString(),
            title: t.title,
            artist: t.artist?.name ?? q.artist,
            duration: formatDuration(t.duration),
            img: t.album?.cover_xl || t.album?.cover_big || null,
          };
        } catch {
          return null;
        }
      })
    );
    const trending = trendingData.filter(Boolean);

    // 4. Made For You — real recommended tracks (coherent cover/title/artist, and playable)
    const madeForYouQueries = [
      { artist: "The Weeknd", title: "Blinding Lights" },
      { artist: "SZA", title: "Snooze" },
      { artist: "Frank Ocean", title: "Pink + White" },
      { artist: "Daft Punk", title: "Instant Crush" },
      { artist: "Billie Eilish", title: "everything i wanted" },
      { artist: "Kendrick Lamar", title: "Money Trees" },
    ];
    const madeForYouData = await Promise.all(
      madeForYouQueries.map(async (q) => {
        try {
          const res = await fetch(
            `https://api.deezer.com/search/track?q=${encodeURIComponent(q.artist + " " + q.title)}&limit=1`,
            { signal: AbortSignal.timeout(4000) }
          );
          const data = await res.json();
          const t = data.data?.[0];
          return {
            title: t?.title ?? q.title,
            sub: t?.artist?.name ?? q.artist,
            img: t?.album?.cover_xl || t?.album?.cover_big || null,
          };
        } catch {
          return { title: q.title, sub: q.artist, img: null };
        }
      })
    );
    const madeForYou = madeForYouData;

    // 5. New Releases — real latest albums from Deezer editorial
    let newReleases: any[] = [];
    try {
      const res = await fetch("https://api.deezer.com/editorial/0/releases?limit=12", {
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      newReleases = (data.data || []).slice(0, 8).map((a: any) => ({
        title: a.title,
        sub: a.artist?.name ?? "New Release",
        img: a.cover_xl || a.cover_big || null,
      }));
    } catch {
      newReleases = [];
    }

    // 6. Radio — Deezer stations; each seeded with a real track so it actually plays
    let radio: any[] = [];
    try {
      const res = await fetch("https://api.deezer.com/radio?limit=8", {
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      const stations = (data.data || []).slice(0, 8);
      radio = await Promise.all(
        stations.map(async (s: any) => {
          let playTitle: string | undefined;
          let playArtist: string | undefined;
          try {
            const tr = await fetch(`https://api.deezer.com/radio/${s.id}/tracks?limit=1`, {
              signal: AbortSignal.timeout(4000),
            });
            const td = await tr.json();
            const t = td.data?.[0];
            playTitle = t?.title;
            playArtist = t?.artist?.name;
          } catch {
            /* station still shows, just falls back to title seed */
          }
          return {
            title: s.title,
            sub: "Radio Station",
            img: s.picture_xl || s.picture_big || null,
            playTitle,
            playArtist,
          };
        })
      );
    } catch {
      radio = [];
    }

    return NextResponse.json({
      featured,
      quickPlay,
      trending,
      madeForYou,
      newReleases,
      radio,
    });
    
  } catch (error) {
    console.error("Homepage API Error:", error);
    return NextResponse.json({ featured: [], quickPlay: [], trending: [], madeForYou: [] });
  }
}
