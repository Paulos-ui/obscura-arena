"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Crown, KeyRound, Lock, Sparkles, X } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import type { Abi } from "viem";
import { cofhejs, FheTypes } from "cofhejs/web";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/deployedContracts";
import { usePermit } from "../hooks/usePermit";
import { useCofheStore } from "../store/cofheStore";
import { royalConfetti, cipherString } from "../lib/fx";

const AUCTION_ID = 0n;
const addr = CONTRACT_ADDRESS as `0x${string}`;

export function MyPrivateBids() {
  const { address, isConnected } = useAccount();
  const { isInitialized } = useCofheStore();
  const { hasValidPermit } = usePermit();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ceremony, setCeremony] = useState(false);

  const configured = addr && addr.length === 42;

  const { data: myBidHandle } = useReadContract({
    address: addr,
    abi: CONTRACT_ABI as Abi,
    functionName: "getMyEncryptedBid",
    args: [AUCTION_ID],
    account: address,
    query: { enabled: !!configured && !!address },
  });

  const hasBid = !!myBidHandle && (myBidHandle as bigint) !== 0n;

  const decrypt = useCallback(async () => {
    if (!hasBid || busy) return;
    if (!hasValidPermit) {
      toast.error("Sign a permit first to unseal your private bid.");
      return;
    }
    setBusy(true);
    try {
      const res = await cofhejs.unseal(myBidHandle as bigint, FheTypes.Uint128);
      if (res.success) {
        setRevealed(res.data!.toString());
        setCeremony(true);
        royalConfetti();
        setTimeout(royalConfetti, 350);
      } else {
        toast.error("Not permitted to decrypt this bid.");
      }
    } catch {
      toast.error("Decryption failed.");
    } finally {
      setBusy(false);
    }
  }, [hasBid, busy, hasValidPermit, myBidHandle]);

  const ready = isConnected && isInitialized;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-3xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-gold-bright" />
        <h3 className="font-display text-xl text-gold-grad">My Private Bids</h3>
        <span className="ml-auto text-[11px] font-cipher text-[#7e74a3] uppercase tracking-wider">owner-only</span>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "rgba(7,5,13,0.5)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-cipher text-sm text-[#f7f3ff]">Genesis Crown — Lot #001</div>
            <div className="mt-1.5 font-cipher text-sm flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#a855f7]" />
              {revealed ? (
                <span className="text-gold-grad">{revealed} ⚜</span>
              ) : (
                <span className="text-[#a855f7] cipher-blur">0x{cipherString(myBidHandle as bigint, 14)}</span>
              )}
            </div>
          </div>
          <button
            onClick={decrypt}
            disabled={!ready || !hasBid || busy}
            className="btn-gold rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 disabled:opacity-40"
          >
            {busy ? "Unsealing…" : "Decrypt"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-[#7e74a3]">
          {hasBid
            ? "Only you can decrypt this — it never leaves encryption for anyone else."
            : ready
            ? "No sealed bid yet. Place one in the auction above."
            : "Connect and initialize CoFHE to view your private bids."}
        </p>
      </div>

      {/* Dramatic reveal ceremony */}
      <AnimatePresence>
        {ceremony && revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCeremony(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,4,9,0.85)", backdropFilter: "blur(8px)" }}
          >
            {/* Rotating light beams */}
            <motion.div
              className="absolute w-[140vmax] h-[140vmax] pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(244,197,96,0.12) 14deg, transparent 28deg, rgba(168,85,247,0.12) 42deg, transparent 56deg, rgba(244,197,96,0.12) 70deg, transparent 84deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass glass-gold rounded-3xl p-10 text-center max-w-sm w-full"
            >
              <button onClick={() => setCeremony(false)} className="absolute top-4 right-4 text-[#b9a9e8] hover:text-white">
                <X className="w-5 h-5" />
              </button>

              {/* Crown rising */}
              <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
              >
                <Crown className="w-16 h-16 text-gold-bright mx-auto glow-gold" />
              </motion.div>

              {/* Radiating particles */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{ background: i % 2 ? "#f4c560" : "#a855f7", boxShadow: "0 0 10px currentColor" }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: Math.cos(angle) * 150, y: Math.sin(angle) * 150, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  />
                );
              })}

              <div className="font-cipher text-xs uppercase tracking-[0.3em] text-[#b9a9e8] mt-5">Decrypted · for your eyes only</div>
              <motion.div
                initial={{ filter: "blur(14px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display text-5xl text-gold-grad mt-2"
              >
                {revealed} ⚜
              </motion.div>
              <div className="font-cipher text-xs text-[#e9e2ff] mt-3 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-royal" /> Your sealed bid on the Genesis Crown
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
