"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCofhe } from "../hooks/useCofhe";
import { ObscuraCrown } from "../components/ObscuraCrown";
import { StatusBar } from "../components/StatusBar";
import { HowFHEWorks } from "../components/HowFHEWorks";
import { LotsGrid } from "../components/LotsGrid";
import { AuctionRoom } from "../components/AuctionRoom";
import { MyPrivateBids } from "../components/MyPrivateBids";
import { HiddenKings } from "../components/HiddenKings";
import { StealthDuel } from "../components/StealthDuel";
import { Footer } from "../components/Footer";

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  useCofhe();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(14,10,28,0.95)",
            color: "#f7f3ff",
            border: "1px solid rgba(244,197,96,0.4)",
            fontFamily: "var(--font-cipher)",
            fontSize: "13px",
            borderRadius: "12px",
          },
        }}
      />

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <StatusBar />

        {/* Hero */}
        <section className="flex flex-col items-center text-center pt-4 pb-2">
          <ObscuraCrown size={130} />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl text-gold-grad mt-2 tracking-tight"
          >
            OBSCURA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-cipher text-sm sm:text-base text-[#b9a9e8] mt-3 max-w-md"
          >
            Confidential sealed-bid auctions on Base. Bid in the dark, settle in the light — losing bids stay encrypted forever.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-4 flex items-center gap-3 flex-wrap justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold glass font-cipher text-xs text-gold-bright uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5 shimmer rounded-full" /> On-chain · Fully Encrypted
            </span>
            <HowFHEWorks />
          </motion.div>
        </section>

        <LotsGrid />

        <div id="auction-room" className="scroll-mt-6">
          <AuctionRoom />
        </div>

        <MyPrivateBids />

        <div className="grid lg:grid-cols-2 gap-6">
          <HiddenKings />
          <StealthDuel />
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
