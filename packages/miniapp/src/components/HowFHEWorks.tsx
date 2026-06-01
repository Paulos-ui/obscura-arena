"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, Gavel, ShieldQuestion } from "lucide-react";

const STEPS = [
  {
    icon: Lock,
    title: "1 · Bids are sealed",
    body: "Your bid is encrypted in your browser with CoFHE before it ever leaves your device. The chain stores a ciphertext — even the contract can't read the number.",
  },
  {
    icon: Gavel,
    title: "2 · The chain compares blind",
    body: "On every bid the contract runs FHE.gt and FHE.select over the encrypted values to track the highest bid. It computes who's winning without ever decrypting a single bid.",
  },
  {
    icon: Eye,
    title: "3 · Only the winner is revealed",
    body: "At settlement, a threshold network decrypts just the winning amount and winner. Every losing bid stays encrypted forever — no front-running, no leaks.",
  },
];

export function HowFHEWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
      >
        <ShieldQuestion className="w-3.5 h-3.5" /> How FHE Works
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,4,9,0.8)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass glass-gold rounded-3xl p-6 sm:p-8 max-w-lg w-full relative"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-[#b9a9e8] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-2xl text-gold-grad">How Obscura keeps bids private</h2>
              <p className="font-cipher text-xs text-[#b9a9e8] mt-1">
                Fully Homomorphic Encryption (FHE) on Base, via Fhenix CoFHE.
              </p>

              <div className="mt-6 space-y-4">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex gap-3"
                    >
                      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(244,197,96,0.12)", border: "1px solid rgba(244,197,96,0.3)" }}>
                        <Icon className="w-4 h-4 text-gold-bright" />
                      </div>
                      <div>
                        <div className="font-cipher text-sm text-[#f7f3ff]">{s.title}</div>
                        <p className="text-xs text-[#b9a9e8] mt-0.5 leading-relaxed">{s.body}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl px-4 py-3 font-cipher text-[11px] text-[#ffe39c]" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
                Why it matters: on a normal chain, every bid is public — bots front-run you and auctions get gamed. Obscura makes the bid itself confidential, so the auction is fair by construction.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
