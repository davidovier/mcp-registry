-- ============================================================================
-- Migration: Pagination Indexes + Schema Version
-- ============================================================================
-- Adds indexes for efficient cursor-based pagination and schema versioning.

-- Index for the primary listing order: verified DESC, created_at DESC, id DESC
-- This supports efficient cursor-based pagination with stable ordering
CREATE INDEX IF NOT EXISTS idx_mcp_servers_listing_order
ON public.mcp_servers (verified DESC, created_at DESC, id DESC);

-- Index for filtered queries by transport
CREATE INDEX IF NOT EXISTS idx_mcp_servers_transport
ON public.mcp_servers (transport);

-- Index for filtered queries by auth
CREATE INDEX IF NOT EXISTS idx_mcp_servers_auth
ON public.mcp_servers (auth);

-- Index for text search on name and description (using GIN for better performance)
CREATE INDEX IF NOT EXISTS idx_mcp_servers_search
ON public.mcp_servers USING gin (to_tsvector('english', name || ' ' || description));

-- Add schema_version to track the validation schema used for submissions
ALTER TABLE public.mcp_server_submissions
ADD COLUMN IF NOT EXISTS schema_version text DEFAULT 'v1';

-- Add validation_errors to store any validation issues (for audit purposes)
ALTER TABLE public.mcp_server_submissions
ADD COLUMN IF NOT EXISTS validation_errors jsonb DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.mcp_server_submissions.schema_version IS 'Version of the listing schema used for validation (e.g., v1)';
COMMENT ON COLUMN public.mcp_server_submissions.validation_errors IS 'Any validation errors encountered during submission (for audit)';
