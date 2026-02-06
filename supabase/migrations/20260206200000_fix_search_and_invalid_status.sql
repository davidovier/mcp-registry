-- ============================================================================
-- Migration: Fix Search Index + Add Invalid Status
-- ============================================================================
-- 1. Drop unused FTS index (we use ILIKE for search, not full-text search)
-- 2. Add 'invalid' status for submissions that fail validation

-- Drop the FTS index since we use ILIKE for search
-- This simplifies the codebase and avoids maintaining an unused index
DROP INDEX IF EXISTS idx_mcp_servers_search;

-- Add trigram index for ILIKE search performance (optional enhancement)
-- This uses pg_trgm extension if available
DO $$
BEGIN
  -- Only create if pg_trgm extension is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS idx_mcp_servers_name_trgm
    ON public.mcp_servers USING gin (name gin_trgm_ops);

    CREATE INDEX IF NOT EXISTS idx_mcp_servers_description_trgm
    ON public.mcp_servers USING gin (description gin_trgm_ops);
  END IF;
END $$;

-- Update the status check constraint to include 'invalid'
-- First drop the existing constraint, then add the new one
ALTER TABLE public.mcp_server_submissions
DROP CONSTRAINT IF EXISTS mcp_server_submissions_status_check;

ALTER TABLE public.mcp_server_submissions
ADD CONSTRAINT mcp_server_submissions_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'invalid'));

-- Add comment for documentation
COMMENT ON CONSTRAINT mcp_server_submissions_status_check
ON public.mcp_server_submissions IS
'Valid statuses: pending (awaiting review), approved (accepted), rejected (declined by admin), invalid (failed validation)';
