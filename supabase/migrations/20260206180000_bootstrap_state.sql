-- ============================================================================
-- Migration: Bootstrap State
-- ============================================================================
-- Creates infrastructure for one-time admin bootstrap.
-- The bootstrap is handled by the Next.js API route, not by DB functions,
-- because we need to read environment variables from Vercel.

-- Bootstrap state table to track one-time operations
CREATE TABLE IF NOT EXISTS public.bootstrap_state (
    key text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Insert initial bootstrap state (not done yet)
INSERT INTO public.bootstrap_state (key, value)
VALUES ('admin_bootstrap_done', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS - no public access, only service role can access
ALTER TABLE public.bootstrap_state ENABLE ROW LEVEL SECURITY;

-- No policies = no access via anon/authenticated roles
-- Service role bypasses RLS, which is what we want for the bootstrap endpoint

-- Minimal audit log for security-sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    actor text,
    details jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit log - admins can read, only service role can write
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read audit logs
CREATE POLICY "Admins can read audit logs"
    ON public.audit_log
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Add comment for documentation
COMMENT ON TABLE public.bootstrap_state IS 'Tracks one-time bootstrap operations. No public access.';
COMMENT ON TABLE public.audit_log IS 'Security audit log for sensitive operations.';
