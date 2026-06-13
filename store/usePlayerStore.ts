import { create } from 'zustand';
import { getApiUrl } from '@/lib/api';

export interface Track {
  title: string;
  artist: string;
  thumbnail?: string | null;
  coverImage?: string | null;
  id?: string;
  url?: string;
  durationText?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isFullPlayerOpen: boolean;
  isMiniPlayerHidden: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  recentlyPlayed: Track[];
  _playLock: boolean;
  
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  playTrack: (track: Track | null, queueContext?: Track[]) => void;
  playNext: () => void;
  playPrev: () => void;
  toggleFullPlayer: () => void;
  setFullPlayerOpen: (isOpen: boolean) => void;
  setMiniPlayerHidden: (isHidden: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[], index?: number) => void;
  seekProgress: number | null;
  seekTo: (value: number | null) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isFullPlayerOpen: false,
  isMiniPlayerHidden: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  queue: [],
  queueIndex: -1,
  recentlyPlayed: [],
  _playLock: false,

  togglePlay: () => {
    const state = get();
    if (state._playLock) return;
    set({ isPlaying: !state.isPlaying, _playLock: true });
    setTimeout(() => set({ _playLock: false }), 400);
  },
  setIsPlaying: (isPlaying) => {
    const state = get();
    if (state._playLock) return;
    set({ isPlaying, _playLock: true });
    setTimeout(() => set({ _playLock: false }), 400);
  },
  
  playTrack: (track, queueContext = []) => {
    if (!track) {
      set({ currentTrack: null, isPlaying: false, progress: 0 });
      return;
    }
    
    // 🔓 Unlock browser audio autoplay policy on first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        const audio = new Audio();
        audio.play().catch(() => {});
      };
      unlockAudio();
    }
    
    let newQueue = get().queue;
    let newIndex = get().queueIndex;
    
    if (queueContext && queueContext.length > 0) {
      newQueue = queueContext;
      newIndex = queueContext.findIndex(t => t.title === track.title && t.artist === track.artist);
      if (newIndex === -1) {
        newQueue = [track, ...queueContext];
        newIndex = 0;
      }
    } else {
      const idx = newQueue.findIndex(t => t.title === track.title && t.artist === track.artist);
      if (idx !== -1) {
        newIndex = idx;
      } else {
        newQueue = [...newQueue, track];
        newIndex = newQueue.length - 1;
      }
    }

    // Update recently played — deduplicated, newest first, max 20
    const prev = get().recentlyPlayed.filter(
      (t) => !(t.title === track.title && t.artist === track.artist)
    );
    const newRecentlyPlayed = [track, ...prev].slice(0, 20);
    
    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      duration: 0,
      isMiniPlayerHidden: false,
      queue: newQueue,
      queueIndex: newIndex,
      recentlyPlayed: newRecentlyPlayed,
    });
  },
  
  playNext: async () => {
    const { queue, queueIndex, currentTrack } = get();
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({
        currentTrack: queue[nextIndex],
        queueIndex: nextIndex,
        isPlaying: true,
        progress: 0,
        duration: 0
      });
    } else if (currentTrack) {
      // Auto-play (Radio) Feature: End of queue reached, fetch a related song
      try {
        const query = encodeURIComponent(currentTrack.artist || currentTrack.title || "music");
        const res = await fetch(getApiUrl(`/api/search?q=${query}`));
        const data = await res.json();
        
        if (data.songs && data.songs.length > 0) {
          // Filter out the current track to avoid immediate repeat
          const candidates = data.songs.filter((s: any) => s.title !== currentTrack.title);
          const nextData = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * Math.min(5, candidates.length))]
            : data.songs[0];
            
          const nextTrack = {
            title: nextData.title,
            artist: nextData.artist,
            thumbnail: nextData.img
          };
          
          const newQueue = [...queue, nextTrack];
          set({
            queue: newQueue,
            queueIndex: newQueue.length - 1,
            currentTrack: nextTrack,
            isPlaying: true,
            progress: 0,
            duration: 0
          });
        } else {
          // Fallback if no related songs found
          set({ isPlaying: false, progress: 0 });
        }
      } catch (err) {
        console.error("Autoplay radio failed:", err);
        set({ isPlaying: false, progress: 0 });
      }
    }
  },
  
  playPrev: () => {
    const { queue, queueIndex } = get();
    if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({
        currentTrack: queue[prevIndex],
        queueIndex: prevIndex,
        isPlaying: true,
        progress: 0,
        duration: 0
      });
    }
  },
  
  toggleFullPlayer: () => set((state) => ({ isFullPlayerOpen: !state.isFullPlayerOpen })),
  setFullPlayerOpen: (isOpen) => set({ isFullPlayerOpen: isOpen }),
  setMiniPlayerHidden: (isHidden) => set({ isMiniPlayerHidden: isHidden }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setQueue: (queue, index = 0) => set({ queue, queueIndex: index }),
  seekProgress: null,
  seekTo: (value) => set({ seekProgress: value }),
}));
