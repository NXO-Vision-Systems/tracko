"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Play, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getApiUrl } from "@/lib/api";

interface AlbumModalProps {
  album:
    | {
        title: string;
        subtitle: string;
        img: string;
        albumId?: number | string;
        playlistId?: number | string;
      }
    | null;
  onClose: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Deezer mosaic covers join several 32-char hashes in the image path
// (e.g. /cover/<hash>-<hash>-<hash>-<hash>/1000x1000...). Single covers have one.
function isMosaicCover(url?: string | null) {
  if (!url) return false;
  return /[0-9a-f]{32}(-[0-9a-f]{32})+/i.test(url);
}

// Animated "now playing" equalizer bars (monochrome glass aesthetic)
function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-3.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-white rounded-full drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
          animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function AlbumModal({ album, onClose }: AlbumModalProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [albumInfo, setAlbumInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { playTrack, setFullPlayerOpen } = usePlayerStore();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    if (!album) return;
    setTracks([]);
    setAlbumInfo(null);
    setLoading(true);

    // Deezer blocks direct browser requests (CORS), so all calls go through the
    // app's server-side proxy at /api/deezer.
    const dz = (url: string) =>
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(url)}`)).then((r) => r.json());

    // Playlists load by id from the playlist endpoints; albums are searched by name.
    const load = async () => {
      try {
        if (album.playlistId != null) {
          const [plData, tracksData] = await Promise.all([
            dz(`https://api.deezer.com/playlist/${album.playlistId}`),
            dz(`https://api.deezer.com/playlist/${album.playlistId}/tracks?limit=50`),
          ]);

          const trackList = tracksData.data || [];

          // Deezer stitches 4 album covers into one "mosaic" when a playlist has no
          // custom art (the URL contains several joined hashes). Swap those for the
          // first track's cover so the hero looks like a single clean image.
          let cover = plData.picture_xl || plData.picture_big || album.img;
          if (isMosaicCover(cover)) {
            cover = trackList[0]?.album?.cover_xl || trackList[0]?.album?.cover_big || cover;
          }

          setAlbumInfo({
            title: plData.title || album.title,
            artist: { name: plData.creator?.name || "Playlist" },
            record_type: "playlist",
            release_date: plData.creation_date,
            nb_tracks: plData.nb_tracks,
            cover_xl: cover,
          });
          setTracks(
            trackList.map((t: any) => ({
              id: t.id.toString(),
              title: t.title,
              artist: t.artist?.name || album.subtitle,
              duration: formatDuration(t.duration),
              img: t.album?.cover_xl || t.album?.cover_big || album.img,
              url: null,
            }))
          );
          return;
        }

        // Albums: use the id directly when we have it (precise), otherwise search by name.
        let albumId = album.albumId;
        if (albumId == null) {
          const data = await dz(
            `https://api.deezer.com/search/album?q=${encodeURIComponent(album.subtitle + " " + album.title)}&limit=1`
          );
          albumId = data.data?.[0]?.id;
          if (albumId == null) return;
        }

        // Fetch full album info and its tracklist
        const [albumData, tracksData] = await Promise.all([
          dz(`https://api.deezer.com/album/${albumId}`),
          dz(`https://api.deezer.com/album/${albumId}/tracks?limit=50`),
        ]);

        setAlbumInfo(albumData);
        setTracks(
          (tracksData.data || []).map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            artist: t.artist?.name || album.subtitle,
            duration: formatDuration(t.duration),
            img: albumData.cover_xl || albumData.cover_big || album.img,
            url: null,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [album]);

  const handlePlayTrack = (track: any, index: number) => {
    // Load the entire album as the queue starting from the clicked track
    playTrack(
      { title: track.title, artist: track.artist, thumbnail: track.img, url: undefined },
      tracks.map((t) => ({ title: t.title, artist: t.artist, thumbnail: t.img, url: undefined }))
    );
    setFullPlayerOpen(true);
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    handlePlayTrack(tracks[0], 0);
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(
      { title: shuffled[0].title, artist: shuffled[0].artist, thumbnail: shuffled[0].img, url: undefined },
      shuffled.map((t) => ({ title: t.title, artist: t.artist, thumbnail: t.img, url: undefined }))
    );
    setFullPlayerOpen(true);
  };

  return (
    <AnimatePresence>
      {album && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[60] bg-[#050505] overflow-y-auto scrollbar-hide"
        >
          {/* Square cover hero, anchored to the very top (no gap) with overlaid title */}
          <div className="relative w-full pt-[100%] overflow-hidden bg-black">
            <img
              src={albumInfo?.cover_xl || album.img}
              alt={album.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none" />
            {/* Top scrim keeps the back button readable */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

            {/* Floating back button */}
            <button
              onClick={onClose}
              className="absolute top-12 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1.5">
              <h1
                className="text-4xl drop-shadow-md leading-tight"
                style={{
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {albumInfo?.title || album.title}
              </h1>
              <p className="text-white/60 text-sm font-medium">{albumInfo?.artist?.name || album.subtitle}</p>
              {albumInfo && (
                <p className="text-white/30 text-xs">
                  {albumInfo.record_type?.toUpperCase()} • {albumInfo.release_date?.slice(0, 4)} • {albumInfo.nb_tracks} tracks
                </p>
              )}
            </div>
          </div>

          {/* Album info */}
          <div className="px-4 mt-5 relative z-10 pb-40">
            {/* Play / Shuffle buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handlePlayAll}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-95 transition-all"
              >
                <Play size={16} fill="currentColor" />
                Play
              </button>
              <button
                onClick={handleShuffle}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl text-white font-bold text-sm hover:bg-white/15 active:scale-95 transition-all"
              >
                <Shuffle size={16} />
                Shuffle
              </button>
            </div>

            {/* Loading shimmer */}
            {loading && (
              <div className="flex flex-col gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            )}

            {/* Tracks — matches the Featured album view (thumbnail + bold title + uppercase artist) */}
            {!loading && (
              <div className="flex flex-col gap-2">
                {tracks.map((track, index) => {
                  const isActive =
                    currentTrack?.title === track.title &&
                    currentTrack?.artist === track.artist;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(track, index)}
                      className={`group relative flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer border overflow-hidden ${
                        isActive
                          ? "bg-white/[0.08] backdrop-blur-xl border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                          : "hover:bg-white/[0.04] border-transparent hover:border-white/[0.05]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                      )}
                      <div className="relative w-12 h-12 shrink-0">
                        <img src={track.img} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-black/20" />
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            {isPlaying ? (
                              <Equalizer />
                            ) : (
                              <Play size={16} className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" fill="currentColor" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className={`font-semibold text-base truncate ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]" : "text-white"}`}>
                          {track.title}
                        </div>
                        <div className="text-white/50 text-xs truncate mt-0.5 uppercase tracking-wide">{track.artist}</div>
                      </div>
                      <span className={`text-xs shrink-0 tabular-nums relative z-10 font-medium tracking-wide ${isActive ? "text-white/70" : "text-white/40"}`}>
                        {track.duration}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && tracks.length === 0 && (
              <p className="text-white/30 text-center py-10 text-sm">No tracks found for this album.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
