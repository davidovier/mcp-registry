-- Migration: Hardening + Atomic RPC for Moderation
-- Description:
--   1. Verify gen_random_uuid() works (built-in to PG13+, no extension needed)
--   2. Create atomic approve/reject RPC functions
--   3. Strengthen role escalation protection

-- ============================================================================
-- PART 1: Verify gen_random_uuid() (informational)
-- ============================================================================
-- gen_random_uuid() is a built-in function in PostgreSQL 13+ and does not
-- require the pgcrypto extension. Supabase uses PG15+, so this is available
-- by default. The previous migration's pgcrypto extension is harmless but
-- unnecessary. We leave it in place for backwards compatibility.
--
-- If you need to verify, run: SELECT gen_random_uuid();

-- ============================================================================
-- PART 2: Atomic approve/reject RPC functions
-- ============================================================================

-- Type for RPC response
DROP TYPE IF EXISTS public.moderation_result CASCADE;
CREATE TYPE public.moderation_result AS (
    success boolean,
    error_message text,
    server_id uuid
);

-- Function: Approve a submission atomically
-- Validates admin, checks slug uniqueness, inserts server, updates submission
CREATE OR REPLACE FUNCTION public.approve_submission(
    p_submission_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS public.moderation_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_submission record;
    v_payload jsonb;
    v_existing_id uuid;
    v_new_server_id uuid;
    v_result public.moderation_result;
BEGIN
    -- Initialize result
    v_result.success := false;
    v_result.error_message := NULL;
    v_result.server_id := NULL;

    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        v_result.error_message := 'Not authenticated';
        RETURN v_result;
    END IF;

    -- Verify admin status
    IF NOT public.is_admin() THEN
        v_result.error_message := 'Unauthorized: Admin access required';
        RETURN v_result;
    END IF;

    -- Fetch and lock the submission row
    SELECT * INTO v_submission
    FROM public.mcp_server_submissions
    WHERE id = p_submission_id
    FOR UPDATE;

    IF v_submission IS NULL THEN
        v_result.error_message := 'Submission not found';
        RETURN v_result;
    END IF;

    IF v_submission.status != 'pending' THEN
        v_result.error_message := 'Submission has already been reviewed';
        RETURN v_result;
    END IF;

    v_payload := v_submission.submitted_payload;

    -- Check slug uniqueness
    SELECT id INTO v_existing_id
    FROM public.mcp_servers
    WHERE slug = v_payload->>'slug';

    IF v_existing_id IS NOT NULL THEN
        v_result.error_message := format(
            'A server with slug "%s" already exists. Please reject with a note to use a different slug.',
            v_payload->>'slug'
        );
        RETURN v_result;
    END IF;

    -- Insert into mcp_servers
    INSERT INTO public.mcp_servers (
        slug,
        name,
        description,
        homepage_url,
        repo_url,
        docs_url,
        tags,
        transport,
        auth,
        capabilities,
        verified
    ) VALUES (
        v_payload->>'slug',
        v_payload->>'name',
        v_payload->>'description',
        NULLIF(v_payload->>'homepage_url', ''),
        NULLIF(v_payload->>'repo_url', ''),
        NULLIF(v_payload->>'docs_url', ''),
        ARRAY(SELECT jsonb_array_elements_text(v_payload->'tags')),
        v_payload->>'transport',
        v_payload->>'auth',
        v_payload->'capabilities',
        false
    )
    RETURNING id INTO v_new_server_id;

    -- Update submission status
    UPDATE public.mcp_server_submissions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = v_user_id,
        review_notes = p_notes
    WHERE id = p_submission_id;

    -- Success
    v_result.success := true;
    v_result.server_id := v_new_server_id;
    RETURN v_result;

EXCEPTION WHEN unique_violation THEN
    -- Handle race condition on slug
    v_result.error_message := format(
        'A server with slug "%s" already exists (concurrent insert).',
        v_payload->>'slug'
    );
    RETURN v_result;
WHEN OTHERS THEN
    v_result.error_message := format('Unexpected error: %s', SQLERRM);
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.approve_submission(uuid, text) IS
    'Atomically approve a submission: validates admin, checks slug, inserts server, updates submission';

-- Function: Reject a submission atomically
CREATE OR REPLACE FUNCTION public.reject_submission(
    p_submission_id uuid,
    p_notes text
)
RETURNS public.moderation_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_submission record;
    v_result public.moderation_result;
BEGIN
    -- Initialize result
    v_result.success := false;
    v_result.error_message := NULL;
    v_result.server_id := NULL;

    -- Validate notes
    IF p_notes IS NULL OR trim(p_notes) = '' THEN
        v_result.error_message := 'Notes are required when rejecting a submission';
        RETURN v_result;
    END IF;

    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        v_result.error_message := 'Not authenticated';
        RETURN v_result;
    END IF;

    -- Verify admin status
    IF NOT public.is_admin() THEN
        v_result.error_message := 'Unauthorized: Admin access required';
        RETURN v_result;
    END IF;

    -- Fetch and lock the submission row
    SELECT * INTO v_submission
    FROM public.mcp_server_submissions
    WHERE id = p_submission_id
    FOR UPDATE;

    IF v_submission IS NULL THEN
        v_result.error_message := 'Submission not found';
        RETURN v_result;
    END IF;

    IF v_submission.status != 'pending' THEN
        v_result.error_message := 'Submission has already been reviewed';
        RETURN v_result;
    END IF;

    -- Update submission status
    UPDATE public.mcp_server_submissions
    SET
        status = 'rejected',
        reviewed_at = now(),
        reviewed_by = v_user_id,
        review_notes = p_notes
    WHERE id = p_submission_id;

    -- Success
    v_result.success := true;
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    v_result.error_message := format('Unexpected error: %s', SQLERRM);
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.reject_submission(uuid, text) IS
    'Atomically reject a submission: validates admin, updates submission status with notes';

-- Grant execute on RPC functions to authenticated users
-- (The functions themselves verify admin status internally)
GRANT EXECUTE ON FUNCTION public.approve_submission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_submission(uuid, text) TO authenticated;

-- ============================================================================
-- PART 3: Strengthen role escalation protection
-- ============================================================================

-- The protect_role_change trigger already prevents non-admins from changing roles.
-- However, we can add an additional layer: revoke direct UPDATE on the role column
-- and only allow it through an admin-only function.

-- Create a function for admins to change roles (explicit API)
CREATE OR REPLACE FUNCTION public.set_user_role(
    p_user_id uuid,
    p_new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;

    -- Validate role
    IF p_new_role NOT IN ('user', 'admin') THEN
        RAISE EXCEPTION 'Invalid role. Must be "user" or "admin"';
    END IF;

    -- Update the role
    UPDATE public.profiles
    SET role = p_new_role
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    RETURN true;
END;
$$;

COMMENT ON FUNCTION public.set_user_role(uuid, text) IS
    'Admin-only function to change a user role';

GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;

-- Note: The trigger protect_role_change_trigger remains as a safety net.
-- Even if someone tries to UPDATE profiles.role directly, the trigger will block it
-- unless they're an admin (and admins should use set_user_role for clarity).
