import { useState } from "react";
import { Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

interface Card {
  title: string;
  sub: string;
  img?: string | null;
  artGradient?: string;
  // Optional playback seed (used when the display label differs from what should
  // actually play, e.g. a radio station that plays a specific track).
  playTitle?: string;
  playArtist?: string;
}

interface AlbumScrollProps {
  title: string;
  cards: Card[];
}

export function AlbumScroll({ title, cards }: AlbumScrollProps) {
  const { playTrack } = usePlayerStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight text-white/90">{title}</h2>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-white/50 hover:text-white transition-colors"
        >
          {expanded ? "Show less" : "See all"}
        </button>
      </div>
      <div
        className={
          expanded
            ? "grid grid-cols-2 sm:grid-cols-3 gap-4 px-2"
            : "flex overflow-x-auto gap-4 pb-4 px-2 -mx-2 snap-x scrollbar-hide"
        }
      >
        {cards?.map((card, i) => (
          <div
            key={i}
            className={
              expanded
                ? "flex flex-col gap-2 group cursor-pointer"
                : "flex flex-col gap-2 snap-center shrink-0 min-w-[140px] group cursor-pointer"
            }
            onClick={() =>
              playTrack({
                title: card.playTitle ?? card.title,
                artist: card.playArtist ?? card.sub,
                thumbnail: card.img ?? null,
              })
            }
          >
            <div
              className={
                expanded
                  ? "relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105"
                  : "relative w-[140px] h-[140px] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105"
              }
            >
              {card.img ? (
                <img
                  src={card.img}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: card.artGradient || "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
                />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="relative w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden group/btn text-white">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:opacity-100 opacity-60 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                  <Play size={16} className="ml-0.5 relative z-10 drop-shadow-md" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="px-1 mt-1">
              <h4 className="text-sm font-semibold text-white/90 truncate">{card.title}</h4>
              <p className="text-xs text-white/50 truncate mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
