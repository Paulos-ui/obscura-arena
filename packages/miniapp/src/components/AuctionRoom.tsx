"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Crown, Lock, Eye, Gavel, Sparkles, Users, Timer } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Abi } from "viem";
import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/deployedContracts";
import { useCofheStore } from "../store/cofheStore";
import { usePermit } from "../hooks/usePermit";
import { royalConfetti, cipherString, fmtCountdown, shortAddr } from "../lib/fx";

const AUCTION_ID = 0n;
const addr = CONTRACT_ADDRESS as `0x${string}`;

type AuctionTuple = [string, string, bigint, boolean, boolean, number, bigint, string];

export function AuctionRoom() {
  const { address, isConnected } = useAccount();
  const { isInitialized } = useCofheStore();
  const { hasValidPermit } = usePermit();

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [sealing, setSealing] = useState(false);
  const [revealedBid, setRevealedBid] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [ceremony, setCeremony] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const configured = addr && addr.length === 42;

  const { data: auction, refetch: refetchAuction } = useReadContract({
    address: addr,
    abi: CONTRACT_ABI as Abi,
    functionName: "getAuction",
    args: [AUCTION_ID],
    query: { enabled: !!configured, refetchInterval: 8000 },
  });

  const { data: sealedBid, refetch: refetchSealed } = useReadContract({
    address: addr,
    abi: CONTRACT_ABI as Abi,
    functionName: "getSealedHighestBid",
    args: [AUCTION_ID],
    query: { enabled: !!configured },
  });

  const { data: myBidHandle, refetch: refetchMine } = useReadContract({
    address: addr,
    abi: CONTRACT_ABI as Abi,
    functionName: "getMyEncryptedBid",
    args: [AUCTION_ID],
    account: address,
    query: { enabled: !!configured && !!address },
  });

  const a = auction as AuctionTuple | undefined;
  const title = a?.[0] ?? "Genesis Crown — Sealed Lot #001";
  const endTime = a ? Number(a[2]) : now + 86400;
  const settled = a?.[3] ?? false;
  const revealReady = a?.[4] ?? false;
  const bidderCount = a ? Number(a[5]) : 0;
  const revealedAmount = a?.[6] ?? 0n;
  const revealedWinner = a?.[7] ?? "";
  const secondsLeft = endTime - now;
  const ended = secondsLeft <= 0;

  useEffect(() => {
    if (revealReady && !ceremony) {
      setCeremony(true);
      royalConfetti();
      setTimeout(royalConfetti, 350);
    }
  }, [revealReady, ceremony]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refetchAuction(), refetchSealed(), refetchMine()]);
  }, [refetchAuction, refetchSealed, refetchMine]);

  // ---- Reveal MY OWN bid (client-side unseal via permit) ----
  const revealMyBid = useCallback(async () => {
    if (!myBidHandle || decrypting) return;
    if (!hasValidPermit) {
      toast.error("Sign a permit first to unseal your private bid.");
      return;
    }
    setDecrypting(true);
    try {
      const res = await cofhejs.unseal(myBidHandle as bigint, FheTypes.Uint128);
      if (res.success) {
        setRevealedBid(res.data!.toString());
        toast.success("Your sealed bid, decrypted only for you.");
      } else {
        toast.error("Not permitted to decrypt — place a bid first.");
      }
    } catch {
      toast.error("Decryption failed.");
    } finally {
      setDecrypting(false);
    }
  }, [myBidHandle, decrypting, hasValidPermit]);

  const ready = isConnected && isInitialized && hasValidPermit && configured;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass glass-gold rounded-3xl p-6 sm:p-8 relative overflow-hidden"
    >
      {!configured && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm font-cipher" style={{ background: "rgba(244,197,96,0.1)", border: "1px solid rgba(244,197,96,0.35)", color: "#ffe39c" }}>
          ⚠ Set CONTRACT_ADDRESS in src/contracts/deployedContracts.ts after deploying to Base Sepolia.
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-cipher text-[#b9a9e8] uppercase tracking-[0.2em]">
            <Crown className="w-4 h-4 text-gold-bright" /> Featured Sealed Lot
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-gold-grad mt-1">{title}</h2>
        </div>
        <div className="flex items-center gap-4 font-cipher text-sm">
          <span className="flex items-center gap-1.5 text-[#e9e2ff]"><Users className="w-4 h-4 text-royal" /> {bidderCount} sealed</span>
          <span className={`flex items-center gap-1.5 ${ended ? "text-red-400" : "text-gold-bright"}`}>
            <Timer className="w-4 h-4" /> {fmtCountdown(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Sealed highest bid (public, encrypted) */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(7,5,13,0.55)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <div className="flex items-center gap-2 text-xs font-cipher text-[#b9a9e8] uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Highest bid · on-chain
          </div>
          <div className="mt-3 font-cipher text-xl text-[#a855f7] cipher-blur">0x{cipherString(sealedBid as bigint)}</div>
          <p className="mt-2 text-[11px] text-[#7e74a3]">Encrypted for everyone. Even the contract can&apos;t read it.</p>
        </div>

        {/* My private bid */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(244,197,96,0.06)", border: "1px solid rgba(244,197,96,0.25)" }}>
          <div className="flex items-center gap-2 text-xs font-cipher text-gold-bright uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Your bid · private
          </div>
          <div className="mt-3 font-cipher text-xl">
            {revealedBid ? (
              <motion.span initial={{ filter: "blur(8px)", opacity: 0 }} animate={{ filter: "blur(0px)", opacity: 1 }} className="text-gold-grad">
                {revealedBid} ⚜
              </motion.span>
            ) : (
              <span className="text-[#a855f7] cipher-blur">0x{cipherString(myBidHandle as bigint, 14)}</span>
            )}
          </div>
          <button onClick={revealMyBid} disabled={!myBidHandle || decrypting} className="btn-ghost rounded-lg px-3 py-1.5 mt-3 text-xs font-semibold uppercase tracking-wider">
            {decrypting ? "Unsealing…" : "Reveal my crown"}
          </button>
        </div>
      </div>

      {/* Bid input */}
      <SealBidRow ready={!!ready} ended={ended} onSealing={setSealing} onDone={refreshAll} />

      {/* Settlement / reveal ceremony */}
      {ended && !revealReady && (
        <SettlementRow settled={settled} onDone={refreshAll} />
      )}

      <AnimatePresence>
        {revealReady && ceremony && (
          <RevealCeremony amount={revealedAmount} winner={revealedWinner} />
        )}
      </AnimatePresence>

      {/* Flying-orb seal animation overlay */}
      <AnimatePresence>{sealing && <SealOverlay />}</AnimatePresence>
    </motion.section>
  );
}

/* ---------------- Seal a bid ---------------- */
function SealBidRow({
  ready,
  ended,
  onSealing,
  onDone,
}: {
  ready: boolean;
  ended: boolean;
  onSealing: (v: boolean) => void;
  onDone: () => void;
}) {
  const [bid, setBid] = useState("");
  const [busy, setBusy] = useState(false);
  const { writeContract, data: hash, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Bid sealed into the vault.");
      setBid("");
      setBusy(false);
      setTimeout(() => onSealing(false), 1400);
      setTimeout(() => {
        onDone();
        reset();
      }, 1500);
    }
  }, [isSuccess, onSealing, onDone, reset]);

  const handleSeal = useCallback(async () => {
    if (!bid || busy) return;
    try {
      setBusy(true);
      onSealing(true);
      const enc = await cofhejs.encrypt([Encryptable.uint128(BigInt(bid))] as const);
      const encBid = enc.data?.[0];
      if (!encBid) {
        toast.error("Encryption failed — is CoFHE initialized?");
        setBusy(false);
        onSealing(false);
        return;
      }
      writeContract(
        { address: addr, abi: CONTRACT_ABI as Abi, functionName: "placeBid", args: [AUCTION_ID, encBid] },
        {
          onError: () => {
            toast.error("Bid cancelled or failed.");
            setBusy(false);
            onSealing(false);
          },
        }
      );
    } catch {
      toast.error("Could not seal bid.");
      setBusy(false);
      onSealing(false);
    }
  }, [bid, busy, writeContract, onSealing]);

  const pending = busy || confirming;

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          min={1}
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          placeholder="Your secret bid (units)"
          disabled={!ready || ended}
          className="obscura-input flex-1 rounded-xl px-4 py-3 font-cipher text-sm disabled:opacity-50"
        />
        <button
          onClick={handleSeal}
          disabled={pending || !ready || ended || !bid}
          className="btn-gold rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm whitespace-nowrap flex items-center justify-center gap-2"
        >
          {pending && <span className="w-4 h-4 border-2 border-[#1a1205] border-t-transparent rounded-full animate-spin" />}
          <Lock className="w-4 h-4" /> Seal Bid
        </button>
      </div>
      {!ready && !ended && (
        <p className="mt-2 text-[11px] text-[#7e74a3] font-cipher">Connect · initialize CoFHE · sign a permit to bid.</p>
      )}
    </div>
  );
}

