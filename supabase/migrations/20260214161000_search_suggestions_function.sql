-- ============================================================================
-- Migration: Search Suggestions RPC Function
-- ============================================================================
-- Sprint 14: Search Intelligence & Discovery Layer
-- Provides "did you mean" suggestions using trigram similarity matching.

-- Drop existing function if it exists (for idempotency)
DROP FUNCTION IF EXISTS public.suggest_servers;

-- Create the suggest_servers function
-- Returns server suggestions based on trigram similarity to the query
CREATE OR REPLACE FUNCTION public.suggest_servers(
  p_query text,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  name text,
  slug text,
  similarity real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_query text;
BEGIN
  -- Return empty if query is null or empty
  IF p_query IS NULL OR trim(p_query) = '' THEN
    RETURN;
  END IF;

  -- Normalize the query: trim and lowercase
  normalized_query := lower(trim(p_query));

  RETURN QUERY
  SELECT
    s.name,
    s.slug,
    similarity(lower(s.name), normalized_query) AS similarity
  FROM mcp_servers s
  WHERE similarity(lower(s.name), normalized_query) >= 0.25
  ORDER BY
    similarity(lower(s.name), normalized_query) DESC,
    s.verified DESC,
    s.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.suggest_servers TO anon;
GRANT EXECUTE ON FUNCTION public.suggest_servers TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.suggest_servers IS 'Returns server name suggestions based on trigram similarity. Used for "did you mean" feature when FTS returns no results.';
