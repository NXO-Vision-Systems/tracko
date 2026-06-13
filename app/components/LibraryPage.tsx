"use client";

import { useState, useRef } from "react";
import { Plus, Heart, Clock, ListMusic, Music, Search, Share, Trash2, Edit2, Image as ImageIcon, Upload, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { getApiUrl } from "@/lib/api";

const filters = ["Playlists", "Artists", "Albums", "Downloaded"];

const gradients = [
  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(200,200,220,0.03) 100%)",
  "linear-gradient(135deg, rgba(200,200,220,0.08) 0%, rgba(255,255,255,0.03) 100%)",
  "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(220,220,235,0.04) 100%)",
  "linear-gradient(135deg, rgba(220,220,235,0.07) 0%, rgba(200,200,220,0.03) 100%)",
  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
];

const patterns = [
  "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 40%)",
  "radial-gradient(circle at 70% 50%, rgba(200,200,220,0.1) 0%, transparent 45%)",
  "radial-gradient(circle at 50% 70%, rgba(255,255,255,0.08) 0%, transparent 35%)",
  "radial-gradient(circle at 80% 20%, rgba(220,220,235,0.12) 0%, transparent 40%)",
  "radial-gradient(circle at 30% 80%, rgba(255,255,255,0.09) 0%, transparent 40%)",
];