/* ---------------- Settlement ---------------- */
function SettlementRow({ settled, onDone }: { settled: boolean; onDone: () => void }) {
  const fn = settled ? "finalizeReveal" : "settle";
  const { writeContract, data: hash, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      toast.success(settled ? "Decrypted result finalized." : "Settlement requested — threshold decrypting…");
      setBusy(false);
      setTimeout(() => {
        onDone();
        reset();
      }, 1500);
    }
  }, [isSuccess, settled, onDone, reset]);

  const handleSettle = () => {
    setBusy(true);
    writeContract(
      { address: addr, abi: CONTRACT_ABI as Abi, functionName: fn, args: [AUCTION_ID] },
      { onError: () => setBusy(false) }
    );
  };

  const pending = busy || confirming;

  return (
    <div className="mt-5">
      <button onClick={handleSettle} disabled={pending} className="btn-ghost rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm w-full flex items-center justify-center gap-2">
        {pending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        <Gavel className="w-4 h-4" /> {settled ? "Finalize Reveal" : "Settle Auction"}
      </button>
      <p className="mt-2 text-[11px] text-[#7e74a3] font-cipher text-center">
        {settled ? "Decryption may take a few blocks. Click again if not ready." : "Only the winning amount + winner are ever decrypted. Losing bids stay sealed forever."}
      </p>
    </div>
  );
}

