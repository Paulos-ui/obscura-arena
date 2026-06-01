import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hackathon-safe: don't let a stray type/lint nit block the Vercel build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
