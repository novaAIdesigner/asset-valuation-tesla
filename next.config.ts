import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath: '/asset-valuation-tesla', // Uncomment if deploying to https://<user>.github.io/asset-valuation-tesla
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
