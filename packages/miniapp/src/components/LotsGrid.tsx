"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, Flame, ChevronRight } from "lucide-react";
import { cipherString, fmtCountdown } from "../lib/fx";

type Lot = {
  id: number;
  title: string;
  live: boolean;
  seed: bigint;
  endsInSec: number;
  bidders: number;
};

const LOTS: Lot[] = [
  { id: 0, title: "Genesis Crown — Sealed Lot #001", live: true, seed: 0n, endsInSec: 86400, bidders: 0 },
  { id: 1, title: "The Obsidian Scepter — Lot #002", live: false, seed: 5512837n, endsInSec: 43200, bidders: 7 },
  { id: 2, title: "Veil of the Regent — Lot #003", live: false, seed: 9921734n, endsInSec: 172800, bidders: 12 },
];

function scrollToBid() {
  document.getElementById("auction-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LotsGrid() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const start = Math.floor(Date.now() / 1000);
    setNow(start);
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 px-1">
        <Flame className="w-5 h-5 text-gold-bright" />
        <h3 className="font-display text-xl text-gold-grad">Sealed Lots</h3>
        <span className="ml-auto text-[11px] font-cipher text-[#7e74a3] uppercase tracking-wider">live on Base Sepolia</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {LOTS.map((lot, i) => {
          return (
            <motion.button
              key={lot.id}
              type="button"
              onClick={lot.live ? scrollToBid : undefined}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.015 }}
              className={`text-left glass rounded-2xl p-5 relative overflow-hidden ${lot.live ? "glass-gold cursor-pointer" : "cursor-default"}`}
            >
              {/* status badge */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-cipher uppercase tracking-widest px-2 py-1 rounded-full"
                  style={
                    lot.live
                      ? { background: "rgba(244,197,96,0.16)", color: "#ffe39c", border: "1px solid rgba(244,197,96,0.4)" }
                      : { background: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }
                  }
                >
                  {lot.live ? "● Live" : "Preview"}
                </span>
                <Crown className={`w-4 h-4 ${lot.live ? "text-gold-bright" : "text-[#7e74a3]"}`} />
              </div>

              <div className="font-cipher text-sm text-[#f7f3ff] mt-3 leading-snug min-h-[40px]">{lot.title}</div>

              <div className="mt-3 flex items-center gap-1.5 font-cipher text-xs text-[#a855f7]">
                <Lock className="w-3 h-3" />
                <span className="cipher-blur">0x{cipherString(lot.live ? 31337n : lot.seed, 10)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between font-cipher text-[11px] text-[#b9a9e8]">
                <span>{lot.live ? "your move" : `${lot.bidders} sealed`}</span>
                <Countdown base={lot.endsInSec} mountNow={now} />
              </div>

              {lot.live && (
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                  Bid now <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function Countdown({ base, mountNow }: { base: number; mountNow: number }) {
  const [start] = useState(() => Math.floor(Date.now() / 1000));
  const left = base - (mountNow ? mountNow - start : 0);
  return <span>{fmtCountdown(left)}</span>;
}
