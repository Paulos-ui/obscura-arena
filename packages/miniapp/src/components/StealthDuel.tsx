"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Eye, EyeOff } from "lucide-react";
import { cipherString } from "../lib/fx";

/**
 * StealthDuel — a self-contained illustration of the privacy guarantee:
 * the SAME comparison the contract does on encrypted data, shown encrypted
 * (what the chain/world sees) vs decrypted (what only owners ever see).
 */
export function StealthDuel() {
  const [revealed, setRevealed] = useState(false);
  const left = { name: "Your Bid", value: 740n };
  const right = { name: "Rival Bid", value: 612n };
  const winner = left.value > right.value ? left.name : right.name;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-3xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-4">
        <Swords className="w-5 h-5 text-royal glow-royal" />
        <h3 className="font-display text-xl text-gold-grad">Stealth Duel</h3>
        <button
          onClick={() => setRevealed((v) => !v)}
          className="ml-auto btn-ghost rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {revealed ? "Hide" : "Decrypt"}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {[left, right].map((side, idx) => {
          const isLeft = idx === 0;
          const isWinner = revealed && side.name === winner;
          return (
            <div
              key={side.name}
              className={`rounded-2xl p-5 text-center ${isLeft ? "order-1" : "order-3"}`}
              style={{
                background: isWinner ? "rgba(244,197,96,0.12)" : "rgba(7,5,13,0.5)",
                border: `1px solid ${isWinner ? "rgba(244,197,96,0.5)" : "rgba(139,92,246,0.25)"}`,
              }}
            >
              <div className="text-[11px] font-cipher uppercase tracking-wider text-[#b9a9e8]">{side.name}</div>
              <div className="mt-2 font-cipher text-lg min-h-[28px]">
                {revealed ? (
                  <motion.span initial={{ filter: "blur(8px)", opacity: 0 }} animate={{ filter: "blur(0px)", opacity: 1 }} className={isWinner ? "text-gold-grad" : "text-[#e9e2ff]"}>
                    {side.value.toString()} ⚜
                  </motion.span>
                ) : (
                  <span className="text-[#a855f7] cipher-blur">0x{cipherString(side.value * 31337n, 10)}</span>
                )}
              </div>
              {isWinner && <div className="mt-1 text-[10px] font-cipher text-gold-bright uppercase tracking-widest">victor</div>}
            </div>
          );
        })}
        <div className="order-2 font-display text-2xl text-royal">vs</div>
      </div>

      <p className="mt-4 text-[11px] text-[#7e74a3] font-cipher text-center">
        The chain computes <code>FHE.gt(yourBid, rivalBid)</code> without decrypting either side. Only you can unseal your own number.
      </p>
    </motion.section>
  );
}
