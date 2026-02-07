-- Migration: Verification System
-- Description:
--   1. Add owner_id to mcp_servers for ownership tracking
--   2. Create verification_requests table for verification workflow
--   3. Add RLS policies for verification requests

-- ============================================================================
-- PART 1: Add owner_id to mcp_servers
-- ============================================================================

ALTER TABLE public.mcp_servers
ADD COLUMN owner_id uuid REFERENCES auth.users(id);

COMMENT ON COLUMN public.mcp_servers.owner_id IS
    'User who owns this server (set from submitted_by when approved)';

-- Index for finding servers owned by a user
CREATE INDEX idx_mcp_servers_owner_id ON public.mcp_servers(owner_id);

-- ============================================================================
-- PART 2: Create verification_requests table
-- ============================================================================

CREATE TABLE public.verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id uuid NOT NULL REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    requested_by uuid NOT NULL REFERENCES auth.users(id),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    request_notes text,
    review_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz,
    reviewed_by uuid REFERENCES auth.users(id),
    -- Ensure only one pending request per server at a time
    -- Uses exclusion constraint with a partial index approach
    CONSTRAINT one_pending_per_server UNIQUE (server_id, status)
        -- Note: This allows one per (server_id, status) combo, which means
        -- one pending, one approved, one rejected per server.
        -- We'll add a partial unique index for the actual constraint.
);

-- Drop the simple unique constraint and add proper exclusion
ALTER TABLE public.verification_requests DROP CONSTRAINT one_pending_per_server;

-- Partial unique index: only one pending request per server
CREATE UNIQUE INDEX idx_one_pending_verification_per_server
    ON public.verification_requests(server_id)
    WHERE status = 'pending';

-- Index for efficient lookups
CREATE INDEX idx_verification_requests_server_id ON public.verification_requests(server_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_requested_by ON public.verification_requests(requested_by);

COMMENT ON TABLE public.verification_requests IS
    'Tracks verification requests from server owners and admin reviews';

-- ============================================================================
-- PART 3: RLS Policies for verification_requests
-- ============================================================================

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Admins can read all verification requests
CREATE POLICY "Admins can read all verification requests"
    ON public.verification_requests
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Server owners can read their own verification requests
CREATE POLICY "Owners can read own verification requests"
    ON public.verification_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.mcp_servers s
            WHERE s.id = server_id AND s.owner_id = auth.uid()
        )
    );

-- Owners can create verification requests for their servers
-- (insert validation is handled in RPC for atomicity)
CREATE POLICY "Owners can insert verification requests"
    ON public.verification_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        requested_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.mcp_servers s
            WHERE s.id = server_id AND s.owner_id = auth.uid()
        )
    );

-- Only admins can update verification requests (via RPC)
CREATE POLICY "Admins can update verification requests"
    ON public.verification_requests
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Grant table access
GRANT SELECT, INSERT ON public.verification_requests TO authenticated;
GRANT UPDATE ON public.verification_requests TO authenticated;
