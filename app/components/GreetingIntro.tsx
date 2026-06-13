"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function GreetingIntro({ onDone }: { onDone: () => void }) {
  const [greeting] = useState(getGreeting);

  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[290] flex items-center justify-center bg-[#050505] overflow-hidden px-8"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-[90px] bg-white/[0.05]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 0.6, 0.35], scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />

      {/* Greeting — flies upward & shrinks toward the header on exit */}
      <motion.div
        className="relative text-center"
        initial={{ y: 0 }}
        exit={{ y: -210, scale: 0.52, opacity: 0 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-2xl font-semibold tracking-tight text-white/70"
        >
          {greeting},
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
          className="text-5xl font-black tracking-tighter mt-1 drop-shadow-[0_0_24px_rgba(255,255,255,0.18)]"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Jonathan
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
