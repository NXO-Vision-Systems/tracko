"use client";

import { Search, Play, X, ChevronLeft, Shuffle, MoreHorizontal, Plus, Download, Share2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAppStore } from "@/store/useAppStore";
import { getApiUrl } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { playTrack, setFullPlayerOpen } = usePlayerStore();
  const { targetArtist, setTargetArtist } = useAppStore();
  const setOpenItem = useAppStore((s) => s.setOpenItem);
  const targetArtistId = useAppStore((s) => s.targetArtistId);
  const setTargetArtistId = useAppStore((s) => s.setTargetArtistId);

  // Open a specific artist by id (precise — used by "View Artist" from the player)
  useEffect(() => {
    if (targetArtistId == null) return;
    setLoading(true);
    fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/artist/${targetArtistId}`)}`))
      .then((r) => r.json())
      .then((found) => {
        if (found?.id) {
          setSelectedArtist({
            id: found.id,
            name: found.name,
            img: found.picture_xl || found.picture_big,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    setTargetArtistId(null);
  }, [targetArtistId, setTargetArtistId]);

  useEffect(() => {
    if (targetArtist) {
      setLoading(true);
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/search/artist?q=${encodeURIComponent(targetArtist)}&limit=1`)}`))
        .then((r) => r.json())
        .then((data) => {
          const found = data.data?.[0];
          if (found) {
            setSelectedArtist({
              id: found.id,
              name: found.name,
              img: found.picture_xl || found.picture_big
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      setTargetArtist(null);
    }
  }, [targetArtist, setTargetArtist]);

  const genres = [
    { title: "Pop", color: "from-pink-500/30 to-pink-500/5" },
    { title: "Hip-Hop", color: "from-orange-500/30 to-orange-500/5" },
    { title: "Rock", color: "from-red-500/30 to-red-500/5" },
    { title: "Electronic", color: "from-indigo-500/30 to-indigo-500/5" },
    { title: "R&B", color: "from-purple-500/30 to-purple-500/5" },
    { title: "Jazz", color: "from-blue-500/30 to-blue-500/5" },
    { title: "Classical", color: "from-emerald-500/30 to-emerald-500/5" },
    { title: "Indie", color: "from-teal-500/30 to-teal-500/5" },
  ];

  const [view, setView] = useState<'main' | 'songs' | 'artists' | 'albums' | 'playlists'>('main');
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [moreMenuData, setMoreMenuData] = useState<{ title: string, subtitle: string, img: string } | null>(null);

  // Live Data State
  const [topResult, setTopResult] = useState<any | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Artist Profile Live State
  const [artistTracks, setArtistTracks] = useState<any[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<any[]>([]);
  const [latestReleases, setLatestReleases] = useState<any[]>([]);
  const [appearsOn, setAppearsOn] = useState<any[]>([]);

  // Album Modal Live State
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [albumTracks, setAlbumTracks] = useState<any[]>([]);
  const [loadingAlbum, setLoadingAlbum] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setTopResult(null);
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const proxy = (url: string) =>
          fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(url)}`)).then((r) => r.json());

        const [searchRes, artistData, albumData, playlistData] = await Promise.all([
          fetch(getApiUrl(`/api/search?q=${encodeURIComponent(query)}`)).then((r) => r.json()),
          proxy(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=10`),
          proxy(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=15`),
          proxy(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=15`),
        ]);

        const tracks = searchRes.songs || [];
        setTopResult(tracks[0] ? { ...tracks[0], type: "Song" } : null);
        setSongs(tracks.slice(1));

        setArtists((artistData.data || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          img: a.picture_xl || a.picture_big,
        })));
        setAlbums((albumData.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          artist: a.artist?.name || "",
          img: a.cover_xl || a.cover_big || null,
        })));
        setPlaylists((playlistData.data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          creator: p.user?.name || "Playlist",
          img: p.picture_xl || p.picture_big || null,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!selectedArtist) return;
    setArtistTracks([]);
    setArtistAlbums([]);
    setLatestReleases([]);
    setAppearsOn([]);
    Promise.all([
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/artist/${selectedArtist.id}/top?limit=15`)}`)).then(r => r.json()),
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/artist/${selectedArtist.id}/albums?limit=30`)}`)).then(r => r.json()),
      // Collabs: search the name, then keep tracks where they're NOT the main artist.
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/search/track?q=${encodeURIComponent(selectedArtist.name)}&limit=50&order=RANKING`)}`)).then(r => r.json()),
    ]).then(async ([topData, albumData, collabData]) => {
      const dz = (url: string) =>
        fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(url)}`)).then((r) => r.json());

      setArtistTracks((topData.data || []).map((t: any) => {
        const cover = t.album?.cover_xl || t.album?.cover_big || selectedArtist.img;
        return {
          id: t.id,
          title: t.title,
          artist: selectedArtist.name,
          duration: Math.floor(t.duration / 60) + ":" + (t.duration % 60).toString().padStart(2, "0"),
          img: cover,
          thumbnail: cover,
          url: undefined
        };
      }));
      const mapRelease = (a: any) => ({
        id: a.id,
        name: a.title,
        type: a.record_type === "album" ? "Album" : a.record_type === "ep" ? "EP" : "Single",
        year: a.release_date?.split("-")[0] || "",
        date: a.release_date || "",
        img: a.cover_xl || a.cover_big,
      });
      const allReleases = (albumData.data || []).map(mapRelease);

      // Discography: full albums only (first 5, as before)
      setArtistAlbums(allReleases.filter((r: any) => r.type === "Album").slice(0, 5));

      // Latest Releases: everything (incl. EPs/singles), newest first
      setLatestReleases(
        [...allReleases].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 6)
      );

      // Appears On: tracks where this artist is a contributor but NOT the lead.
      // The name search is noisy, so verify each candidate's contributors actually
      // include THIS artist id (handles same-name artists and search junk).
      const artistId = selectedArtist.id;
      const candidates: any[] = [];
      const seen = new Set<string>();
      for (const t of collabData.data || []) {
        if (!t.title || t.artist?.id === artistId) continue; // skip their own lead tracks
        const key = `${(t.artist?.name || "").toLowerCase()}|${t.title.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push(t);
        if (candidates.length >= 18) break; // bound how many we verify
      }

      const collabs: any[] = [];
      for (const t of candidates) {
        if (collabs.length >= 6) break;
        try {
          const full = await dz(`https://api.deezer.com/track/${t.id}`);
          const ids = (full.contributors || []).map((c: any) => c.id);
          if (!ids.includes(artistId)) continue; // not actually this artist — drop it
        } catch {
          continue;
        }
        const cover = t.album?.cover_xl || t.album?.cover_big || selectedArtist.img;
        collabs.push({
          id: t.id,
          title: t.title,
          artist: t.artist?.name || "",
          duration: Math.floor(t.duration / 60) + ":" + (t.duration % 60).toString().padStart(2, "0"),
          img: cover,
          thumbnail: cover,
          url: undefined,
        });
      }
      setAppearsOn(collabs);
    });
  }, [selectedArtist]);

  useEffect(() => {
    if (!selectedAlbum) return;
    setAlbumTracks([]);
    setLoadingAlbum(true);
    fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/album/${selectedAlbum.id}/tracks?limit=50`)}`))
      .then(r => r.json())
      .then(data => {
        setAlbumTracks((data.data || []).map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          artist: t.artist?.name || selectedArtist?.name || "Various Artists",
          duration: Math.floor(t.duration / 60) + ":" + (t.duration % 60).toString().padStart(2, "0"),
          img: selectedAlbum.img,
          thumbnail: selectedAlbum.img,
          url: undefined,
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingAlbum(false));
  }, [selectedAlbum]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setView('main');
  };

  return (
    <div className="scroll-content safe-pt px-4 flex flex-col gap-6 w-full max-w-2xl mx-auto h-full pb-32">
      <AnimatePresence mode="wait">
        {view === 'main' ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-6 drop-shadow-md">Search</h1>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search size={20} className="text-white/40 group-focus-within:text-white/80 transition-colors" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.2] transition-all font-medium shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10"
                  placeholder="Songs, artists, or podcasts..."
                />
                {query && (
                  <button
                    onClick={() => handleQueryChange("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 rounded-t-2xl pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-2xl z-0" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!query ? (
                <motion.div 
                  key="browse"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 mt-4"
                >
                  <h2 className="text-xl font-bold tracking-tight text-white/90">Browse All</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {genres.map((genre) => (
                      <div key={genre.title} className="relative overflow-hidden rounded-2xl aspect-[2/1] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all p-4 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80`} />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                        <span className="font-bold text-white/90 text-lg drop-shadow-md z-10 relative">{genre.title}</span>
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, staggerChildren: 0.1 }}
                  className="flex flex-col gap-8 mt-2"
                >
                  {loading && (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    </div>
                  )}
                  
                  {/* Top Result */}
                  {!loading && topResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h2 className="text-xl font-bold tracking-tight text-white/90 mb-4">Top Result</h2>
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-3xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.06] transition-all"
                        onClick={() => {
                          playTrack({ title: topResult.title, artist: topResult.artist, thumbnail: topResult.img }, [topResult, ...songs]);
                          setFullPlayerOpen(true);
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                        <div className="flex gap-4 items-center relative z-10">
                          <img src={topResult.img} alt={topResult.title} className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500" />
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{topResult.title}</h3>
                            <p className="text-white/60 mb-2 font-medium">{topResult.artist} • <span className="uppercase text-[11px] tracking-wider px-2 py-0.5 rounded-full bg-white/10">{topResult.type}</span></p>
                          </div>
                          <button className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-white shrink-0 hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                            <Play size={20} className="ml-1 relative z-10 drop-shadow-md" fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Songs */}
                  {!loading && songs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white/90">Songs</h2>
                        <button 
                          onClick={() => setView('songs')}
                          className="text-[11px] font-bold tracking-wider uppercase text-white/50 hover:text-white transition-colors"
                        >
                          See all
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {songs.slice(0, 3).map((song, index) => (
                          <div 
                            key={song.id || index} 
                            className="relative group cursor-pointer rounded-2xl p-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center gap-4"
                            onClick={() => {
                              playTrack({ title: song.title, artist: song.artist, thumbnail: song.img }, [topResult, ...songs]);
                              setFullPlayerOpen(true);
                            }}
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-12 h-12 shrink-0">
                              <img src={song.img} alt={song.title} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-semibold text-base mb-0.5">{song.title}</div>
                              <div className="text-white/50 text-sm">{song.artist}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Artists */}
                  {!loading && artists.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white/90">Artists</h2>
                        <button 
                          onClick={() => setView('artists')}
                          className="text-[11px] font-bold tracking-wider uppercase text-white/50 hover:text-white transition-colors"
                        >
                          See all
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {artists.slice(0, 3).map(artist => (
                          <div 
                            key={artist.id} 
                            className="relative group cursor-pointer rounded-2xl p-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center gap-4"
                            onClick={() => setSelectedArtist(artist)}
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src={artist.img} alt={artist.name} className="w-12 h-12 rounded-full object-cover shadow-md" />
                            <div className="flex-1">
                              <div className="text-white font-semibold text-base mb-0.5">{artist.name}</div>
                              <div className="text-white/50 text-sm">Artist</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Albums */}
                  {!loading && albums.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white/90">Albums</h2>
                        <button
                          onClick={() => setView('albums')}
                          className="text-[11px] font-bold tracking-wider uppercase text-white/50 hover:text-white transition-colors"
                        >
                          See all
                        </button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
                        {albums.slice(0, 6).map(album => (
                          <div
                            key={album.id}
                            className="shrink-0 w-32 snap-start group cursor-pointer"
                            onClick={() =>
                              setOpenItem({ title: album.title, subtitle: album.artist, img: album.img, albumId: album.id })
                            }
                          >
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md mb-2 transition-transform group-hover:scale-105">
                              <img src={album.img} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="text-white font-semibold text-sm truncate">{album.title}</div>
                            <div className="text-white/50 text-xs truncate">{album.artist}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Playlists */}
                  {!loading && playlists.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white/90">Playlists</h2>
                        <button
                          onClick={() => setView('playlists')}
                          className="text-[11px] font-bold tracking-wider uppercase text-white/50 hover:text-white transition-colors"
                        >
                          See all
                        </button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
                        {playlists.slice(0, 6).map(pl => (
                          <div
                            key={pl.id}
                            className="shrink-0 w-32 snap-start group cursor-pointer"
                            onClick={() =>
                              setOpenItem({ title: pl.title, subtitle: pl.creator, img: pl.img, playlistId: pl.id })
                            }
                          >
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md mb-2 transition-transform group-hover:scale-105">
                              <img src={pl.img} alt={pl.title} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="text-white font-semibold text-sm truncate">{pl.title}</div>
                            <div className="text-white/50 text-xs truncate">{pl.creator}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : view === 'songs' ? (
          <motion.div 
            key="songs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 sticky top-0 bg-black/80 backdrop-blur-xl py-4 z-20">
              <button 
                onClick={() => setView('main')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">All Songs</h1>
                <p className="text-white/40 text-xs mt-0.5">{songs.length} songs</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-10">
              {songs.map((song, index) => (
                <div 
                  key={song.id || index} 
                  className="relative group cursor-pointer rounded-2xl p-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center gap-4"
                  onClick={() => {
                    playTrack({ title: song.title, artist: song.artist, thumbnail: song.img }, songs);
                    setFullPlayerOpen(true);
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-12 h-12 shrink-0">
                    <img src={song.img} alt={song.title} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-base mb-0.5">{song.title}</div>
                    <div className="text-white/50 text-sm">{song.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : view === 'artists' ? (
          <motion.div 
            key="artists"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 sticky top-0 bg-black/80 backdrop-blur-xl py-4 z-20">
              <button 
                onClick={() => setView('main')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">All Artists</h1>
                <p className="text-white/40 text-xs mt-0.5">{artists.length} artists</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-10">
              {artists.map(artist => (
                <div 
                  key={artist.id} 
                  className="relative group cursor-pointer rounded-2xl p-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center gap-4"
                  onClick={() => setSelectedArtist(artist)}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={artist.img} alt={artist.name} className="w-12 h-12 rounded-full object-cover shadow-md" />
                  <div className="flex-1">
                    <div className="text-white font-semibold text-base mb-0.5">{artist.name}</div>
                    <div className="text-white/50 text-sm">Artist</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : view === 'albums' ? (
          <motion.div
            key="albums"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 sticky top-0 bg-black/80 backdrop-blur-xl py-4 z-20">
              <button
                onClick={() => setView('main')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">All Albums</h1>
                <p className="text-white/40 text-xs mt-0.5">{albums.length} albums</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-10">
              {albums.map(album => (
                <div
                  key={album.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    setOpenItem({ title: album.title, subtitle: album.artist, img: album.img, albumId: album.id })
                  }
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md mb-2 transition-transform group-hover:scale-105">
                    <img src={album.img} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="text-white font-semibold text-sm truncate">{album.title}</div>
                  <div className="text-white/50 text-xs truncate">{album.artist}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : view === 'playlists' ? (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 sticky top-0 bg-black/80 backdrop-blur-xl py-4 z-20">
              <button
                onClick={() => setView('main')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">All Playlists</h1>
                <p className="text-white/40 text-xs mt-0.5">{playlists.length} playlists</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-10">
              {playlists.map(pl => (
                <div
                  key={pl.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    setOpenItem({ title: pl.title, subtitle: pl.creator, img: pl.img, playlistId: pl.id })
                  }
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md mb-2 transition-transform group-hover:scale-105">
                    <img src={pl.img} alt={pl.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="text-white font-semibold text-sm truncate">{pl.title}</div>
                  <div className="text-white/50 text-xs truncate">{pl.creator}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArtist && (
          <motion.div 
            key="artist_profile"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[60] bg-black overflow-y-auto overflow-x-hidden pb-40 scrollbar-hide"
          >
            {/* Header / Nav */}
            <div className="flex items-center p-6 sticky top-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
               <button 
                  onClick={() => setSelectedArtist(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
               </button>
            </div>

            <div className="flex flex-col -mt-[90px]">
              
              {/* Artist Cover Art Section (Hero Style) */}
              <div className="relative w-full pt-[100%] overflow-hidden bg-black">
                <img src={selectedArtist.img} alt={selectedArtist.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <h1 className="text-5xl drop-shadow-md" style={{ fontWeight: 800, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {selectedArtist.name}
                  </h1>
                </div>
              </div>

               {/* Interaction Bar */}
               <div className="flex items-center justify-between px-6 mt-4 mb-6 relative z-20">
                  <div className="flex items-center gap-4">
                    <button 
                      className={`relative w-12 h-12 flex items-center justify-center transition-all rounded-full border hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn ${isShuffleOn ? 'bg-white/[0.15] border-white/[0.25] text-white' : 'bg-white/[0.08] backdrop-blur-xl border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.15]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsShuffleOn(!isShuffleOn);
                        if (artistTracks.length > 0) {
                          const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
                          playTrack(shuffled[0], shuffled);
                          setFullPlayerOpen(true);
                        }
                      }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                      <Shuffle size={18} className="relative z-10" />
                    </button>
                    <button 
                      className="relative w-12 h-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.15] active:scale-95 hover:scale-105 transition-all bg-white/[0.08] backdrop-blur-xl rounded-full border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoreMenuData({
                          title: selectedArtist.name,
                          subtitle: "Artist",
                          img: selectedArtist.img
                        });
                      }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                      <MoreHorizontal size={20} className="relative z-10" />
                    </button>
                  </div>
                  
                  <button 
                    className="relative h-14 px-8 rounded-full flex items-center justify-center gap-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/listen text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (artistTracks.length > 0) {
                        playTrack(artistTracks[0], artistTracks);
                        setFullPlayerOpen(true);
                      }
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/listen:opacity-100 opacity-60 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                    <Play size={20} className="relative z-10 drop-shadow-md text-white group-hover/listen:scale-110 transition-transform" fill="currentColor" />
                    <span className="relative z-10 font-bold tracking-wider text-[13px] drop-shadow-md">PLAY</span>
                  </button>
               </div>

               {/* Tracks List */}
               <div className="px-6 mb-2">
                 <h2 className="text-xl font-bold tracking-tight text-white/90">Popular</h2>
               </div>
               <div className="flex flex-col gap-2 px-4 pb-8">
                 {artistTracks.map((track, idx) => (
                    <div 
                      key={track.id || idx} 
                      className="group flex flex-col p-3 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.05]"
                      onClick={() => {
                        playTrack(track, artistTracks);
                        setFullPlayerOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-white/40 font-bold w-4 text-center">{idx + 1}</span>
                        <img src={track.img} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-black/20" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-white font-semibold text-base truncate transition-colors">{track.title}</div>
                          <div className="text-white/50 text-xs truncate mt-0.5 uppercase tracking-wide">
                             {track.artist}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-white/40 text-xs font-medium tracking-wide">{track.duration}</div>
                          <button 
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.15] active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoreMenuData({
                                title: track.title,
                                subtitle: track.artist,
                                img: track.img
                              });
                            }}
                          >
                            <MoreHorizontal size={18} className="text-white/70" />
                          </button>
                        </div>
                      </div>
                    </div>
                 ))}
               </div>

               {/* Latest Releases — newest albums/EPs/singles by date */}
               {latestReleases.length > 0 && (
                 <>
                   <div className="px-6 mb-4 mt-6">
                     <h2 className="text-xl font-bold tracking-tight text-white/90">Latest Releases</h2>
                   </div>
                   <div className="flex gap-4 overflow-x-auto pb-2 px-6 scrollbar-hide snap-x">
                     {latestReleases.map((release, idx) => (
                       <div
                         key={release.id || idx}
                         className="shrink-0 w-36 snap-start group cursor-pointer"
                         onClick={() => setSelectedAlbum(release)}
                       >
                         <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-md mb-2 transition-transform group-hover:scale-105">
                           <img src={release.img} alt={release.name} className="absolute inset-0 w-full h-full object-cover" />
                         </div>
                         <div className="text-white font-semibold text-sm truncate">{release.name}</div>
                         <div className="text-white/50 text-xs truncate mt-0.5 tracking-wide">{release.year} • {release.type}</div>
                       </div>
                     ))}
                   </div>
                 </>
               )}

               {/* Discography Section */}
               <div className="px-6 mb-4 mt-6 flex items-center justify-between">
                 <h2 className="text-xl font-bold tracking-tight text-white/90">Discography</h2>
                 <button className="text-[11px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors">
                   Latest release
                 </button>
               </div>
               
               <div className="flex flex-col gap-2 px-4 pb-2">
                 {artistAlbums.map((release, idx) => (
                    <div 
                      key={release.id || idx} 
                      className="group flex flex-col p-3 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.05]"
                      onClick={() => {
                        setSelectedAlbum(release);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <img src={release.img} alt={release.name} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-black/20" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-white font-semibold text-base truncate transition-colors">{release.name}</div>
                          <div className="text-white/50 text-xs truncate mt-0.5 tracking-wide">
                             {release.year} • {release.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.15] active:scale-95"
                             onClick={(e) => {
                               e.stopPropagation();
                               setMoreMenuData({
                                 title: release.name,
                                 subtitle: `${release.year} • ${release.type}`,
                                 img: release.img
                               });
                             }}
                           >
                             <MoreHorizontal size={18} className="text-white/70" />
                           </button>
                        </div>
                      </div>
                    </div>
                 ))}
               </div>

               <div className="flex justify-center pb-8 mt-4">
                 <button className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 active:scale-95 transition-all">
                   See discography
                 </button>
               </div>

               {/* Appears On — collabs where this artist is featured (not the lead) */}
               {appearsOn.length > 0 && (
                 <>
                   <div className="px-6 mb-4 mt-2">
                     <h2 className="text-xl font-bold tracking-tight text-white/90">Appears On</h2>
                   </div>
                   <div className="flex flex-col gap-2 px-4 pb-12">
                     {appearsOn.map((track, idx) => (
                       <div
                         key={track.id || idx}
                         className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.05]"
                         onClick={() => {
                           playTrack(track, appearsOn);
                           setFullPlayerOpen(true);
                         }}
                       >
                         <div className="relative w-14 h-14 shrink-0">
                           <img src={track.img} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm bg-black/20" />
                           <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                           </div>
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <div className="text-white font-semibold text-base truncate">{track.title}</div>
                           <div className="text-white/50 text-xs truncate mt-0.5 uppercase tracking-wide">{track.artist}</div>
                         </div>
                         <div className="text-white/40 text-xs font-medium tracking-wide shrink-0">{track.duration}</div>
                       </div>
                     ))}
                   </div>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Album View (For Discography) */}
      <AnimatePresence>
        {selectedAlbum && (
          <motion.div 
            key="album_view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[65] bg-black overflow-y-auto overflow-x-hidden pb-40 scrollbar-hide"
          >
            <div className="flex items-center p-6 sticky top-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
               <button 
                  onClick={() => setSelectedAlbum(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
               </button>
            </div>

            <div className="flex flex-col -mt-[90px]">
              <div className="relative w-full pt-[100%] overflow-hidden bg-black">
                <img src={selectedAlbum.img} alt={selectedAlbum.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <h1 className="text-4xl drop-shadow-md" style={{ fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {selectedAlbum.name}
                  </h1>
                  <p className="text-white/60 text-sm font-medium">{selectedAlbum.type} • {selectedAlbum.year}</p>
                </div>
              </div>

               <div className="flex items-center justify-between px-6 mt-4 mb-6 relative z-20">
                  <div className="flex items-center gap-4">
                    <button 
                      className={`relative w-12 h-12 flex items-center justify-center transition-all rounded-full border hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn ${isShuffleOn ? 'bg-white/[0.15] border-white/[0.25] text-white' : 'bg-white/[0.08] backdrop-blur-xl border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.15]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsShuffleOn(!isShuffleOn);
                        if (albumTracks.length > 0) {
                          const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
                          playTrack(shuffled[0], shuffled);
                          setFullPlayerOpen(true);
                        }
                      }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                      <Shuffle size={18} className="relative z-10" />
                    </button>
                    <button 
                      className="relative w-12 h-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.15] active:scale-95 hover:scale-105 transition-all bg-white/[0.08] backdrop-blur-xl rounded-full border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoreMenuData({
                          title: selectedAlbum.name,
                          subtitle: "Album",
                          img: selectedAlbum.img
                        });
                      }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                      <MoreHorizontal size={20} className="relative z-10" />
                    </button>
                  </div>
                  
                  <button 
                    className="relative h-14 px-8 rounded-full flex items-center justify-center gap-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/listen text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (albumTracks.length > 0) {
                        playTrack(albumTracks[0], albumTracks);
                        setFullPlayerOpen(true);
                      }
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/listen:opacity-100 opacity-60 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                    <Play size={20} className="relative z-10 drop-shadow-md text-white group-hover/listen:scale-110 transition-transform" fill="currentColor" />
                    <span className="relative z-10 font-bold tracking-wider text-[13px] drop-shadow-md">LISTEN NOW</span>
                  </button>
               </div>

               <div className="flex flex-col gap-2 px-4">
                 {loadingAlbum && (
                   <div className="flex flex-col gap-3">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
                     ))}
                   </div>
                 )}
                 {!loadingAlbum && albumTracks.map((track, index) => (
                    <div 
                      key={track.id || index} 
                      className="group flex flex-col p-3 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.05]"
                      onClick={() => {
                        playTrack(track, albumTracks);
                        setFullPlayerOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-white/40 font-bold w-4 text-center">{index + 1}</span>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-white font-semibold text-base truncate transition-colors">{track.title}</div>
                          <div className="text-white/50 text-xs truncate mt-0.5 uppercase tracking-wide">
                             {track.artist}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-white/40 text-xs font-medium tracking-wide">{track.duration}</div>
                          <button 
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.15] active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoreMenuData({
                                title: track.title,
                                subtitle: track.artist,
                                img: track.img
                              });
                            }}
                          >
                            <MoreHorizontal size={18} className="text-white/70" />
                          </button>
                        </div>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet Menu */}
      <AnimatePresence>
        {moreMenuData && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              onClick={() => setMoreMenuData(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 mx-auto max-w-[428px] bg-[#121212] rounded-t-3xl z-[80] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
              <div className="px-6 pb-8 pt-4">
                {/* Drag handle */}
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.08]">
                  <img src={moreMenuData.img} alt="" className="w-14 h-14 rounded-lg object-cover shadow-md" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg leading-tight mb-0.5">{moreMenuData.title}</h3>
                    <p className="text-white/60 text-sm">{moreMenuData.subtitle}</p>
                  </div>
                  <button 
                    onClick={() => setMoreMenuData(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Options */}
                <div className="flex flex-col gap-2">
                  {[
                    { icon: Plus, label: "Add to Library" },
                    { icon: Download, label: "Download" },
                    { icon: Share2, label: "Share" },
                    { icon: User, label: "View Artist" },
                  ].map((option, idx) => (
                    <button 
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.06] transition-colors text-white w-full"
                      onClick={() => setMoreMenuData(null)}
                    >
                      <option.icon size={22} className="text-white/70" />
                      <span className="font-semibold text-base">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
