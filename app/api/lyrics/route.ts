import { NextResponse } from "next/server";

const UA = "noxofy/0.1 (https://github.com/noxofy)";

// --- Normalization helpers ---

function stripDiacritics(s: string) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function cleanTitle(raw: string): string {
    let t = raw;
    // Drop bracketed junk: (Official Video), [Official Audio], (Lyrics), etc.
    t = t.replace(/[\(\[\{][^\)\]\}]*(official|video|audio|lyric|music|hd|4k|mv|visualizer|live|remix|clip officiel)[^\)\]\}]*[\)\]\}]/gi, "");
    t = t.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, (m) => (m.length > 25 ? "" : m)); // drop long parentheticals
    // "Artist - Title" → Title (caller passes artist separately so we strip the prefix)
    // ft./feat. tail
    t = t.replace(/\b(ft\.?|feat\.?|featuring)\s.+$/gi, "");
    // misc noise
    t = t.replace(/\|.*$/g, "");
    t = t.replace(/\s+-\s+(official|topic).*$/gi, "");
    return t.replace(/\s+/g, " ").trim();
}

function cleanArtist(raw: string): string {
    let a = raw;
    a = a.replace(/\s*-\s*Topic\s*$/i, "");
    a = a.replace(/VEVO$/i, "");
    a = a.replace(/\s*Official(\s|$)/gi, "");
    a = a.replace(/\s*Officiel(\s|$)/gi, "");
    a = a.replace(/\bMusic\b/gi, "");
    return a.replace(/\s+/g, " ").trim();
}

function tokenize(s: string): Set<string> {
    return new Set(
        stripDiacritics(s)
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length >= 2)
    );
}

function tokenOverlap(a: string, b: string): number {
    const ta = tokenize(a);
    const tb = tokenize(b);
    if (ta.size === 0 || tb.size === 0) return 0;
    let hits = 0;
    for (const w of ta) if (tb.has(w)) hits++;
    return hits / Math.min(ta.size, tb.size);
}

// --- LRCLIB calls ---