const initialPlaylists = [
  { title: "Chill Vibes", count: 42, gradient: gradients[0], pattern: patterns[0], coverArt: null as string | null },
  { title: "Workout Energy", count: 31, gradient: gradients[1], pattern: patterns[1], coverArt: null as string | null },
  { title: "Late Night Drive", count: 56, gradient: gradients[2], pattern: patterns[2], coverArt: null as string | null },
  { title: "Focus Flow", count: 38, gradient: gradients[3], pattern: patterns[3], coverArt: null as string | null },
  { title: "Acoustic Afternoons", count: 24, gradient: gradients[4], pattern: patterns[4], coverArt: null as string | null },
];

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [activeFilter, setActiveFilter] = useState("Playlists");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showRename, setShowRename] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createName, setCreateName] = useState("");
  const [showGenerateCover, setShowGenerateCover] = useState<string | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePlaylist = () => {
    if (createName.trim()) {
      const newPlaylist = {
        title: createName.trim(),
        count: 0,
        gradient: gradients[playlists.length % gradients.length],
        pattern: patterns[playlists.length % patterns.length],
        coverArt: null as string | null
      };
      setPlaylists([newPlaylist, ...playlists]);
      setShowCreate(false);
      setCreateName("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeMenu) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPlaylists(playlists.map(p => p.title === activeMenu ? { ...p, coverArt: url } : p));
        setActiveMenu(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCover = async () => {
    if (!generatePrompt.trim() || !showGenerateCover) return;
    setIsGenerating(true);
    try {
      const res = await fetch(getApiUrl('/api/generate-cover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt, title: showGenerateCover })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setPlaylists(playlists.map(p => p.title === showGenerateCover ? { ...p, coverArt: data.imageUrl } : p));
        setShowGenerateCover(null);
        setGeneratePrompt("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="scroll-content safe-pt">
      {/* Header */}
      <div style={{ padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 50 }}>
        {showSearch ? (
          <div className="flex-1 flex items-center bg-white/10 rounded-full px-3 py-1.5 mr-3">
            <Search size={16} className="text-white/50 mr-2" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search in Library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/40"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/50 hover:text-white p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        ) : (
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Your Library
          </h2>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchQuery("");
              } else {
                setShowSearch(true);
              }
            }}
            style={{
            width: 34, height: 34, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: showSearch ? "#fff" : "rgba(255,255,255,0.6)",
            background: showSearch ? "rgba(255,255,255,0.1)" : "transparent",
            border: showSearch ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}>
            {showSearch ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> : <Search size={18} />}
          </button>
          <button 
            onClick={() => setShowCreate(true)}
            style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            cursor: "pointer"
          }}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "16px 20px 24px", display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
        {filters.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}>
              {f}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      {activeFilter === "Playlists" && (
        <>
          {/* Pinned Cards */}
          <div className="grid grid-cols-2 gap-3 px-5 mb-7">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col hover:bg-white/10 transition-colors cursor-pointer min-h-[110px]">
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(200,200,220,0.03) 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(236,72,153,0.3)",
                marginBottom: "auto"
              }}>
                <Heart size={20} color="#ec4899" fill="rgba(236, 72, 153, 0.2)" />
              </div>
              <div className="text-[15px] font-semibold text-white/90 mt-3 tracking-tight">Liked Songs</div>
              <div className="text-[13px] text-white/50 mt-0.5">127 tracks</div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col hover:bg-white/10 transition-colors cursor-pointer min-h-[110px]">
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(200,200,220,0.03) 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(16,185,129,0.25)",
                marginBottom: "auto"
              }}>
                <Clock size={20} color="#10b981" />
              </div>
              <div className="text-[15px] font-semibold text-white/90 mt-3 tracking-tight">Recently Played</div>
              <div className="text-[13px] text-white/50 mt-0.5">84 tracks</div>
            </div>
          </div>

          {/* Playlist List */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Your Playlists</h3>
              <ListMusic size={16} color="rgba(255,255,255,0.3)" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {playlists.filter(pl => pl.title.toLowerCase().includes(searchQuery.toLowerCase())).map((pl) => (
                <div
                  key={pl.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "6px 0",
                    cursor: "pointer",
                  }}
                  className="group"
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: pl.gradient,
                    border: `1px solid rgba(255,255,255,0.05)`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {pl.coverArt ? (
                      <Image src={pl.coverArt} alt={pl.title} fill style={{ objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: "inherit",
                          background: pl.pattern
                        }} />
                        <Music size={20} color="rgba(255,255,255,0.7)" style={{ opacity: 0.9 }} />
                      </>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
                      {pl.title}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      Playlist · {pl.count} songs
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(pl.title);
                    }}
                    style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeFilter === "Artists" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Your Artists</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["The Weeknd", "Daft Punk", "Tame Impala", "Kendrick Lamar", "Frank Ocean", "Drake", "J. Cole", "Travis Scott"]
              .filter(artist => artist.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((artist, idx) => (
              <div key={artist} style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 0", cursor: "pointer" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: gradients[idx % gradients.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <span style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{artist[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>
                    {artist}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    Artist
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilter === "Albums" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Your Albums</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Starboy", "Discovery", "Currents", "DAMN.", "Blonde", "Take Care", "2014 Forest Hills Drive", "ASTROWORLD"]
              .filter(album => album.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((album, idx) => (
              <div key={album} className="cursor-pointer group flex flex-col gap-2">
                <div className="w-full aspect-square rounded-xl relative overflow-hidden" style={{ background: gradients[idx % gradients.length] }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-50">
                    <Music size={32} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold truncate">{album}</div>
                  <div className="text-xs text-white/50 truncate">Album</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilter === "Downloaded" && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
          <div className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <p className="text-sm font-medium">No downloaded music yet.</p>
        </div>
      )}

      {/* Action Menu Bottom Sheet */}
      {activeMenu && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center"
        }} onClick={() => setActiveMenu(null)}>
          <div 
            style={{
              width: "100%", maxWidth: 420,
              background: "linear-gradient(180deg, rgba(20,20,25,0.95) 0%, rgba(10,10,12,1) 100%)",
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: "24px 20px 40px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
              animation: "fade-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex", flexDirection: "column", gap: 16
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 8px" }} />
            
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{activeMenu}</h3>
            
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}>
              <ImageIcon size={18} /> Choose from Gallery
            </button>
            <button 
              onClick={() => {
                setNewName(activeMenu);
                setShowRename(activeMenu);
                setActiveMenu(null);
              }}
              style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}>
              <Edit2 size={18} /> Rename Playlist
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}>
              <Share size={18} /> Share Playlist
            </button>
            <button 
              onClick={() => {
                setShowConfirm(activeMenu);
                setActiveMenu(null);
              }}
              style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}>
              <Trash2 size={18} color="#ef4444" /> Delete Playlist
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirm && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowConfirm(null)}>
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,1) 100%)",
              borderRadius: 20, padding: 24, width: "100%", maxWidth: 320,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              textAlign: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
             }}>
               <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete &quot;{showConfirm}&quot;?</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              This action cannot be undone. You will lose all the songs saved in this playlist.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowConfirm(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", color: "#fff", 
                  fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setPlaylists(playlists.filter(p => p.title !== showConfirm));
                  setShowConfirm(null);
                }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)", color: "#ef4444", 
                  fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239, 68, 68, 0.3)"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRename && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowRename(null)}>
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,1) 100%)",
              borderRadius: 20, padding: 24, width: "100%", maxWidth: 320,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Rename Playlist</h3>
            <input 
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              autoFocus
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 16, marginBottom: 24, outline: "none"
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowRename(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", color: "#fff", 
                  fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newName.trim()) {
                    setPlaylists(playlists.map(p => p.title === showRename ? { ...p, title: newName.trim() } : p));
                  }
                  setShowRename(null);
                }}
                disabled={!newName.trim()}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: newName.trim() ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)" : "rgba(255,255,255,0.02)", 
                  color: newName.trim() ? "#3b82f6" : "rgba(255,255,255,0.2)", 
                  fontSize: 14, fontWeight: 600, cursor: newName.trim() ? "pointer" : "not-allowed", border: newName.trim() ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Cover Dialog */}
      {showGenerateCover && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => !isGenerating && setShowGenerateCover(null)}>
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,1) 100%)",
              borderRadius: 20, padding: 24, width: "100%", maxWidth: 320,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Sparkles size={20} color="#c4b5fd" /> Generate Cover
            </h3>
            <textarea 
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Describe the cover art..."
              autoFocus
              rows={3}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 16, marginBottom: 24, outline: "none", resize: "none"
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowGenerateCover(null)}
                disabled={isGenerating}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", color: "#fff", 
                  fontSize: 14, fontWeight: 600, cursor: isGenerating ? "not-allowed" : "pointer", border: "1px solid rgba(255,255,255,0.05)",
                  opacity: isGenerating ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateCover}
                disabled={!generatePrompt.trim() || isGenerating}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: generatePrompt.trim() ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%)" : "rgba(255,255,255,0.02)", 
                  color: generatePrompt.trim() ? "#c4b5fd" : "rgba(255,255,255,0.2)", 
                  fontSize: 14, fontWeight: 600, cursor: (generatePrompt.trim() && !isGenerating) ? "pointer" : "not-allowed", border: generatePrompt.trim() ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowCreate(false)}>
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,1) 100%)",
              borderRadius: 20, padding: 24, width: "100%", maxWidth: 320,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>New Playlist</h3>
            <input 
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="My awesome playlist"
              autoFocus
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 16, marginBottom: 24, outline: "none"
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", color: "#fff", 
                  fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePlaylist}
                disabled={!createName.trim()}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, 
                  background: createName.trim() ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)" : "rgba(255,255,255,0.02)", 
                  color: createName.trim() ? "#10b981" : "rgba(255,255,255,0.2)", 
                  fontSize: 14, fontWeight: 600, cursor: createName.trim() ? "pointer" : "not-allowed", border: createName.trim() ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
