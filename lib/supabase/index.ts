// Re-export Supabase utilities
// Import from specific files to ensure proper tree-shaking:
// - '@/lib/supabase/client' for browser components
// - '@/lib/supabase/server' for server components/routes

export type { Database, Tables, Enums } from "./types";
