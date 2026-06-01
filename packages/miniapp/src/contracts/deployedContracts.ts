// Auto-authored ABI for ObscuraAuction (sealed-bid confidential auctions).
// After deploying with `hardhat deploy-obscura --network base-sepolia`,
// paste the deployed address into CONTRACT_ADDRESS below.

const InEuint128 = {
  components: [
    { internalType: "uint256", name: "ctHash", type: "uint256" },
    { internalType: "uint8", name: "securityZone", type: "uint8" },
    { internalType: "uint8", name: "utype", type: "uint8" },
    { internalType: "bytes", name: "signature", type: "bytes" },
  ],
  internalType: "struct InEuint128",
  name: "encBid",
  type: "tuple",
} as const;

export const CONTRACT_ABI = [
  { inputs: [], name: "auctionCount", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint64", name: "durationSeconds", type: "uint64" },
    ],
    name: "createAuction",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, InEuint128],
    name: "placeBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "settle", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "finalizeReveal", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getAuction",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint64", name: "endTime", type: "uint64" },
      { internalType: "bool", name: "settled", type: "bool" },
      { internalType: "bool", name: "revealReady", type: "bool" },
      { internalType: "uint32", name: "bidderCount", type: "uint32" },
      { internalType: "uint256", name: "revealedAmount", type: "uint256" },
      { internalType: "address", name: "revealedWinner", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "getSealedHighestBid", outputs: [{ internalType: "euint128", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "getMyEncryptedBid", outputs: [{ internalType: "euint128", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "address", name: "who", type: "address" }],
    name: "hasBid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "uint64", name: "endTime", type: "uint64" },
    ],
    name: "AuctionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "AuctionRevealed",
    type: "event",
  },
];

// Paste your deployed Base Sepolia address here after running deploy-obscura.
export const CONTRACT_ADDRESS = "0xec3CF665A061B4a86Ff9811f8e611C701079CC8F";
