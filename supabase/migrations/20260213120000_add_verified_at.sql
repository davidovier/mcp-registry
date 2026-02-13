-- Migration: Add verified_at timestamp
-- Description: Add verified_at column to track when a server was verified

ALTER TABLE public.mcp_servers
ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Add index for efficient queries on verified servers by date
CREATE INDEX IF NOT EXISTS idx_mcp_servers_verified_at
ON public.mcp_servers (verified_at)
WHERE verified_at IS NOT NULL;

COMMENT ON COLUMN public.mcp_servers.verified_at IS
    'Timestamp when the server was verified by registry maintainers';