/* ---------------- Reveal ceremony ---------------- */
function RevealCeremony({ amount, winner }: { amount: bigint; winner: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-6 rounded-3xl p-8 text-center relative overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 0%, rgba(244,197,96,0.18), rgba(7,5,13,0.6))", border: "1px solid rgba(244,197,96,0.45)" }}
    >
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }}>
        <Crown className="w-12 h-12 text-gold-bright mx-auto glow-gold" />
      </motion.div>
      <div className="font-cipher text-xs uppercase tracking-[0.3em] text-[#b9a9e8] mt-3">The Realm Reveals</div>
      <div className="font-display text-4xl text-gold-grad mt-2">{amount.toString()} ⚜</div>
      <div className="font-cipher text-sm text-[#e9e2ff] mt-2 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-royal" /> Winner: {shortAddr(winner)}
      </div>
    </motion.div>
  );
}

/* ---------------- Flying-orb seal overlay ---------------- */
function SealOverlay() {
  const orbs = useMemo(() => Array.from({ length: 14 }), []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(7,5,13,0.55)] backdrop-blur-sm" />
      {orbs.map((_, i) => {
        const angle = (i / orbs.length) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{ background: i % 2 ? "#f4c560" : "#a855f7", boxShadow: "0 0 10px currentColor" }}
            initial={{ x: Math.cos(angle) * 220, y: Math.sin(angle) * 160, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [1, 0.4] }}
            transition={{ duration: 1.1, delay: i * 0.04, ease: "easeIn" }}
          />
        );
      })}
      <motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: [0, 1.15, 1], rotate: 0 }} transition={{ delay: 0.5, type: "spring" }} className="relative z-10 font-display text-xl px-6 py-3 rounded-xl text-gold-grad glass-gold glass">
        <Lock className="w-5 h-5 inline mr-2 -mt-1 text-gold-bright" /> SEALED
      </motion.div>
    </motion.div>
  );
}
