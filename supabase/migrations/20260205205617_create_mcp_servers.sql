-- Migration: Create mcp_servers table
-- Description: Core table for storing MCP server metadata

-- Create the mcp_servers table
CREATE TABLE public.mcp_servers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    homepage_url text,
    repo_url text,
    docs_url text,
    tags text[] NOT NULL DEFAULT '{}',
    transport text NOT NULL,
    auth text NOT NULL,
    capabilities jsonb NOT NULL DEFAULT '{}',
    verified boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT mcp_servers_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT mcp_servers_transport_check CHECK (transport IN ('stdio', 'http', 'both')),
    CONSTRAINT mcp_servers_auth_check CHECK (auth IN ('none', 'oauth', 'api_key', 'other'))
);

-- Add table comment
COMMENT ON TABLE public.mcp_servers IS 'Registry of MCP (Model Context Protocol) servers';

-- Add column comments
COMMENT ON COLUMN public.mcp_servers.slug IS 'URL-safe unique identifier (lowercase, hyphens allowed)';
COMMENT ON COLUMN public.mcp_servers.transport IS 'Communication protocol: stdio, http, or both';
COMMENT ON COLUMN public.mcp_servers.auth IS 'Authentication method: none, oauth, api_key, or other';
COMMENT ON COLUMN public.mcp_servers.capabilities IS 'JSON object describing server capabilities (tools, resources, prompts)';
COMMENT ON COLUMN public.mcp_servers.verified IS 'Whether the server has been verified by maintainers';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.mcp_servers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for common query patterns
CREATE INDEX mcp_servers_slug_idx ON public.mcp_servers (slug);
CREATE INDEX mcp_servers_verified_idx ON public.mcp_servers (verified) WHERE verified = true;
CREATE INDEX mcp_servers_transport_idx ON public.mcp_servers (transport);
CREATE INDEX mcp_servers_auth_idx ON public.mcp_servers (auth);
CREATE INDEX mcp_servers_tags_idx ON public.mcp_servers USING GIN (tags);
CREATE INDEX mcp_servers_created_at_idx ON public.mcp_servers (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access (anon and authenticated)
CREATE POLICY "Allow public read access"
    ON public.mcp_servers
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Note: No INSERT/UPDATE/DELETE policies yet.
-- These will be added when we implement the submission workflow.
-- For now, only service_role can modify data (via migrations or admin).
