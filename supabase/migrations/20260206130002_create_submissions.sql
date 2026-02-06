-- Migration: Create mcp_server_submissions table
-- Description: Submissions table for users to submit new MCP servers for review

-- Create submissions table
CREATE TABLE public.mcp_server_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by uuid NOT NULL REFERENCES auth.users(id),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes text NULL,
    submitted_payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz NULL,
    reviewed_by uuid NULL REFERENCES auth.users(id)
);

-- Add table comments
COMMENT ON TABLE public.mcp_server_submissions IS 'User submissions of new MCP servers pending admin review';
COMMENT ON COLUMN public.mcp_server_submissions.status IS 'Submission status: pending (awaiting review), approved, or rejected';
COMMENT ON COLUMN public.mcp_server_submissions.review_notes IS 'Admin notes about the review decision (visible to submitter)';
COMMENT ON COLUMN public.mcp_server_submissions.submitted_payload IS 'JSON payload with server details submitted by user';

-- Create indexes
CREATE INDEX submissions_submitted_by_idx ON public.mcp_server_submissions (submitted_by);
CREATE INDEX submissions_status_idx ON public.mcp_server_submissions (status) WHERE status = 'pending';
CREATE INDEX submissions_created_at_idx ON public.mcp_server_submissions (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.mcp_server_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions

-- Policy: Authenticated users can insert their own submissions
CREATE POLICY "Users can create own submissions"
    ON public.mcp_server_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (submitted_by = auth.uid());

-- Policy: Users can read their own submissions
CREATE POLICY "Users can read own submissions"
    ON public.mcp_server_submissions
    FOR SELECT
    TO authenticated
    USING (submitted_by = auth.uid());

-- Policy: Admins can read all submissions
CREATE POLICY "Admins can read all submissions"
    ON public.mcp_server_submissions
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy: Admins can update submissions (for moderation)
CREATE POLICY "Admins can update submissions"
    ON public.mcp_server_submissions
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Note: No DELETE policy - submissions are kept for audit trail

-- Grant privileges (RLS controls actual access)
GRANT SELECT ON public.mcp_server_submissions TO authenticated;
GRANT INSERT ON public.mcp_server_submissions TO authenticated;
GRANT UPDATE ON public.mcp_server_submissions TO authenticated;

-- Also grant INSERT on mcp_servers to authenticated (needed for admin approval)
-- The RLS policy on mcp_servers currently only allows SELECT
-- We need to add an admin-only INSERT policy
CREATE POLICY "Admins can insert servers"
    ON public.mcp_servers
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

GRANT INSERT ON public.mcp_servers TO authenticated;
