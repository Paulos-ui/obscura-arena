const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Obscura",
    subtitle: "Confidential sealed-bid auctions",
    description: "Private throne auctions on Base. Bid encrypted, reveal only the winner — powered by Fhenix FHE.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#011623",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["fhenix", "fhe", "encryption", "privacy", "defi"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Bid in the dark.",
    ogTitle: "Fhenix MiniApp Demo",
    ogDescription:
      "Experience confidential computing powered by Fully Homomorphic Encryption",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
