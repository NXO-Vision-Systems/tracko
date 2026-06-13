"use client";

import { usePlayerStore } from "@/store/usePlayerStore";

export default function BottomPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, progress, duration, setFullPlayerOpen } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div 
      className="absolute bottom-[104px] left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 z-30 shadow-2xl cursor-pointer"
      onClick={() => setFullPlayerOpen(true)}
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white/5 relative shadow-inner">
        {currentTrack.thumbnail ? (
          <img src={currentTrack.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[13px] font-semibold text-white/90 truncate leading-tight">{currentTrack.title}</div>
        <div className="text-[11px] text-white/60 truncate mt-0.5 leading-tight">{currentTrack.artist}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0 pr-1">
        <button className="text-white/70 hover:text-white transition-colors p-2" onClick={(e) => { e.stopPropagation(); playPrev(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button className="relative text-white rounded-full p-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 drop-shadow-md">
               <rect x="6" y="4" width="4" height="16" />
               <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 relative z-10 drop-shadow-md">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button className="text-white/70 hover:text-white transition-colors p-2" onClick={(e) => { e.stopPropagation(); playNext(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden opacity-50">
        <div className="h-full bg-white rounded-full" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
