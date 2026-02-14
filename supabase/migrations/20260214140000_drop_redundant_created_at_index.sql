-- ============================================================================
-- Migration: Drop Redundant Index
-- ============================================================================
-- Sprint 12 added idx_mcp_servers_newest (created_at DESC, id DESC) which
-- covers all use cases of the older single-column index.
-- This migration removes the redundant index to reduce write overhead.

DROP INDEX IF EXISTS public.mcp_servers_created_at_idx;

-- Note: idx_mcp_servers_newest remains and covers:
-- - ORDER BY created_at DESC, id DESC (keyset pagination for "newest" sort)
-- - Simple created_at DESC queries (prefix of composite index)
