/**
 * Environment variable validation and access.
 *
 * This module provides type-safe access to environment variables
 * and validates that required variables are set at build/runtime.
 */

// Client-side environment variables (NEXT_PUBLIC_* prefix)
// These are embedded into the JavaScript bundle
export const clientEnv = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "MCP Registry",
} as const;

// Server-side environment variables
// These are ONLY available in server-side code
export const serverEnv = {
  // Include client env vars for convenience
  ...clientEnv,
  // Server-only vars would go here (e.g., SUPABASE_SERVICE_ROLE_KEY)
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;

/**
 * Validates that required environment variables are set.
 * Call this at app startup (e.g., in layout.tsx or middleware).
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Please check your .env.local file."
    );
  }
}
