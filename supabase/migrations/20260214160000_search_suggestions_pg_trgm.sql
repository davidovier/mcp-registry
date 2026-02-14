-- ============================================================================
-- Migration: Enable pg_trgm for Similarity Search
-- ============================================================================
-- Sprint 14: Search Intelligence & Discovery Layer
-- Enables trigram-based similarity matching for "did you mean" suggestions.

-- Enable pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index on name column for fast similarity queries
-- This enables efficient fuzzy matching even on large datasets
CREATE INDEX IF NOT EXISTS idx_mcp_servers_name_trgm
ON public.mcp_servers
USING gin (name gin_trgm_ops);

-- Comments for documentation
COMMENT ON INDEX public.idx_mcp_servers_name_trgm IS 'GIN trigram index on name column for fuzzy/similarity search. Used by suggest_servers RPC.';
