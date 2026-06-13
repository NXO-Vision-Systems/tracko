"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-y-0 inset-x-0 mx-auto w-full max-w-[428px] z-[300] flex items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Subtle ambient glow behind the logo */}
          <motion.div
            className="absolute w-72 h-72 rounded-full blur-[80px] bg-white/[0.06]"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo */}
          <motion.img
            src="/logo.png"
            alt="logo"
            className="relative w-24 h-24 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.25)]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.92, 1, 0.92], opacity: 1 }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
