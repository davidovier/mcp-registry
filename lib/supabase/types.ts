/**
 * Database types for Supabase.
 *
 * This file should be regenerated when the database schema changes.
 * Run: pnpm supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 *
 * For now, we use a placeholder type that can be extended as needed.
 */

// Placeholder database type - will be replaced with generated types
// when the database schema is created
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Export common helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
