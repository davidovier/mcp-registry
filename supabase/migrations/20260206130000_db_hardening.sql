-- Migration: DB Hardening
-- Description: Ensure pgcrypto extension and grant explicit SELECT privileges

-- ============================================================================
-- pgcrypto extension
-- ============================================================================
-- Note: In PostgreSQL 13+, gen_random_uuid() is a built-in function and does
-- not require pgcrypto. However, pgcrypto provides additional crypto functions.
-- Supabase has pgcrypto pre-installed, so this is mostly for documentation.
-- Using the default schema (public) ensures visibility without search_path issues.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- Explicit grants for defense-in-depth
-- ============================================================================
-- RLS policies control row-level access, but explicit grants ensure the
-- underlying table is accessible at all. This prevents issues on some
-- Postgres configurations.
GRANT SELECT ON public.mcp_servers TO anon;
GRANT SELECT ON public.mcp_servers TO authenticated;

-- Update table comment
COMMENT ON TABLE public.mcp_servers IS 'Registry of MCP servers. Public read access via RLS. Write access controlled by admin/service_role only.';
