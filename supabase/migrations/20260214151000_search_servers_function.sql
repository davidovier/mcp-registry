-- ============================================================================
-- Migration: Search Servers RPC Function
-- ============================================================================
-- Sprint 13: Creates an RPC function for FTS search with ranking and pagination.
-- This function handles all the complexity of ranked search with keyset pagination.

-- Drop existing function if it exists (for idempotency)
DROP FUNCTION IF EXISTS public.search_servers;

-- Create the search_servers function
-- Returns servers matching the search query with FTS ranking
CREATE OR REPLACE FUNCTION public.search_servers(
  search_query text,
  sort_mode text DEFAULT 'verified',
  transport_filter text DEFAULT NULL,
  auth_filter text DEFAULT NULL,
  verified_filter boolean DEFAULT NULL,
  tag_filters text[] DEFAULT NULL,
  result_limit int DEFAULT 21,
  -- Cursor fields (NULL if no cursor)
  cursor_verified boolean DEFAULT NULL,
  cursor_rank real DEFAULT NULL,
  cursor_created_at timestamptz DEFAULT NULL,
  cursor_name text DEFAULT NULL,
  cursor_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  description text,
  homepage_url text,
  repo_url text,
  docs_url text,
  tags text[],
  transport text,
  auth text,
  capabilities jsonb,
  verified boolean,
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid,
  rank real
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  tsquery tsquery;
BEGIN
  -- Parse the search query
  tsquery := plainto_tsquery('english', search_query);

  RETURN QUERY
  WITH ranked_servers AS (
    SELECT
      s.*,
      ts_rank_cd(s.search_document, tsquery) as computed_rank
    FROM mcp_servers s
    WHERE s.search_document @@ tsquery
      -- Apply optional filters
      AND (transport_filter IS NULL OR s.transport = transport_filter)
      AND (auth_filter IS NULL OR s.auth = auth_filter)
      AND (verified_filter IS NULL OR s.verified = verified_filter)
      AND (tag_filters IS NULL OR s.tags @> tag_filters)
  )
  SELECT
    r.id,
    r.slug,
    r.name,
    r.description,
    r.homepage_url,
    r.repo_url,
    r.docs_url,
    r.tags,
    r.transport,
    r.auth,
    r.capabilities,
    r.verified,
    r.created_at,
    r.updated_at,
    r.owner_id,
    r.computed_rank as rank
  FROM ranked_servers r
  WHERE
    -- Apply cursor filter based on sort mode
    CASE
      WHEN cursor_id IS NULL THEN true
      WHEN sort_mode = 'verified' THEN
        -- Order: verified DESC, rank DESC, created_at DESC, id DESC
        (r.verified, r.computed_rank, r.created_at, r.id) <
        (cursor_verified, cursor_rank, cursor_created_at, cursor_id)
      WHEN sort_mode = 'newest' THEN
        -- Order: rank DESC, created_at DESC, id DESC
        (r.computed_rank, r.created_at, r.id) <
        (cursor_rank, cursor_created_at, cursor_id)
      WHEN sort_mode = 'name' THEN
        -- Order: rank DESC, name ASC, id ASC
        -- This is trickier because of mixed directions
        (r.computed_rank < cursor_rank) OR
        (r.computed_rank = cursor_rank AND r.name > cursor_name) OR
        (r.computed_rank = cursor_rank AND r.name = cursor_name AND r.id > cursor_id)
      ELSE true
    END
  ORDER BY
    CASE WHEN sort_mode = 'verified' THEN r.verified END DESC NULLS LAST,
    CASE WHEN sort_mode IN ('verified', 'newest', 'name') THEN r.computed_rank END DESC,
    CASE WHEN sort_mode IN ('verified', 'newest') THEN r.created_at END DESC,
    CASE WHEN sort_mode = 'name' THEN r.name END ASC,
    CASE
      WHEN sort_mode IN ('verified', 'newest') THEN r.id
    END DESC,
    CASE
      WHEN sort_mode = 'name' THEN r.id
    END ASC
  LIMIT result_limit;
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION public.search_servers IS 'Full-text search for MCP servers with ranking and keyset pagination. Used by /api/servers when q param is present.';