async function lrclibGet(track: string, artist: string, duration?: number, album?: string) {
    const params = new URLSearchParams({ track_name: track, artist_name: artist });
    if (album) params.set("album_name", album);
    if (duration) params.set("duration", String(Math.round(duration)));

    const res = await fetch(`https://lrclib.net/api/get?${params}`, {
        headers: { "User-Agent": UA },
        next: { revalidate: 86400 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
}

async function lrclibSearch(track: string, artist?: string) {
    const params = new URLSearchParams({ track_name: track });
    if (artist) params.set("artist_name", artist);
    const res = await fetch(`https://lrclib.net/api/search?${params}`, {
        headers: { "User-Agent": UA },
        next: { revalidate: 86400 },
    });
    if (!res.ok) return [] as any[];
    const arr = await res.json();
    return Array.isArray(arr) ? arr : [];
}

interface Candidate {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string | null;
    duration: number | null;
    instrumental: boolean;
    syncedLyrics: string | null;
    plainLyrics: string | null;
}

function scoreCandidate(c: Candidate, wantTrack: string, wantArtist: string, wantDuration?: number) {
    let score = 0;

    // Track title token overlap (heavy weight)
    const titleOverlap = tokenOverlap(c.trackName, wantTrack);
    score += titleOverlap * 50;

    // Artist token overlap (heavy weight)
    const artistOverlap = tokenOverlap(c.artistName, wantArtist);
    score += artistOverlap * 50;

    // Duration closeness — strong signal, ±2s perfect, fall off fast
    if (wantDuration && c.duration) {
        const diff = Math.abs(c.duration - wantDuration);
        if (diff <= 2) score += 30;
        else if (diff <= 5) score += 20;
        else if (diff <= 10) score += 5;
        else score -= diff; // penalize big mismatches
    }

    // Prefer entries with synced lyrics
    if (c.syncedLyrics) score += 8;
    else if (c.plainLyrics) score += 2;

    return { score, titleOverlap, artistOverlap };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawTrack = searchParams.get("track")?.trim();
    const rawArtist = searchParams.get("artist")?.trim();
    const album = searchParams.get("album")?.trim() || undefined;
    const durationParam = searchParams.get("duration");
    const duration = durationParam ? parseFloat(durationParam) : undefined;
    const debug = searchParams.get("debug") === "1";

    if (!rawTrack || !rawArtist) {
        return NextResponse.json({ error: "track and artist required" }, { status: 400 });
    }

    const track = cleanTitle(rawTrack);
    const artist = cleanArtist(rawArtist);
    const debugInfo: any = debug ? { rawTrack, rawArtist, cleanedTrack: track, cleanedArtist: artist, duration } : undefined;

    try {
        // 1. Exact get with cleaned inputs + duration
        const exact: Candidate | null = await lrclibGet(track, artist, duration, album);
        if (exact && (exact.syncedLyrics || exact.plainLyrics)) {
            return NextResponse.json(
                {
                    found: true,
                    matchType: "exact",
                    id: exact.id,
                    trackName: exact.trackName,
                    artistName: exact.artistName,
                    albumName: exact.albumName,
                    duration: exact.duration,
                    instrumental: exact.instrumental,
                    syncedLyrics: exact.syncedLyrics,
                    plainLyrics: exact.plainLyrics,
                    debug: debugInfo,
                },
                { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
            );
        }

        // 2. Search with artist+track, fall back to track only
        let candidates: Candidate[] = await lrclibSearch(track, artist);
        if (candidates.length === 0) candidates = await lrclibSearch(track);

        if (candidates.length === 0) {
            return NextResponse.json(
                { found: false, syncedLyrics: null, plainLyrics: null, debug: debugInfo },
                { headers: { "Cache-Control": "public, s-maxage=3600" } }
            );
        }

        // 3. Score & pick best
        const scored = candidates
            .map((c) => ({ c, ...scoreCandidate(c, track, artist, duration) }))
            .sort((a, b) => b.score - a.score);

        const best = scored[0];

        // Reject if not confident enough — better to show nothing than wrong lyrics
        const MIN_TITLE_OVERLAP = 0.5;
        const MIN_ARTIST_OVERLAP = 0.34;
        const MIN_SCORE = 45;

        const acceptable =
            best.titleOverlap >= MIN_TITLE_OVERLAP &&
            best.artistOverlap >= MIN_ARTIST_OVERLAP &&
            best.score >= MIN_SCORE &&
            (!duration || !best.c.duration || Math.abs((best.c.duration ?? 0) - duration) <= 10);

        if (!acceptable) {
            return NextResponse.json(
                {
                    found: false,
                    syncedLyrics: null,
                    plainLyrics: null,
                    debug: debug
                        ? { ...debugInfo, rejectedBest: { ...best.c, score: best.score, titleOverlap: best.titleOverlap, artistOverlap: best.artistOverlap } }
                        : undefined,
                },
                { headers: { "Cache-Control": "public, s-maxage=3600" } }
            );
        }

        return NextResponse.json(
            {
                found: true,
                matchType: "search",
                id: best.c.id,
                trackName: best.c.trackName,
                artistName: best.c.artistName,
                albumName: best.c.albumName,
                duration: best.c.duration,
                instrumental: best.c.instrumental,
                syncedLyrics: best.c.syncedLyrics,
                plainLyrics: best.c.plainLyrics,
                debug: debug ? { ...debugInfo, score: best.score, titleOverlap: best.titleOverlap, artistOverlap: best.artistOverlap } : undefined,
            },
            { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
        );
    } catch (err) {
        console.error("Lyrics fetch error:", err);
        return NextResponse.json({ error: "lyrics fetch failed" }, { status: 502 });
    }
}
