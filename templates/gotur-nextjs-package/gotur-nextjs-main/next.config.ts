import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mjs|cjs)$/,
      type: 'javascript/auto',
    });
    return config;
  },
  /* config options here */
  reactStrictMode: false,
};

export default nextConfig;
