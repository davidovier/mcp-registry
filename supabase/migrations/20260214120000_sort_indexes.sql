-- ============================================================================
-- Migration: Sort Indexes for Verified-First Ranking + Sort Toggle
-- ============================================================================
-- Sprint 12: Adds indexes to support newest and name sorting modes.
-- The existing idx_mcp_servers_listing_order already covers verified DESC sorting.

-- Index for "newest" sort: ORDER BY created_at DESC, id DESC
CREATE INDEX IF NOT EXISTS idx_mcp_servers_newest
ON public.mcp_servers (created_at DESC, id DESC);

-- Index for "name" sort: ORDER BY name ASC, id ASC
CREATE INDEX IF NOT EXISTS idx_mcp_servers_name
ON public.mcp_servers (name ASC, id ASC);

-- Comments for documentation
COMMENT ON INDEX public.idx_mcp_servers_newest IS 'Supports sorting by newest first with keyset pagination';
COMMENT ON INDEX public.idx_mcp_servers_name IS 'Supports alphabetical sorting with keyset pagination';
