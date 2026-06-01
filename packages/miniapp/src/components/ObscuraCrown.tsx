"use client";

import { motion } from "framer-motion";

/**
 * ObscuraCrown — animated glowing crown with rotating cipher rings.
 * Pure SVG + Framer Motion. This is the hero centerpiece.
 */
export function ObscuraCrown({ size = 150 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.7, height: size * 1.7 }}>
      {/* Rotating cipher rings */}
      <div className="absolute inset-0 rounded-full border border-[rgba(139,92,246,0.25)] animate-spin-slow" />
      <div className="absolute inset-[10%] rounded-full border border-dashed border-[rgba(244,197,96,0.3)] animate-spin-rev" />
      <motion.div
        className="absolute inset-[22%] rounded-full"
        style={{ boxShadow: "inset 0 0 40px rgba(139,92,246,0.4)" }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Floating ciphertext glyphs around the crown */}
      {["e64", "FHE", "0x…", "⊕", "∑", "λ"].map((g, i) => (
        <motion.span
          key={g}
          className="absolute font-cipher text-[10px] text-[rgba(168,85,247,0.55)]"
          style={{
            transform: `rotate(${i * 60}deg) translateY(-${size * 0.95}px)`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
        >
          {g}
        </motion.span>
      ))}

      {/* The crown */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="glow-gold animate-floaty relative z-10"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe39c" />
            <stop offset="55%" stopColor="#f4c560" />
            <stop offset="100%" stopColor="#b8862f" />
          </linearGradient>
        </defs>
        <motion.g
          animate={{ filter: ["drop-shadow(0 0 6px #f4c560)", "drop-shadow(0 0 16px #f4c560)", "drop-shadow(0 0 6px #f4c560)"] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          {/* Crown body */}
          <path
            d="M20 80 L18 40 L40 58 L60 28 L80 58 L102 40 L100 80 Z"
            fill="url(#goldGrad)"
            stroke="#fff3d6"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Base band */}
          <rect x="20" y="80" width="80" height="14" rx="3" fill="url(#goldGrad)" stroke="#fff3d6" strokeWidth="1.2" />
          {/* Jewels */}
          <circle cx="60" cy="50" r="5" fill="#a855f7" />
          <circle cx="35" cy="70" r="3.4" fill="#8b5cf6" />
          <circle cx="85" cy="70" r="3.4" fill="#8b5cf6" />
          <circle cx="60" cy="87" r="3" fill="#a855f7" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
