"use client";

import { useState, useEffect, useRef } from "react";
import FeaturedHero from "./components/FeaturedHero";
import TrackRow from "./components/TrackRow";
import { AlbumScroll } from "./components/AlbumCard";
import QuickPlayGrid from "./components/QuickPlayGrid";
import GooeyToggle from "./components/GooeyToggle";
import TabBar from "./components/TabBar";
import SearchPage from "./components/SearchPage";
import LibraryPage from "./components/LibraryPage";
import FullPlayer from "./components/FullPlayer";
import BottomPlayer from "./components/BottomPlayer";
import NotificationsPanel from "./components/NotificationsPanel";
import AudioEngine from "./components/AudioEngine";
import AccountPage from "./components/AccountPage";
import AlbumModal from "./components/AlbumModal";
import SplashScreen from "./components/SplashScreen";
import GreetingIntro from "./components/GreetingIntro";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAppStore } from "@/store/useAppStore";
import { getApiUrl } from "@/lib/api";

const FALLBACK_MADE_FOR_YOU = [
  { title: "Blinding Lights", sub: "The Weeknd" },
  { title: "Snooze", sub: "SZA" },
  { title: "Pink + White", sub: "Frank Ocean" },
  { title: "Instant Crush", sub: "Daft Punk" },
  { title: "everything i wanted", sub: "Billie Eilish" },
  { title: "Money Trees", sub: "Kendrick Lamar" },
];

// Staggered reveal so the header/greeting lands first, then each section cascades in
const REVEAL_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};
const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Home() {
  const { activeTab, setActiveTab } = useAppStore();
  const openItem = useAppStore((s) => s.openItem);
  const setOpenItem = useAppStore((s) => s.setOpenItem);
  const [activeSection, setActiveSection] = useState("for-you");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [madeForYou, setMadeForYou] = useState<any[]>(FALLBACK_MADE_FOR_YOU);
  const [featured, setFeatured] = useState<any[]>([]);
  const [quickPlay, setQuickPlay] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [radio, setRadio] = useState<any[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const homeRevealed = useRef(false);

  // Real play history from the global store (client-only)
  const storeRecentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
  const recentlyPlayed = hasMounted
    ? storeRecentlyPlayed.map((t) => ({
      title: t.title,
      sub: t.artist,
      img: t.thumbnail ?? null,
    }))
    : [];

  useEffect(() => {
    setHasMounted(true);
    // Strictly detect VS Code iPhone Simulator environment and tag HTML tag
    if (typeof window !== "undefined" && window.self !== window.top) {
      document.documentElement.classList.add("in-simulator");
    }
    // Keep the splash up until data is ready AND a minimum time has passed
    // (so the logo doesn't just flash on fast loads).
    const startedAt = Date.now();
    const finish = () => {
      const elapsed = Date.now() - startedAt;
      setTimeout(() => setAppReady(true), Math.max(0, 1100 - elapsed));
    };
    fetch(getApiUrl("/api/homepage"))
      .then((r) => r.json())
      .then((data) => {
        if (data.madeForYou) setMadeForYou(data.madeForYou);
        if (data.featured) setFeatured(data.featured);
        if (data.quickPlay) setQuickPlay(data.quickPlay);
        if (data.trending) setTrending(data.trending);
        if (data.newReleases) setNewReleases(data.newReleases);
        if (data.radio) setRadio(data.radio);
      })
      .catch(() => { })
      .finally(finish);
  }, []);

  return (
    <div className="phone-shell relative">
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <AccountPage isOpen={showAccount} onClose={() => setShowAccount(false)} />
      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "home" && introDone && (
        <motion.div
          className="scroll-content"
          initial={homeRevealed.current ? false : "hidden"}
          animate="show"
          variants={REVEAL_CONTAINER}
          onAnimationComplete={() => { homeRevealed.current = true; }}
        >
          {/* Header */}
          <motion.header variants={REVEAL_ITEM} className="app-header">
            <div className="app-logo flex items-center gap-2.5">
              <img src="/logo.png" alt="noxofy logo" className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              <div className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
                <span className="text-[9px] font-black tracking-[0.3em] ml-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase">
                  PRO
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-btn" onClick={() => setShowNotifications(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full border border-black"></div>
              </button>
              <button className="header-btn" onClick={() => setShowAccount(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </div>
          </motion.header>

          {/* Featured Hero */}
          {featured.length > 0 && (
            <motion.div variants={REVEAL_ITEM}>
              <FeaturedHero cards={featured} onAlbumOpen={(card) => setOpenItem(card)} />
            </motion.div>
          )}

          {/* Quick Play */}
          {quickPlay.length > 0 && (
            <motion.div variants={REVEAL_ITEM}>
              <QuickPlayGrid
                items={quickPlay}
                onOpen={(item) =>
                  setOpenItem({
                    title: item.title,
                    subtitle: "Playlist",
                    img: item.img,
                    playlistId: item.playlistId,
                  })
                }
              />
            </motion.div>
          )}

          {/* Section Toggle */}
          <motion.div variants={REVEAL_ITEM} className="section" style={{ paddingTop: 20 }}>
            <div className="section-header">
              <h2 className="section-title">Discover</h2>
            </div>
            <GooeyToggle
              segments={[
                { label: "For You", value: "for-you" },
                { label: "New", value: "new" },
                { label: "Radio", value: "radio" },
              ]}
              value={activeSection}
              onChange={setActiveSection}
            />
          </motion.div>

          {/* For You — personalized picks + history + trending */}
          {activeSection === "for-you" && (
            <motion.div variants={REVEAL_ITEM} className="flex flex-col gap-8">
              <AlbumScroll title="Made For You" cards={madeForYou} />
              {recentlyPlayed.length > 0 && (
                <AlbumScroll title="Recently Played" cards={recentlyPlayed} />
              )}
              {trending.length > 0 && <TrackRow tracks={trending} />}
            </motion.div>
          )}

          {/* New — latest releases */}
          {activeSection === "new" && (
            <motion.div variants={REVEAL_ITEM} className="flex flex-col gap-8">
              {newReleases.length > 0 ? (
                <AlbumScroll title="New Releases" cards={newReleases} />
              ) : (
                <p className="text-sm text-white/40 px-2">Loading new releases…</p>
              )}
              {trending.length > 0 && <TrackRow tracks={trending} />}
            </motion.div>
          )}

          {/* Radio — Deezer stations */}
          {activeSection === "radio" && (
            <motion.div variants={REVEAL_ITEM}>
              {radio.length > 0 ? (
                <AlbumScroll title="Stations" cards={radio} />
              ) : (
                <p className="text-sm text-white/40 px-2">Loading stations…</p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {activeTab === "search" && <SearchPage />}
      {activeTab === "library" && <LibraryPage />}

      <AlbumModal album={openItem} onClose={() => setOpenItem(null)} />
      <SplashScreen show={!appReady} />
      {/* After the splash, a cinematic greeting plays, then the home cascades in */}
      <AnimatePresence>
        {appReady && !introDone && (
          <GreetingIntro key="greeting" onDone={() => setIntroDone(true)} />
        )}
      </AnimatePresence>
      <FullPlayer />
      <AudioEngine />
    </div>
  );
}
