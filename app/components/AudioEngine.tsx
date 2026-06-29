"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getApiUrl } from "@/lib/api";

export default function AudioEngine() {
  const {
    currentTrack,
    isPlaying,
    volume,
    setProgress,
    setDuration,
    setIsPlaying,
    playNext,
    playTrack,
    seekProgress,
    seekTo,
  } = usePlayerStore();

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  // Sync resolved URL when track changes
  useEffect(() => {
    if (!currentTrack) {
      setResolvedUrl(null);
      return;
    }
    if (currentTrack.url) {
      setResolvedUrl(currentTrack.url);
      return;
    }

    // Unmount old player before resolving new track
    setResolvedUrl(null);

    const resolveTrack = async () => {
      setIsResolving(true);
      try {
        const query = `artist=${encodeURIComponent(currentTrack.artist)}&title=${encodeURIComponent(currentTrack.title)}`;
        const res = await fetch(getApiUrl(`/api/resolve?${query}`));
        const data = await res.json();
        
        if (data.url) {
          setResolvedUrl(data.url);
          playTrack({
            ...currentTrack,
            url: data.url,
          });
        } else {
          console.error("Failed to resolve audio URL");
          setIsPlaying(false);
          playNext();
        }
      } catch (err) {
        console.error("Error resolving track:", err);
      } finally {
        setIsResolving(false);
      }
    };

    resolveTrack();
  }, [currentTrack, playTrack, playNext, setIsPlaying]);

  // Handle Play/Pause sync
  useEffect(() => {
    const audio = playerRef.current;
    if (!audio || !resolvedUrl) return;

    if (isPlaying && !isResolving) {
      audio.play().catch((err) => {
        if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
          console.error("Playback failed:", err);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isResolving, resolvedUrl]);

  // Handle Volume sync
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  // Handle manual Seek from the global store
  useEffect(() => {
    if (seekProgress !== null && playerRef.current) {
      try {
        playerRef.current.currentTime = seekProgress;
      } catch {
        // Seek failed silently — will retry on next interaction
      }
      seekTo(null);
    }
  }, [seekProgress, seekTo]);

  if (!resolvedUrl) return null;

  return (
    <audio
      ref={playerRef}
      src={resolvedUrl}
      onTimeUpdate={(e: SyntheticEvent<HTMLAudioElement>) => {
        setProgress(e.currentTarget.currentTime);
      }}
      onDurationChange={(e: SyntheticEvent<HTMLAudioElement>) => {
        const d = e.currentTarget.duration;
        if (d > 0 && isFinite(d)) setDuration(d);
      }}
      onEnded={() => playNext()}
      onError={(e) => {
        const error = e.currentTarget.error;
        if (!error) return;
        
        const isHarmless =
          error.code === error.MEDIA_ERR_ABORTED;

        if (isHarmless) {
          console.warn("Audio element: playback aborted (harmless).");
          return;
        }

        console.error("Audio element error:", error.message || error.code);
        setIsPlaying(false);
        playNext();
      }}
      preload="auto"
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
}
