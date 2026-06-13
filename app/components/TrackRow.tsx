import { MoreHorizontal, Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function TrackRow({ tracks }: { tracks: any[] }) {
  const { playTrack } = usePlayerStore();

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight text-white/90">Trending Tracks</h2>
      </div>
      <div className="flex flex-col gap-3">
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="flex items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            onClick={() => playTrack({ title: track.title, artist: track.artist, thumbnail: track.img })}
          >
            <div className="w-12 h-12 rounded-xl flex shrink-0 items-center justify-center relative overflow-hidden mr-4 bg-white/10">
              {track.img && <img src={track.img} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />}
              <Play size={16} className="text-white/70 group-hover:text-white relative z-10 drop-shadow-md" fill="currentColor" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-[15px] font-semibold text-white/90 truncate group-hover:text-white">{track.title}</h4>
              <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
            </div>

            <div className="flex items-center gap-4 text-white/40">
              <span className="text-xs font-medium tabular-nums">{track.duration}</span>
              <button className="hover:text-white transition-colors p-1">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
