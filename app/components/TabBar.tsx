"use client";

import { Home, Compass, ListMusic, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

interface TabBarProps {
  active: string;
  onChange: (tab: string) => void;
}

export default function TabBar({ active, onChange }: TabBarProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Long-press on the mini player opens a "close" menu
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressed = useRef(false);

  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, progress, duration, playTrack, setFullPlayerOpen, isMiniPlayerHidden, setMiniPlayerHidden } = usePlayerStore();

  const showPlayer = currentTrack && !isMiniPlayerHidden;

  const startLongPress = () => {
    longPressed.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setShowMenu(true);
    }, 450);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  const closePlayer = () => {
    setShowMenu(false);
    setFullPlayerOpen(false);
    playTrack(null); // stops playback and removes the mini player
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1200);
    };

    const scrollElements = document.querySelectorAll('.scroll-content');
    scrollElements.forEach(el => el.addEventListener('scroll', handleScroll, { passive: true }));

    return () => {
      scrollElements.forEach(el => el.removeEventListener('scroll', handleScroll));
    };
  }, [active]);

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Compass, label: 'Search' },
    { id: 'library', icon: ListMusic, label: 'Library' }
  ];

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
    <AnimatePresence mode="wait">
      <motion.nav
        layout
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={cancelLongPress}
        onDragEnd={(e, info) => {
          if (showPlayer && info.offset.y > 40) {
            setMiniPlayerHidden(true);
          } else if (!showPlayer && currentTrack && info.offset.y < -40) {
            setMiniPlayerHidden(false);
          }
        }}
        key="dynamic-bar"
        initial={{ maxWidth: 340 }}
        animate={{ 
          width: showPlayer ? "92%" : (isScrolling ? 260 : "90%"),
          maxWidth: showPlayer ? 400 : 340,
          borderRadius: showPlayer ? 24 : 9999,
          height: showPlayer ? 76 : 68
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[75] bg-black/50 backdrop-blur-3xl border border-white/[0.12] flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] shadow-black/50 overflow-hidden ${showPlayer ? 'px-3' : 'px-4'}`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        
        {showPlayer ? (
          <motion.div 
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center w-full gap-3 py-2 cursor-pointer"
            onPointerDown={startLongPress}
            onPointerUp={cancelLongPress}
            onPointerCancel={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onClick={() => {
              if (longPressed.current) {
                longPressed.current = false;
                return; // suppress the click that ends a long press
              }
              setFullPlayerOpen(true);
            }}
          >
            <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 bg-white/5 relative shadow-inner">
              {currentTrack.thumbnail ? (
                <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-[14px] font-bold text-white tracking-tight truncate leading-tight">{currentTrack.title}</div>
              <div className="text-[12px] font-medium text-white/60 truncate mt-0.5 leading-tight">{currentTrack.artist}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0 pr-1">
              <button className="text-white/70 hover:text-white transition-colors p-2" onClick={(e) => { e.stopPropagation(); playPrev(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <button 
                className="relative text-white rounded-full w-10 h-10 flex items-center justify-center bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn" 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 drop-shadow-md">
                     <rect x="6" y="4" width="4" height="16" />
                     <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1 relative z-10 drop-shadow-md">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <button className="text-white/70 hover:text-white transition-colors p-2" onClick={(e) => { e.stopPropagation(); playNext(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden opacity-40">
              <div className="h-full bg-white rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center h-full w-full"
            style={{ justifyContent: isScrolling ? 'center' : 'space-between', gap: isScrolling ? '8px' : '0' }}
          >
            {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            
            return (
              <motion.button 
                layout
                key={tab.id}
                onClick={() => onChange(tab.id)} 
                className={`relative flex items-center justify-center h-12 rounded-full transition-colors duration-300 z-10 ${isActive ? 'text-white w-[110px]' : 'text-white/40 hover:text-white/60 w-12'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white/20 rounded-full -z-10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)] backdrop-blur-md"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <div className="flex items-center justify-center gap-[6px] overflow-hidden pointer-events-none">
                  <motion.div
                    animate={isActive ? { y: [0, -6, 0, -3, 0] } : { y: 0 }}
                    transition={{ duration: 0.6, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" }}
                    className="shrink-0"
                  >
                    <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                  </motion.div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, display: "none" }}
                        animate={{ opacity: 1, width: "auto", display: "block" }}
                        exit={{ opacity: 0, width: 0, display: "none" }}
                        transition={{ duration: 0.2 }}
                        className="text-[13px] font-semibold tracking-wide whitespace-nowrap"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
          </motion.div>
        )}
      </motion.nav>
    </AnimatePresence>

      {/* Long-press menu — matches the nav bar glass styling */}
      <AnimatePresence>
        {showMenu && showPlayer && (
          <>
            {/* tap-outside to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[78]"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-[108px] left-1/2 -translate-x-1/2 z-[80] bg-black/50 backdrop-blur-3xl border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] shadow-black/50 overflow-hidden p-1.5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
              <button
                onClick={closePlayer}
                className="relative z-10 flex items-center gap-3 pl-2 pr-5 py-2 rounded-xl text-white/90 hover:bg-white/[0.08] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <X size={16} />
                </span>
                <span className="text-[14px] font-semibold tracking-tight">Close player</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
