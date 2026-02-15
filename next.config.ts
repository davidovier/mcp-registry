import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,
  poweredByHeader: false,

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
  async headers() {
    // Vercel deployments need additional CSP permissions for Vercel Live features
    const isVercel = !!process.env.VERCEL;
    const isDev = process.env.NODE_ENV === "development";

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // Allow Vercel's live preview scripts on Vercel deployments
      // In development, allow unsafe-eval for testing tools
      isVercel
        ? "script-src 'self' 'unsafe-inline' https://vercel.live"
        : isDev
          ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
          : "script-src 'self' 'unsafe-inline'",
      // Allow Supabase and Vercel live connections
      isVercel
        ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live wss://ws-us3.pusher.com"
        : "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // Allow Vercel live preview iframe
      isVercel ? "frame-src https://vercel.live" : "frame-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
