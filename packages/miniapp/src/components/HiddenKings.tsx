"use client";

import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";
import { cipherString } from "../lib/fx";

const KINGS = [
  { rank: 1, name: "The Veiled Sovereign", seed: 9912837n },
  { rank: 2, name: "Margrave of Ciphers", seed: 4471829n },
  { rank: 3, name: "The Obsidian Regent", seed: 2218734n },
  { rank: 4, name: "Baroness Penumbra", seed: 7783410n },
];

export function HiddenKings() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-3xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-gold-bright" />
        <h3 className="font-display text-xl text-gold-grad">Encrypted Kings</h3>
        <span className="ml-auto text-[11px] font-cipher text-[#7e74a3] uppercase tracking-wider">power · sealed</span>
      </div>

      <div className="space-y-2.5">
        {KINGS.map((k, i) => (
          <motion.div
            key={k.rank}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.015 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(7,5,13,0.5)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <span className={`font-display text-lg ${k.rank === 1 ? "text-gold-grad" : "text-[#b9a9e8]"}`}>#{k.rank}</span>
            <span className="font-cipher text-sm text-[#e9e2ff] flex-1">{k.name}</span>
            <span className="font-cipher text-sm text-[#a855f7] cipher-blur flex items-center gap-1.5">
              <Lock className="w-3 h-3 shrink-0" /> 0x{cipherString(k.seed, 12)}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-[#7e74a3] font-cipher text-center">
        Rankings exist on-chain; the power levels behind them never leave encryption.
      </p>
    </motion.section>
  );
}
