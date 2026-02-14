-- ============================================================================
-- Migration: Full-Text Search (FTS) for MCP Servers
-- ============================================================================
-- Sprint 13: Implements Postgres FTS with ranked results for improved search.
-- Uses a trigger-based approach since to_tsvector('english', ...) is not immutable.

-- Add tsvector column for full-text search
ALTER TABLE public.mcp_servers
ADD COLUMN search_document tsvector;

-- Create function to update the search document
-- Combines name (weighted A), description (weighted B), and tags (weighted C)
CREATE OR REPLACE FUNCTION public.mcp_servers_update_search_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_document :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;

-- Create trigger to maintain search_document on INSERT and UPDATE
CREATE TRIGGER trg_mcp_servers_search_document
BEFORE INSERT OR UPDATE OF name, description, tags
ON public.mcp_servers
FOR EACH ROW
EXECUTE FUNCTION public.mcp_servers_update_search_document();

-- Backfill existing rows
UPDATE public.mcp_servers SET
  search_document =
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C');

-- Create GIN index for fast FTS queries
CREATE INDEX idx_mcp_servers_search_document
ON public.mcp_servers
USING GIN (search_document);

-- Comments for documentation
COMMENT ON COLUMN public.mcp_servers.search_document IS 'tsvector for full-text search. Combines name (A), description (B), and tags (C) with weights. Maintained by trigger.';
COMMENT ON INDEX public.idx_mcp_servers_search_document IS 'GIN index for full-text search on search_document column';
COMMENT ON FUNCTION public.mcp_servers_update_search_document IS 'Trigger function to maintain search_document tsvector column';
