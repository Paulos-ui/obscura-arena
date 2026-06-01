"use client";

import { Wallet, LogOut, AlertTriangle } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { shortAddr } from "../lib/fx";

/**
 * Plain-wagmi wallet button — no OnchainKit / Coinbase API key required.
 * Connects via the injected (MetaMask) connector. Chain switching is manual
 * (a button), never an auto-loop.
 */
export function ConnectWalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const handleConnect = () => {
    const injected =
      connectors.find((c) => c.id === "injected") ??
      connectors.find((c) => c.type === "injected") ??
      connectors[0];
    if (injected) connect({ connector: injected });
  };

  if (!isConnected) {
    return (
      <button onClick={handleConnect} disabled={isPending} className="btn-gold rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
        <Wallet className="w-3.5 h-3.5" />
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  const wrongChain = chainId !== baseSepolia.id;

  return (
    <div className="flex items-center gap-2">
      {wrongChain ? (
        <button onClick={() => switchChain?.({ chainId: baseSepolia.id })} className="btn-ghost rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#fca5a5", borderColor: "rgba(239,68,68,0.5)" }}>
          <AlertTriangle className="w-3.5 h-3.5" /> Switch to Base Sepolia
        </button>
      ) : (
        <span className="font-cipher text-xs px-3 py-2 rounded-full" style={{ background: "rgba(244,197,96,0.12)", border: "1px solid rgba(244,197,96,0.35)", color: "#ffe39c" }}>
          {shortAddr(address)}
        </span>
      )}
      <button onClick={() => disconnect()} className="btn-ghost rounded-full p-2" title="Disconnect">
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
