import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Optimize images from external sources if needed later
  images: {
    remotePatterns: [],
  },

  // Environment variables that should be available on the client
  // Only NEXT_PUBLIC_* variables are exposed to the browser
  env: {
    // App metadata
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "MCP Registry",
  },
};

export default nextConfig;
