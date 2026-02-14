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
    // Vercel preview deployments need additional CSP permissions
    const isVercelPreview = process.env.VERCEL_ENV === "preview";

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // Allow Vercel's live preview scripts in preview deployments
      isVercelPreview
        ? "script-src 'self' 'unsafe-inline' https://vercel.live"
        : "script-src 'self' 'unsafe-inline'",
      // Allow Supabase and Vercel live connections
      isVercelPreview
        ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live wss://ws-us3.pusher.com"
        : "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // Allow Vercel live preview iframe
      isVercelPreview ? "frame-src https://vercel.live" : "frame-src 'none'",
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
