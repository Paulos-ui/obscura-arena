# 👑 Obscura: Confidential Sealed-Bid Auctions on Base

> **Bid in the dark. Settle in the light.** Every bid is encrypted on-chain with Fhenix CoFHE (Fully Homomorphic Encryption). The chain computes the winner over *encrypted* bids — losing bids are never revealed, to anyone, ever.

Built on the official [`cofhe-miniapp-template`](https://github.com/FhenixProtocol/cofhe-miniapp-template) for the **Fhenix Privacy-by-Design dApp Buildathon**.

---

## Why this matters

Transparent EVM chains expose every bid, so auctions get front-run and MEV bots extract value. Obscura is the primitive that fixes it: a **sealed-bid auction** where bids are confidential *by construction*. This is exactly the "sealed-bid mechanics / confidential state" use case FHE unlocks.

## The privacy model (three views)

| View | Who sees it | What they see |
|------|-------------|---------------|
| **Sealed (public)** | Everyone | An encrypted ciphertext handle. Even the contract can't read the bid. |
| **Private (owner)** | Each bidder | Only their *own* bid, unsealed client-side via a CoFHE permit. |
| **Reveal (settlement)** | Everyone, at the end | Only the **winning amount + winner**. Losing bids stay encrypted forever. |

## The FHE flex

On every bid, the contract updates the running leader entirely on ciphertext:

```solidity
ebool isHigher   = FHE.gt(bid, highestBid);                 // encrypted comparison
highestBid       = FHE.select(isHigher, bid, highestBid);   // no plaintext exposed
winnerIndex      = FHE.select(isHigher, FHE.asEuint32(idx), winnerIndex);
```

The chain picks a winner **without ever decrypting a single bid**. At settlement, `FHE.decrypt` is called on *only* the winning amount + winner index via the CoFHE threshold network.

---

## Architecture

```
packages/
├── hardhat/
│   ├── contracts/ObscuraAuction.sol     # sealed-bid auction (replaces Counter.sol)
│   └── tasks/deploy-obscura.ts          # deploys + seeds a 24h demo auction
└── miniapp/                             # Next.js 15 + Tailwind 4 frontend
    └── src/
        ├── app/page.tsx                 # composes the experience
        ├── app/globals.css              # cyber-royal theme
        ├── components/
        │   ├── ObscuraCrown.tsx         # animated hero crown + cipher rings
        │   ├── StatusBar.tsx            # wallet · CoFHE init · permit
        │   ├── AuctionRoom.tsx          # seal bid · reveal my bid · settle ceremony
        │   ├── HiddenKings.tsx          # encrypted leaderboard
        │   └── StealthDuel.tsx          # encrypted-vs-decrypted comparison
        ├── hooks/{useCofhe,usePermit}.ts  # reused from template (cofhejs 0.3.x)
        ├── lib/fx.ts                    # confetti + cipher helpers
        └── contracts/deployedContracts.ts # ABI + deployed address
```

**Stack:** Next.js 15, React 19, Tailwind 4, wagmi/viem, OnchainKit, cofhejs, Framer Motion, react-hot-toast, lucide-react, canvas-confetti.

---

## Run it

### 1. Contracts (Base Sepolia)
```bash
cd packages/hardhat
cp .env.example .env          # add PRIVATE_KEY (throwaway, funded with Base Sepolia ETH)
pnpm install
pnpm compile                  # verify ObscuraAuction compiles against cofhe-contracts
pnpm hardhat deploy-obscura --network base-sepolia
```
Copy the printed address.

### 2. Frontend
```bash
cd ../miniapp
pnpm install
# paste the deployed address into src/contracts/deployedContracts.ts -> CONTRACT_ADDRESS
pnpm dev                      # http://localhost:3000
```

### 3. Deploy to Vercel
- Import the repo, set **Root Directory** to `packages/miniapp`.
- Framework preset: **Next.js**. Build command: `next build`.
- Add env vars from `packages/miniapp/.env` (OnchainKit / WalletConnect keys, etc.).
- Deploy. Update `NEXT_PUBLIC_URL` to the Vercel domain and redeploy if needed.

> **Note on tooling:** the template ships with `cofhejs@0.3.x`; the contract pins `@fhenixprotocol/cofhe-contracts`. If `pnpm compile` reports an unsupported op on `euint128`, switch the bid type to `euint64` (one-line change in `ObscuraAuction.sol`).

---

## 90-second demo script (for judges)

1. **Connect** wallet -> CoFHE auto-initializes -> **Sign Permit** (status pills turn gold).
2. Show the featured lot: the **highest bid is a blurred ciphertext** — "even the contract can't read this."
3. Enter a bid -> **Seal Bid**. Watch the orbs converge -> vault stamps **SEALED**. The bid went on-chain encrypted.
4. **Reveal My Crown** -> your bid unseals *locally* — only you can see it. The public handle stays sealed.
5. Open **Stealth Duel** -> toggle Decrypt: "this comparison runs on encrypted data via FHE.gt."
6. When the timer ends -> **Settle** -> **Finalize Reveal** -> throne rises, confetti, only the winner + amount appear. Losing bids never revealed.

---

## AI / template disclosure

This project starts from Fhenix's official `cofhe-miniapp-template`. The `ObscuraAuction` contract and the redesigned frontend were built for this Buildathon. Check the submission form for any required AI-assistance disclosure and fill it in honestly.

## License
MIT.
