"use client";

import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Loader2, Lock } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useCofhe } from "../hooks/useCofhe";
import { usePermit } from "../hooks/usePermit";
import { useCofheStore } from "../store/cofheStore";

function Pill({
  active,
  loading,
  icon,
  label,
}: {
  active: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-cipher"
      style={{
        background: active ? "rgba(244,197,96,0.12)" : "rgba(139,92,246,0.08)",
        border: `1px solid ${active ? "rgba(244,197,96,0.4)" : "rgba(139,92,246,0.25)"}`,
        color: active ? "#ffe39c" : "#b9a9e8",
      }}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </div>
  );
}

export function StatusBar() {
  const { isConnected } = useAccount();
  const { isInitializing } = useCofhe();
  const { isInitialized } = useCofheStore();
  const { hasValidPermit, isGeneratingPermit, generatePermit } = usePermit();

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Pill
          active={isConnected}
          icon={<Lock className="w-3.5 h-3.5" />}
          label={isConnected ? "WALLET LINKED" : "WALLET"}
        />
        <Pill
          active={isInitialized}
          loading={isInitializing}
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label={isInitialized ? "CoFHE READY" : "CoFHE INIT"}
        />
        <Pill
          active={hasValidPermit}
          loading={isGeneratingPermit}
          icon={<KeyRound className="w-3.5 h-3.5" />}
          label={hasValidPermit ? "PERMIT ACTIVE" : "NO PERMIT"}
        />
      </div>

      <div className="flex items-center gap-2">
        {isConnected && isInitialized && !hasValidPermit && (
          <button
            onClick={() => generatePermit()}
            disabled={isGeneratingPermit}
            className="btn-ghost rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider"
          >
            {isGeneratingPermit ? "Signing…" : "Sign Permit"}
          </button>
        )}
        <ConnectWalletButton />
      </div>
    </motion.div>
  );
}
