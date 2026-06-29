"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import ReactPlayer from "react-player";
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
  const playerRef = useRef<HTMLVideoElement | null>(null);

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

  // Handle manual Seek from the global store.
  // In react-player v3 the ref IS the underlying media element.
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
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <ReactPlayer
        ref={playerRef}
        src={resolvedUrl}
        playing={isPlaying && !isResolving}
        volume={volume}
        config={{
          file: {
            forceAudio: true,
            attributes: {
              preload: "auto",
            },
          },
        }}
        onTimeUpdate={(e: SyntheticEvent<HTMLVideoElement>) => {
          setProgress(e.currentTarget.currentTime);
        }}
        onDurationChange={(e: SyntheticEvent<HTMLVideoElement>) => {
          const d = e.currentTarget.duration;
          if (d > 0 && isFinite(d)) setDuration(d);
        }}
        onEnded={() => playNext()}
        onError={(error: any) => {
          const msg = String(error?.message || error || "");
          const isHarmless =
            error?.name === "AbortError" ||
            error?.name === "NotAllowedError" ||
            msg.includes("AbortError") ||
            msg.includes("interrupted by a call to pause") ||
            msg.includes("user didn't interact") ||
            msg.includes("user gesture") ||
            msg.includes("play()");

          if (isHarmless) {
            console.warn("ReactPlayer: playback blocked/interrupted (harmless).");
            return;
          }

          console.error("ReactPlayer fatal error:", error);
          setIsPlaying(false);
          playNext();
        }}
        width="1px"
        height="1px"
        playsInline
      />
    </div>
  );
}
