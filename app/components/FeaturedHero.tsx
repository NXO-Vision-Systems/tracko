"use client";

import { useState, useEffect } from "react";
import { Play, ChevronLeft, Shuffle, MoreHorizontal, Plus, Download, Share2, User, X } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/api";

// Animated "now playing" equalizer bars (monochrome glass aesthetic)
function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-white rounded-full drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]"
          animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function FeaturedHero({ cards, onAlbumOpen }: { cards: any[], onAlbumOpen?: (card: any) => void }) {
  const { playTrack, setFullPlayerOpen } = usePlayerStore();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [greeting, setGreeting] = useState("Today");
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [moreMenuData, setMoreMenuData] = useState<{ title: string, subtitle: string, img: string } | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Avoid synchronous setState warning by pushing to next tick
    const timer = setTimeout(() => {
      const currentHour = new Date().getHours();
      setGreeting(
        currentHour < 12 ? "Good morning, Jonathan" :
        currentHour < 18 ? "Good afternoon, Jonathan" :
        "Good evening, Jonathan"
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!selectedPlaylist) return;
    setTracks([]);
    setLoading(true);

    fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/search/album?q=${selectedPlaylist.subtitle + " " + selectedPlaylist.title}&limit=1`)}`))
      .then((r) => r.json())
      .then(async (data) => {
        const found = data.data?.[0];
        if (!found) return;
        const tracksRes = await fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(`https://api.deezer.com/album/${found.id}/tracks?limit=50`)}`));
        const tracksData = await tracksRes.json();

        setTracks(
          (tracksData.data || []).map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            artist: t.artist?.name || selectedPlaylist.subtitle,
            duration: Math.floor(t.duration / 60) + ":" + (t.duration % 60).toString().padStart(2, "0"),
            img: selectedPlaylist.img,
            url: undefined,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedPlaylist]);

  const handlePlayTrack = (track: any, index: number) => {
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
    setIsShuffleOn(true);
    setFullPlayerOpen(true);
  };

  return (
    <div className="mt-4 mb-6">
      <div className="flex flex-col px-2 mb-4">
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{greeting}</h2>
        <h3 className="text-[13px] font-semibold text-white/60">Playlists</h3>
      </div>
      
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {cards.map(card => (
          <div 
            key={card.id || card.title} 
            className="relative w-[240px] h-[280px] shrink-0 snap-center rounded-[28px] overflow-hidden border border-white/[0.12] bg-[#050505]/50 flex flex-col group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] shadow-black/50"
            onClick={() => (onAlbumOpen ? onAlbumOpen(card) : setSelectedPlaylist(card))}
          >
            {/* Top Image Section */}
            <div className="relative flex-1 w-full overflow-hidden bg-black/20">
              <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              {/* Overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/90 via-transparent to-transparent" />
              
              {/* Text inside the image */}
              <h3 className="absolute bottom-4 left-5 text-base font-semibold text-white drop-shadow-md">
                {card.title}
              </h3>
            </div>
            
            {/* Bottom Glass Panel (EXACT TAB BAR VIBE) */}
            <div className="relative h-[85px] w-full bg-black/50 backdrop-blur-3xl border-t border-white/[0.12] flex flex-col justify-center px-5 shrink-0 overflow-hidden">
              {/* TabBar internal gradients */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
              
              <h4 className="text-[13px] font-medium text-white/80 relative z-10 truncate">{card.subtitle}</h4>
              <p className="text-[10px] font-medium tracking-wide text-white/50 uppercase mt-0.5 relative z-10 truncate">{card.desc}</p>
            </div>

            {/* Floating Play Button (Hexagon) */}
            <div 
              className="absolute right-5 bottom-[63px] w-[42px] h-[42px] z-20 group-hover:scale-110 active:scale-95 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              onClick={(e) => {
                e.stopPropagation();
                // When clicking play on the card directly, we just open the full player and search for it.
                playTrack({ title: card.title, artist: card.subtitle, thumbnail: card.img });
                setFullPlayerOpen(true);
              }}
            >
              {/* Frosted glass fill + sheen, clipped to the hexagon */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-3xl overflow-hidden"
                style={{ clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
              </div>
              {/* Crisp, uniform-width border (SVG stroke avoids the white spikes at the corners) */}
              <svg
                viewBox="0 0 42 42"
                className="absolute inset-0 w-full h-full pointer-events-none"
                fill="none"
                aria-hidden="true"
              >
                <polygon
                  points="21,0.8 39.2,10.9 39.2,31.1 21,41.2 2.8,31.1 2.8,10.9"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Centered play icon (tiny optical nudge so the triangle reads centered) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Play
                  size={18}
                  fill="currentColor"
                  className="translate-x-[1px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedPlaylist && (
          <motion.div 
            key="playlist_view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[60] bg-black overflow-y-auto overflow-x-hidden pb-40 scrollbar-hide"
          >
            {/* Header / Nav */}
            <div className="flex items-center p-6 sticky top-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm">
               <button 
                  onClick={() => setSelectedPlaylist(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
               </button>
            </div>

            <div className="flex flex-col -mt-[90px]">
              
              {/* Playlist Cover Art Section (Hero Style) */}
              <div className="relative w-full pt-[100%] overflow-hidden bg-black">
                <img src={selectedPlaylist.img} alt={selectedPlaylist.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <h1 className="text-4xl drop-shadow-md" style={{ fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {selectedPlaylist.title}
                  </h1>
                  <p className="text-white/60 text-sm font-medium">{selectedPlaylist.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src="/logo.png" alt="noxofy logo" className="h-4 w-auto object-contain opacity-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                    <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Noxofy Mix</span>
                  </div>
                </div>
              </div>

               {/* Interaction Bar */}
               <div className="flex items-center justify-between px-6 mt-4 mb-6 relative z-20">
                  <div className="flex items-center gap-4">
                    <button 
                      className={`relative w-12 h-12 flex items-center justify-center transition-all rounded-full border hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn ${isShuffleOn ? 'bg-white/[0.15] border-white/[0.25] text-white' : 'bg-white/[0.08] backdrop-blur-xl border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.15]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShuffle();
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
                          title: selectedPlaylist.title,
                          subtitle: "Noxofy Mix",
                          img: selectedPlaylist.img
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
                      handlePlayAll();
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/listen:opacity-100 opacity-60 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                    <Play size={20} className="relative z-10 drop-shadow-md text-white group-hover/listen:scale-110 transition-transform" fill="currentColor" />
                    <span className="relative z-10 font-bold tracking-wider text-[13px] drop-shadow-md">LISTEN NOW</span>
                  </button>
               </div>

               {/* Tracks List */}
               <div className="flex flex-col gap-2 px-4">
                 {loading && (
                   <div className="flex flex-col gap-3">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
                     ))}
                   </div>
                 )}
                 {!loading && tracks.map((track, index) => {
                    const isActive =
                      currentTrack?.title === track.title &&
                      currentTrack?.artist === track.artist;
                    return (
                    <div
                      key={track.id || index}
                      className={`group relative flex flex-col p-3 rounded-2xl transition-all cursor-pointer border overflow-hidden ${
                        isActive
                          ? "bg-white/[0.08] backdrop-blur-xl border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                          : "hover:bg-white/[0.04] border-transparent hover:border-white/[0.05]"
                      }`}
                      onClick={() => handlePlayTrack(track, index)}
                    >
                      {isActive && (
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
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
                        <div className="flex-1 overflow-hidden">
                          <div className={`font-semibold text-base truncate transition-colors ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]" : "text-white"}`}>{track.title}</div>
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
                    );
                 })}
               </div>
            </div>

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
                          <h3 className="text-white font-bold text-lg">{moreMenuData.title}</h3>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
