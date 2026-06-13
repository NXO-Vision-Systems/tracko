import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, MoreHorizontal, Volume2, MonitorSpeaker, Mic2, Share2, Heart, Plus, User } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAppStore } from "@/store/useAppStore";
import { getApiUrl } from "@/lib/api";

export default function FullPlayer() {
  const { currentTrack, isPlaying, isFullPlayerOpen, setFullPlayerOpen, togglePlay, playNext, playPrev, progress, duration, setProgress, seekTo, volume, setVolume } = usePlayerStore();
  const { setActiveTab, setTargetArtist, setTargetArtistId } = useAppStore();
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<unknown>(null);

  // States for interactive controls
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [isMicActive, setIsMicActive] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Full artist credit including featured artists (Deezer only exposes these on
  // the full /track/{id} endpoint, so we enrich the now-playing track here).
  const [credit, setCredit] = useState<string | null>(null);

  useEffect(() => {
    setCredit(null);
    if (!currentTrack?.title || !currentTrack?.artist) return;
    let cancelled = false;

    const dz = (url: string) =>
      fetch(getApiUrl(`/api/deezer?url=${encodeURIComponent(url)}`)).then((r) => r.json());

    (async () => {
      try {
        const found = await dz(
          `https://api.deezer.com/search/track?q=${encodeURIComponent(
            currentTrack.artist + " " + currentTrack.title
          )}&limit=1`
        );
        const id = found.data?.[0]?.id;
        if (id == null) return;

        const full = await dz(`https://api.deezer.com/track/${id}`);
        const names: string[] = (full.contributors || [])
          .map((c: any) => c.name)
          .filter(Boolean);
        if (cancelled || names.length < 2) return; // only enrich when there's a feature

        // "A, B & C"
        const credit =
          names.length === 2
            ? `${names[0]} & ${names[1]}`
            : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
        setCredit(credit);
      } catch {
        /* keep the plain artist on any failure */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.title, currentTrack?.artist]);

  const handleViewArtist = async () => {
    if (!currentTrack?.artist) return;
    setActiveTab("search");
    setFullPlayerOpen(false);
    setShowOptions(false);

    // Resolve the EXACT artist id from the playing track so same-named artists
    // (e.g. two "LiL Noonie") don't get mixed up. Fall back to a name search.
    try {
      const found = await fetch(
        getApiUrl(`/api/deezer?url=${encodeURIComponent(
          `https://api.deezer.com/search/track?q=${encodeURIComponent(
            currentTrack.artist + " " + currentTrack.title
          )}&limit=1`
        )}`)
      ).then((r) => r.json());
      const artistId = found.data?.[0]?.artist?.id;
      if (artistId != null) {
        setTargetArtistId(artistId);
        return;
      }
    } catch {
      /* fall through to name-based lookup */
    }
    setTargetArtist(currentTrack.artist);
  };

  const lyricsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isFullPlayerOpen) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev + 0.1) % 40); // loop every 40s
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFullPlayerOpen]);

  const MOCK_LYRICS = [
    { time: 0, text: "Wait for it..." },
    { time: 3, text: "I've been thinking about you" },
    { time: 6, text: "Every night and every day" },
    { time: 9, text: "Trying to find the words to say" },
    { time: 13, text: "But the words just slip away" },
    { time: 18, text: "Oh, it's driving me crazy" },
    { time: 24, text: "How you occupy my mind" },
    { time: 30, text: "Like a melody I can't unwind" },
  ];

  const activeLyricIndex = MOCK_LYRICS.findIndex((lyric, i) => {
    const nextLyric = MOCK_LYRICS[i + 1];
    return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
  });

  const [lyricY, setLyricY] = useState(0);

  useEffect(() => {
    if (isMicActive && lyricsScrollRef.current) {
      const activeEl = lyricsScrollRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        const targetY = -(activeEl.offsetTop + activeEl.offsetHeight / 2);
        setLyricY(targetY);
      }
    }
  }, [activeLyricIndex, isMicActive]);

  useEffect(() => {
    const styleId = "shader-canvas-style-fullplayer";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-fullplayer canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: inherit !important;
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");

        if (shaderRef.current && !shaderMount.current) {
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 0,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6
          );
        }
      } catch (error) {
        console.error("[FullPlayer] Failed to load shader:", error);
      }
    };

    if (isFullPlayerOpen) {
      loadShader();
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mount = shaderMount.current as any;
      if (mount?.destroy) {
        mount.destroy();
        shaderMount.current = null;
      }
    };
  }, [isFullPlayerOpen]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mount = shaderMount.current as any;
    if (mount?.setSpeed) {
      mount.setSpeed(isPlaying ? 1.2 : 0.4);
    }
  }, [isPlaying]);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isFullPlayerOpen && currentTrack && (
        <motion.div
          initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 250, damping: 35 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100) {
              setFullPlayerOpen(false);
            }
          }}
          className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[100] bg-[#050505] flex flex-col overflow-hidden"
        >
          {/* Immersive Background */}
          {currentTrack.thumbnail && (
            <>
              {/* Massive colored blurred blobs - Fixed to be super visible */}
              <motion.div 
                animate={{ 
                  scale: isPlaying ? [1.2, 1.3, 1.25, 1.2] : 1.2,
                  rotate: isPlaying ? [0, 5, -3, 0] : 0,
                  opacity: isPlaying ? 0.8 : 0.3
                }}
                transition={{ 
                  scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.8, ease: "easeInOut" }
                }}
                className="absolute -inset-20 pointer-events-none"
                style={{
                  backgroundImage: `url('${currentTrack.thumbnail}')`,
                  backgroundSize: '150%',
                  backgroundPosition: 'center',
                  filter: 'blur(90px) saturate(2.5) brightness(0.8)'
                }}
              />
              {/* Noise overlay for texture */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
              {/* Vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.95)_100%)] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
            </>
          )}

          {/* Top Bar */}
          <div 
            className="relative z-20 flex items-center justify-between px-6 safe-pt pb-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setFullPlayerOpen(false)}
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.05] text-white hover:bg-white/[0.1] transition-all backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-90"
            >
              <ChevronDown size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-1">
                Now Playing
              </span>
              <div className="h-1 w-8 rounded-full bg-white/20">
                 <motion.div 
                   layoutId="nowPlayingPill"
                   className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                   style={{ width: `${progressPercent}%` }}
                 />
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowOptions(true); }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.05] text-white hover:bg-white/[0.1] transition-all backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-90"
            >
              <MoreHorizontal size={24} />
            </button>
          </div>

          {/* Main Content Area (Artwork or Lyrics) */}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center w-full" style={{ perspective: 1200 }}>
            <AnimatePresence mode="wait">
              {!isMicActive ? (
                <motion.div 
                  key="artwork"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex-1 flex flex-col justify-center items-center px-8 min-h-0 py-4"
                >
                  {/* Liquid Glass Artwork Container */}
                  <div className="w-full max-w-[min(340px,42vh)] aspect-square rounded-[2.5rem] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,1)] relative group mb-6 shrink-0">
                    {/* Glowing Fallback Gradient (visible if shader fails or is dark) */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/20 via-white/5 to-white/10 opacity-60 mix-blend-overlay" />
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent opacity-30" />
                    
                    {/* Liquid Metal Shader Background */}
                    <div
                      ref={shaderRef}
                      className="shader-container-fullplayer"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "2.5rem",
                        overflow: "hidden",
                        opacity: 0.85,
                        zIndex: 0,
                        background: "linear-gradient(135deg, rgba(40,40,40,0.8) 0%, rgba(10,10,10,0.9) 100%)",
                        boxShadow: "inset 0 2px 10px rgba(255,255,255,0.15)"
                      }}
                    />
                    
                    {/* Inner dark overlay for depth */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "2.5rem",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.6) 100%)",
                        pointerEvents: "none",
                        zIndex: 1,
                        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), inset 0 0 20px rgba(0,0,0,0.8)"
                      }}
                    />

                    <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.5)] z-10 bg-black">
                      {currentTrack.thumbnail ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={currentTrack.thumbnail} 
                            alt={currentTrack.title} 
                            className="w-full h-full object-cover transition-transform duration-[20s] ease-linear"
                            style={{ transform: isPlaying ? 'scale(1.05)' : 'scale(1)' }}
                          />
                          {/* Glass Reflection on Artwork */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5" />
                      )}
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex flex-col items-center text-center">
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-2 tracking-tighter drop-shadow-lg leading-tight"
                    >
                      {currentTrack.title}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-white/50 font-medium tracking-wide drop-shadow-md">
                      {credit || currentTrack.artist}
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="lyrics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 overflow-hidden"
                  style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
                >
                  <motion.div 
                    ref={lyricsScrollRef}
                    className="absolute top-1/2 left-0 w-full flex flex-col items-center gap-10 px-6"
                    animate={{ y: lyricY }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1 }}
                  >
                    {MOCK_LYRICS.map((lyric, idx) => {
                      const isActive = idx === activeLyricIndex;
                      const isPast = idx < activeLyricIndex;
                      return (
                        <motion.div 
                          key={idx}
                          animate={{ 
                            scale: isActive ? 1.1 : 0.95, 
                            opacity: isActive ? 1 : (isPast ? 0.3 : 0.4),
                          }}
                          className={`w-full text-center transition-all duration-700 ease-out`}
                        >
                          <h2 
                            className={`font-black tracking-tight leading-normal transition-all duration-700 ${
                              isActive 
                                ? 'text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)] pb-2' 
                                : 'text-3xl text-white/40 blur-[1px]'
                            }`}
                          >
                            {lyric.text}
                          </h2>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Liquid Controls */}
          <div 
            className="relative z-20 flex flex-col safe-pb w-full max-w-[400px] mx-auto px-6 mt-2 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Smooth Glowing Liquid Progress Bar */}
            <div className="w-full flex flex-col items-center gap-1 mb-8 group">
              <div className="w-full relative h-8 flex items-center cursor-pointer">
                {/* Track Background */}
                <div className="absolute left-0 right-0 h-2.5 rounded-full bg-black/50 border border-white/5 shadow-inner overflow-hidden backdrop-blur-xl pointer-events-none">
                   {/* Liquid Glowing Fill */}
                   <motion.div 
                     className="absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none" 
                     style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,1) 100%)' }} 
                   >
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_rgba(255,255,255,1)]" />
                   </motion.div>
                </div>
                
                {/* Thumb/Dot for clear scrubbing feel */}
                <motion.div
                  className="absolute h-[14px] w-[14px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none transition-transform scale-100 group-active:scale-125 z-20"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />

                {/* Range Input for Smooth Sliding */}
                <input 
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProgress(val);
                    seekTo(val);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-30"
                />
              </div>
              <div className="w-full flex justify-between text-xs font-medium text-white/50 tracking-wider px-1 mt-0">
                <span>{formatTime(Math.floor(progress))}</span>
                <span>{formatTime(Math.floor(duration))}</span>
              </div>
            </div>

            {/* Glassmorphic Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 w-full mb-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsShuffle(!isShuffle); }}
                className={`transition-all p-3 hover:bg-white/[0.05] rounded-full active:scale-90 ${isShuffle ? 'text-white bg-white/[0.1] shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-white/30 hover:text-white'}`}
              >
                <Shuffle size={22} />
              </button>
              
              <button className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden" onClick={playPrev}>
                <SkipBack fill="currentColor" size={24} className="relative z-10" />
              </button>
              
              <button 
                className="relative flex items-center justify-center w-[72px] h-[72px] rounded-full bg-white/[0.08] backdrop-blur-3xl border border-white/[0.15] text-white hover:bg-white/[0.2] hover:scale-105 active:scale-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] overflow-hidden"
                onClick={togglePlay}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.1] to-transparent pointer-events-none" />
                {isPlaying ? (
                  <Pause fill="currentColor" size={32} className="relative z-10 drop-shadow-[0_2px_15px_rgba(255,255,255,0.5)]" />
                ) : (
                  <Play fill="currentColor" size={32} className="ml-1 relative z-10 drop-shadow-[0_2px_15px_rgba(255,255,255,0.5)]" />
                )}
              </button>
              
              <button className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden" onClick={playNext}>
                <SkipForward fill="currentColor" size={24} className="relative z-10" />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setRepeatMode((prev) => (prev + 1) % 3); }}
                className={`transition-all p-3 hover:bg-white/[0.05] rounded-full active:scale-90 ${repeatMode > 0 ? 'text-white bg-white/[0.1] shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-white/30 hover:text-white'}`}
              >
                <div className="relative">
                  <Repeat size={22} />
                  {repeatMode === 2 && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-black text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full leading-none">
                      1
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between w-full px-2 text-white/40">
              <button className="hover:text-white transition-colors active:scale-95">
                <MonitorSpeaker size={20} />
              </button>
              
              {/* Volume Slider */}
              <div 
                className="flex items-center gap-3 flex-1 max-w-[160px] group relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (volume > 0) setVolume(0);
                    else setVolume(0.8);
                  }} 
                  className="hover:text-white transition-colors active:scale-95 shrink-0 relative z-20"
                >
                  <Volume2 size={16} className={volume > 0 ? "text-white/80" : "text-white/40"} />
                </button>
                <div className="flex-1 relative h-6 flex items-center shrink-0">
                  <div className="absolute left-0 right-0 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl pointer-events-none">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-white/50 group-hover:bg-white transition-colors rounded-full pointer-events-none" 
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMicActive(!isMicActive); }}
                  className={`transition-colors active:scale-95 ${isMicActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'hover:text-white'}`}
                >
                  <Mic2 size={20} />
                </button>
                <button className="hover:text-white transition-colors active:scale-95">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Menu (More Options) */}
          <AnimatePresence>
            {showOptions && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute bottom-0 inset-x-0 z-[70] bg-[#111] rounded-t-3xl border-t border-white/10 p-6 pb-12 flex flex-col gap-4 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
                  style={{ touchAction: "none" }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.y > 50) setShowOptions(false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
                  
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      {currentTrack.thumbnail ? (
                        <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg leading-tight">{currentTrack.title}</div>
                      <div className="text-white/60 text-sm mt-0.5">{credit || currentTrack.artist}</div>
                    </div>
                  </div>

                  <button className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors active:scale-[0.98]">
                    <Heart size={20} />
                    <span className="font-medium text-base">Like</span>
                  </button>
                  <button className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors active:scale-[0.98]">
                    <Plus size={20} />
                    <span className="font-medium text-base">Add to Playlist</span>
                  </button>
                  <button className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors active:scale-[0.98]">
                    <Share2 size={20} />
                    <span className="font-medium text-base">Share</span>
                  </button>
                  <button 
                    className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors active:scale-[0.98]"
                    onClick={handleViewArtist}
                  >
                    <User size={20} />
                    <span className="font-medium text-base">View Artist</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
