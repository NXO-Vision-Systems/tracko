import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Zap,
  Share2,
  LogOut,
  ChevronRight,
  X,
  AudioLines,
  EyeOff,
  MicVocal,
  Waves,
  Layers,
  HardDrive,
  LucideIcon,
  SlidersHorizontal,
  Settings2,
  Smartphone,
  Laptop,
  Speaker,
  Database,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import GooeyToggle from "./GooeyToggle";

const UltimateShaderBackground = () => {
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<unknown>(null);

  useEffect(() => {
    const styleId = "shader-canvas-style-account";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-account canvas {
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
        const { liquidMetalFragmentShader, ShaderMount } =
          await import("@paper-design/shaders");

        if (shaderRef.current && !shaderMount.current) {
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 2.5,
              u_softness: 0.6,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.6,
              u_distortion: 0.2,
              u_contour: 0.1,
              u_angle: 45,
              u_scale: 4,
              u_shape: 0,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.8,
          );
        }
      } catch (error) {
        console.error("[AccountPage] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mount = shaderMount.current as any;
      if (mount?.destroy) {
        mount.destroy();
        shaderMount.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={shaderRef}
      className="shader-container-account absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
    />
  );
};

// Cinematic ambient backdrop for the Pro card — warm champagne/gold, distinct from
// Ultimate's blue shader. Pure CSS/framer-motion so it stays lightweight.
const ProCinematicBackground = () => {
  const grain =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {/* Deep cinematic base */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#2a2118_0%,#15110c_45%,#080808_100%)]" />

      {/* Drifting warm glow */}
      <motion.div
        className="absolute -top-16 -left-10 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(212,175,110,0.38), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-0 w-64 h-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(186,124,92,0.30), transparent 70%)" }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Slow diagonal light sweep */}
      <motion.div
        className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,240,210,0.10), transparent)" }}
        animate={{ x: ["0%", "320%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-overlay"
        style={{ backgroundImage: `url("${grain}")` }}
      />

      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_25%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
};

interface AccountPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountPage({ isOpen, onClose }: AccountPageProps) {
  const [dataSaver, setDataSaver] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [privateSession, setPrivateSession] = useState(false);
  const [explicitContent, setExplicitContent] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState("pro");
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubscriptionChange = (val: string) => {
    setSubscriptionPlan(val);
    setIsFlipped(false);
  };

  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

  // Complexity additions
  const [eqBass, setEqBass] = useState(60);
  const [eqMid, setEqMid] = useState(45);
  const [eqTreble, setEqTreble] = useState(55);
  const [eqSurround, setEqSurround] = useState(30);

  const shaderRef = useRef<HTMLDivElement>(null);

  // Create a cool background liquid shader
  useEffect(() => {
    if (!isOpen) return;
    const styleId = "shader-canvas-style-account";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-account canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: inherit !important;
          mix-blend-mode: screen;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !shaderRef.current) return;

    // Very basic liquid effect via CSS gradients if WebGL isn't easily injectable here,
    // but the aesthetic asks for "liquid feel". We'll use animated pure CSS blobs combined with backdrop-blur.
    // We can also just rely on tailwind animations.
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 z-50 bg-black flex flex-col overflow-hidden"
          style={{ touchAction: "none" }}
        >
          {/* Background is pure black as per theme */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"></div>

          {/* Setup Header */}
          <div className="relative z-10 pt-12 pb-4 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-white/90">
              Profile
            </h1>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto scroll-content px-6 pb-24">
            {/* Profile Header (Liquid Glass Card) */}
            <div className="relative p-6 rounded-[24px] mb-8 bg-white/[0.03] border border-white/[0.06] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-white/20 to-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                    <Image
                      src="https://picsum.photos/200/200?random=1"
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-0.5 tracking-tight">
                    The Trench Kid
                  </h2>
                  <p className="text-sm text-white/50 mb-3">@thetrenchkid66</p>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-semibold text-white">
                      12 <span className="text-[10px] text-white/40 uppercase tracking-wider ml-1">Playlists</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="flex flex-col gap-4 mb-8">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.1em] px-2 mb-1">
                Subscriptions
              </h3>

              <div className="px-1 mb-2">
                <GooeyToggle
                  segments={[
                    { label: "Pro", value: "pro" },
                    { label: "Ultimate", value: "ultimate" },
                  ]}
                  value={subscriptionPlan}
                  onChange={handleSubscriptionChange}
                />
              </div>

              <div className="relative h-[240px]">
                <AnimatePresence mode="wait">
                  {subscriptionPlan === "pro" ? (
                    <motion.div
                      key="pro"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full"
                      style={{ perspective: 1000 }}
                    >
                      <motion.div
                        className="w-full h-full relative group cursor-pointer"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: "preserve-3d" }}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        {/* FRONT */}
                        <div
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-black/50 backdrop-blur-3xl border border-amber-200/[0.18] shadow-[0_16px_48px_rgba(0,0,0,0.7)] shadow-black/60"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          {/* Cinematic ambient backdrop */}
                          <ProCinematicBackground />

                          <img src="/logo.png" alt="" className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-[0.12] pointer-events-none -rotate-12 [filter:drop-shadow(0_0_16px_rgba(212,175,110,0.25))]" />
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-900/20 to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                          <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                  <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain opacity-100 drop-shadow-[0_0_8px_rgba(212,175,110,0.5)]" />
                                  <div className="px-2.5 py-0.5 rounded-full border border-amber-200/20 bg-amber-200/[0.06] backdrop-blur-md flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_0_10px_rgba(212,175,110,0.12)]">
                                    <span className="text-[9px] font-black tracking-[0.3em] ml-[0.1em] text-amber-100/90 uppercase mt-[1px]">
                                      PRO
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
                                  Current
                                </span>
                              </div>
                              <div className="text-2xl font-bold tracking-tight leading-tight mb-1.5 bg-gradient-to-r from-white via-amber-100 to-amber-200/80 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(212,175,110,0.15)]">
                                Studio Mode
                              </div>
                              <div className="text-[11px] text-amber-50/50 leading-relaxed max-w-[85%]">
                                Hi-Res lossless audio quality and advanced EQ
                                controls.
                              </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-3 border-t border-amber-200/[0.12] pt-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight text-white">
                                  $4.99
                                </span>
                                <span className="text-[11px] text-amber-100/40">/mo</span>
                              </div>
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-200/[0.10] to-amber-100/[0.06] backdrop-blur-md border border-amber-200/20 flex items-center justify-center gap-2 shadow-[inset_0_0_20px_rgba(212,175,110,0.08)] relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-200/[0.06] to-transparent" />
                                <span className="text-[10px] font-black tracking-[0.25em] ml-[0.1em] text-amber-50/95 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10">
                                  CURRENT PLAN
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BACK */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] shadow-black/50 flex flex-col p-5" 
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                          <img src="/logo.png" alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 object-contain opacity-[0.05] pointer-events-none" />
                          <div className="flex items-center gap-2 mb-3 relative z-10">
                            <img src="/logo.png" alt="logo" className="w-4 h-4 object-contain opacity-50" />
                            <span className="text-xs font-semibold tracking-[0.2em] text-white/90 uppercase">Pro Features</span>
                          </div>
                          <ul className="text-[11px] text-white/70 space-y-2.5 flex-1 relative z-10">
                            <li className="flex items-center gap-2.5"><Check size={14} className="text-white/90" /> Up to 24-bit/96kHz audio</li>
                            <li className="flex items-center gap-2.5"><Check size={14} className="text-white/90" /> Advanced Parametric EQ</li>
                            <li className="flex items-center gap-2.5"><Check size={14} className="text-white/90" /> Ad-free listening</li>
                            <li className="flex items-center gap-2.5"><Check size={14} className="text-white/90" /> Offline downloads</li>
                          </ul>
                          <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] text-center mt-2 font-bold cursor-pointer hover:text-white/50 transition-colors">Tap to flip</div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ultimate"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full"
                      style={{ perspective: 1000 }}
                    >
                      <motion.div
                        className="w-full h-full relative group cursor-pointer"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: "preserve-3d" }}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        {/* FRONT */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-[#020617]/40 backdrop-blur-3xl border border-blue-500/30 shadow-[0_16px_48px_rgba(0,0,0,0.8)] shadow-black"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          {/* WebGL Shader Background */}
                          <UltimateShaderBackground />

                          <img src="/logo.png" alt="" className="absolute -right-12 -bottom-12 w-72 h-72 object-contain opacity-15 pointer-events-none -rotate-12 [filter:drop-shadow(0_0_20px_rgba(59,130,246,0.3))]" />

                          {/* Glass Reflections */}
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-800/20 to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/[0.05] to-transparent pointer-events-none" />

                          {/* Hallmark Top Badge */}
                          <div className="absolute top-0 right-6 px-4 py-1 bg-blue-950/40 border-b border-x border-blue-500/30 backdrop-blur-md text-[9px] font-bold uppercase tracking-[0.2em] text-blue-300 rounded-b-md z-20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-1.5">
                            <Zap size={10} className="text-blue-400" />
                            MAX
                          </div>

                          {/* Content */}
                          <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-center gap-2.5 mb-3">
                                <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain opacity-100 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] [filter:drop-shadow(0_0_8px_rgba(59,130,246,0.6))]" />
                                <div className="px-2.5 py-0.5 rounded-full border border-blue-400/30 bg-blue-600/10 backdrop-blur-md flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(59,130,246,0.2)]">
                                  <span className="text-[9px] font-black tracking-[0.3em] ml-[0.1em] text-blue-300 uppercase mt-[1px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    ULTIMATE
                                  </span>
                                </div>
                              </div>
                              <div className="text-2xl font-bold tracking-tight text-white leading-tight mb-1.5">
                                Master Vault
                              </div>
                              <div className="text-[11px] text-blue-100/60 leading-relaxed max-w-[85%]">
                                384kHz Master streaming, ad-free offline, live
                                canvas.
                              </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-3 border-t border-blue-500/20 pt-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight text-white">
                                  $9.99
                                </span>
                                <span className="text-[11px] text-blue-200/50">
                                  /mo
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubscriptionPlan("ultimate");
                                }}
                                className="relative w-full py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/30 to-blue-500/20 backdrop-blur-md border border-blue-400/40 shadow-[0_0_20px_rgba(37,99,235,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5),inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <span className="relative z-10 text-[10px] font-black tracking-[0.25em] ml-[0.1em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                  UPGRADE TO MAX
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* BACK */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-[#020617]/90 backdrop-blur-3xl border border-blue-400/30 shadow-[0_16px_48px_rgba(0,0,0,0.8)] shadow-black flex flex-col p-5" 
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                          <UltimateShaderBackground />
                          <img src="/logo.png" alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-15 pointer-events-none" />
                          <div className="relative z-10 w-full h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain opacity-80" />
                              <span className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">Master Vault Features</span>
                            </div>
                            <ul className="text-[11px] text-blue-100/80 space-y-2.5 flex-1 relative z-10">
                              <li className="flex items-center gap-2.5"><Check size={14} className="text-blue-400" /> Up to 32-bit/384kHz audio</li>
                              <li className="flex items-center gap-2.5"><Check size={14} className="text-blue-400" /> Dolby Atmos & Spatial Audio</li>
                              <li className="flex items-center gap-2.5"><Check size={14} className="text-blue-400" /> Exclusive Live Canvas</li>
                              <li className="flex items-center gap-2.5"><Check size={14} className="text-blue-400" /> Early access to releases</li>
                            </ul>
                            <div className="text-[9px] text-blue-300/40 uppercase tracking-[0.2em] text-center mt-2 font-bold cursor-pointer hover:text-blue-300/60 transition-colors">Tap to flip</div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-6">
              {/* Settings Section */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.1em] mb-3 px-2">
                    App Settings
                  </h3>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                    <SettingNav
                      icon={Waves}
                      title="Playback Options"
                      onClick={() => setActiveSubPage("playback")}
                    />
                    <div className="h-px w-full bg-white/[0.05]" />
                    <SettingNav
                      icon={Settings2}
                      title="Audio & DSP"
                      onClick={() => setActiveSubPage("audio_dsp")}
                    />
                    <div className="h-px w-full bg-white/[0.05]" />
                    <SettingNav
                      icon={Database}
                      title="Storage"
                      onClick={() => setActiveSubPage("storage")}
                    />
                    <div className="h-px w-full bg-white/[0.05]" />
                    <SettingNav
                      icon={Smartphone}
                      title="Devices"
                      onClick={() => setActiveSubPage("devices")}
                    />
                    <div className="h-px w-full bg-white/[0.05]" />
                    <SettingNav
                      icon={EyeOff}
                      title="Privacy & App"
                      onClick={() => setActiveSubPage("privacy")}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Section */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.1em] mb-3 px-2">
                  Account & Privacy
                </h3>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                  <SettingNav
                    icon={User}
                    title="Edit Profile"
                    onClick={() => setActiveSubPage("edit_profile")}
                  />
                  <div className="h-px w-full bg-white/[0.05]" />
                  <SettingNav
                    icon={Bell}
                    title="Notifications"
                    onClick={() => {}}
                  />
                  <div className="h-px w-full bg-white/[0.05]" />
                  <SettingNav
                    icon={Share2}
                    title="Social"
                    onClick={() => setActiveSubPage("social")}
                  />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setPrivateSession(false);
                  setDataSaver(false);
                  setHighQuality(true);
                  onClose();
                }}
                className="mt-4 flex items-center justify-center gap-2 w-full p-4 rounded-full bg-red-500/[0.05] border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/10 transition-colors active:scale-[0.98]"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>

          <AnimatePresence>
            {/* Playback Options */}
            {activeSubPage === "playback" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Playback Options
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
                  <div className="flex flex-col gap-2.5">
                    <SettingToggle
                      icon={Waves}
                      title="Spatial Audio"
                      desc="Immersive 3D soundscape for supported tracks."
                      active={spatialAudio}
                      onClick={() => setSpatialAudio(!spatialAudio)}
                    />
                    <SettingToggle
                      icon={Layers}
                      title="Crossfade"
                      desc="Smoothly transitions between songs."
                      active={dataSaver}
                      onClick={() => setDataSaver(!dataSaver)}
                    />
                    <SettingToggle
                      icon={AudioLines}
                      title="High-Res Lossless"
                      desc="Maximum fidelity audio streaming up to 24-bit."
                      active={highQuality}
                      onClick={() => setHighQuality(!highQuality)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audio & DSP */}
            {activeSubPage === "audio_dsp" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Audio & DSP
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-5">
                    <EQSlider
                      label="Sub Bass"
                      value={eqBass}
                      onChange={setEqBass}
                      color="bg-rose-500"
                    />
                    <EQSlider
                      label="Mid Range"
                      value={eqMid}
                      onChange={setEqMid}
                      color="bg-amber-500"
                    />
                    <EQSlider
                      label="Treble / Air"
                      value={eqTreble}
                      onChange={setEqTreble}
                      color="bg-emerald-500"
                    />
                    <EQSlider
                      label="Surround Width"
                      value={eqSurround}
                      onChange={setEqSurround}
                      color="bg-blue-500"
                    />

                    <div className="mt-2 pt-4 border-t border-white/[0.05] flex justify-between items-center">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Preset
                      </div>
                      <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none appearance-none cursor-pointer">
                        <option>Custom</option>
                        <option>Electronic</option>
                        <option>Acoustic</option>
                        <option>Vocal Booster</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Storage */}
            {activeSubPage === "storage" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Storage
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 backdrop-blur-xl flex flex-col gap-4">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <div className="text-2xl font-black text-white tracking-tight">
                          14.2{" "}
                          <span className="text-sm text-white/40 font-bold">
                            GB
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                          Used by Music App
                        </div>
                      </div>
                      <Database size={24} className="text-white/10" />
                    </div>

                    <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden flex gap-[2px] p-[2px] border border-white/10">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "60%" }}
                      />
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: "25%" }}
                      />
                      <div className="h-full bg-white/10 rounded-full flex-1" />
                    </div>

                    <div className="flex gap-4 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-white/60">
                          Downloads (8.5GB)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[10px] text-white/60">
                          Cache (3.5GB)
                        </span>
                      </div>
                    </div>

                    <button className="mt-2 w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      Clear Cache to save space
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Devices */}
            {activeSubPage === "devices" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Devices
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                    <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                        <Smartphone size={18} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                          This iPhone{" "}
                          <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 font-bold">
                            Current
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-400/70 truncate mt-0.5">
                          Playing audio
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/[0.05]" />
                    <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors opacity-60">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40">
                        <Laptop size={18} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          MacBook Pro M3
                        </div>
                        <div className="text-[11px] text-white/40 truncate mt-0.5">
                          Last active 2 hrs ago
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/[0.05]" />
                    <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors opacity-60">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40">
                        <Speaker size={18} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          Living Room HomePod
                        </div>
                        <div className="text-[11px] text-white/40 truncate mt-0.5">
                          Offline
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Privacy & App */}
            {activeSubPage === "privacy" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Privacy & App
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
                  <div className="flex flex-col gap-2.5">
                    <SettingToggle
                      icon={EyeOff}
                      title="Private Session"
                      desc="Hide your listening activity from followers."
                      active={privateSession}
                      onClick={() => setPrivateSession(!privateSession)}
                    />
                    <SettingToggle
                      icon={MicVocal}
                      title="Explicit Content"
                      desc="Allow playback of explicit tracks & albums."
                      active={explicitContent}
                      onClick={() => setExplicitContent(!explicitContent)}
                    />
                    <SettingToggle
                      icon={HardDrive}
                      title="Offline Mode"
                      desc="Only play music downloaded to this device."
                      active={offlineMode}
                      onClick={() => setOfflineMode(!offlineMode)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubPage === "edit_profile" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <h2 className="text-base font-bold text-white">
                    Edit Profile
                  </h2>
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-emerald-400 font-semibold hover:text-emerald-300"
                  >
                    Save
                  </button>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 relative group cursor-pointer">
                      <Image
                        src="https://picsum.photos/200/200?random=1"
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-white">
                          Change
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-wider px-2">
                        Name
                      </label>
                      <input
                        type="text"
                        defaultValue="The Trench Kid"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-wider px-2">
                        Username
                      </label>
                      <input
                        type="text"
                        defaultValue="thetrenchkid66"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubPage === "social" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[70] bg-[#050505] flex flex-col"
              >
                <div className="pt-12 pb-4 px-6 flex items-center border-b border-white/5">
                  <button
                    onClick={() => setActiveSubPage(null)}
                    className="text-white/70 hover:text-white flex items-center pr-4"
                  >
                    <ChevronRight size={20} className="rotate-180 mr-1" />
                  </button>
                  <h2 className="text-base font-bold text-white flex-1 text-center pr-8">
                    Social
                  </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.1em] px-2 mb-1">
                      Connections
                    </h3>

                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="text-[#1877F2]"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="text-sm font-semibold text-white/90 truncate">
                            Connect Facebook
                          </div>
                          <div className="text-[11px] text-white/40 truncate mt-0.5">
                            Find friends on Music
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-white/30 shrink-0"
                        />
                      </div>
                      <div className="h-px w-full bg-white/[0.05]" />
                      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-80 flex items-center justify-center shrink-0 p-[1px]">
                          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              className="text-white"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="text-sm font-semibold text-white/90 truncate">
                            Connect Instagram
                          </div>
                          <div className="text-[11px] text-white/40 truncate mt-0.5">
                            Show what you listen to on your profile
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-white/30 shrink-0"
                        />
                      </div>
                      <div className="h-px w-full bg-white/[0.05]" />
                      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="text-white"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="text-sm font-semibold text-white/90 truncate">
                            Connect Twitter / X
                          </div>
                          <div className="text-[11px] text-white/40 truncate mt-0.5">
                            Share your top tracks
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-white/30 shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Subcomponents

interface SettingToggleProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

function SettingToggle({
  icon: Icon,
  title,
  desc,
  active,
  onClick,
}: SettingToggleProps) {
  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
        active
          ? "bg-white/[0.04] border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-black/40 border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
      }`}
      onClick={onClick}
    >
      {/* Active Inner Glow */}
      {active && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      )}

      <div className="flex items-center gap-4 relative z-10">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border ${
            active
              ? "bg-white/[0.08] border-white/10 text-white"
              : "bg-white/[0.02] border-white/[0.05] text-white/40 group-hover:text-white/60"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="flex flex-col flex-1 min-w-0 pr-2">
          <span
            className={`text-[14px] font-semibold tracking-tight transition-colors duration-300 ${active ? "text-white" : "text-white/80"}`}
          >
            {title}
          </span>
          <span
            className={`text-[11px] leading-snug mt-0.5 transition-colors duration-300 ${active ? "text-white/60" : "text-white/40"}`}
          >
            {desc}
          </span>
        </div>

        {/* Custom iOS-style pill toggle */}
        <div
          className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 border ${
            active
              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "bg-white/5 border-white/10"
          }`}
        >
          <motion.div
            initial={false}
            animate={{
              x: active ? 22 : 2,
              backgroundColor: active ? "#000000" : "#ffffff",
              opacity: active ? 1 : 0.4,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 bottom-1 w-4 rounded-full shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

interface SettingNavProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

function SettingNav({ icon: Icon, title, onClick }: SettingNavProps) {
  return (
    <div
      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors active:bg-white/[0.06] active:scale-[0.99] select-none"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white/70">
          <Icon size={20} />
        </div>
        <span className="text-[15px] font-semibold text-white/90">{title}</span>
      </div>
      <ChevronRight size={20} className="text-white/20" />
    </div>
  );
}

// Custom EQ Slider Component
interface EQSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color?: string;
}

function EQSlider({
  label,
  value,
  onChange,
  color = "bg-white",
}: EQSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70 font-medium">{label}</span>
        <span className="text-white/40 font-mono tracking-tighter">
          {value}%
        </span>
      </div>
      <div className="relative h-2 w-full bg-white/5 rounded-full border border-white/10 overflow-visible flex items-center">
        <div
          className={`absolute left-0 top-0 bottom-0 rounded-l-full shadow-[0_0_10px_currentColor] opacity-50 ${color}`}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="w-4 h-4 rounded-full bg-white shadow-md absolute pointer-events-none border border-black/20"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
    </div>
  );
}
