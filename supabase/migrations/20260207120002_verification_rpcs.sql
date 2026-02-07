-- Migration: Verification RPC Functions
-- Description:
--   1. request_verification - Owner creates a verification request
--   2. approve_verification - Admin approves and sets verified=true
--   3. reject_verification - Admin rejects with required notes

-- Type for verification RPC response
DROP TYPE IF EXISTS public.verification_result CASCADE;
CREATE TYPE public.verification_result AS (
    success boolean,
    error_message text,
    request_id uuid
);

-- ============================================================================
-- Function: request_verification
-- Owner creates a verification request for their server
-- ============================================================================
CREATE OR REPLACE FUNCTION public.request_verification(
    p_server_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS public.verification_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_server record;
    v_existing_request_id uuid;
    v_new_request_id uuid;
    v_result public.verification_result;
BEGIN
    -- Initialize result
    v_result.success := false;
    v_result.error_message := NULL;
    v_result.request_id := NULL;

    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        v_result.error_message := 'Not authenticated';
        RETURN v_result;
    END IF;

    -- Fetch the server
    SELECT * INTO v_server
    FROM public.mcp_servers
    WHERE id = p_server_id;

    IF v_server IS NULL THEN
        v_result.error_message := 'Server not found';
        RETURN v_result;
    END IF;

    -- Check ownership
    IF v_server.owner_id IS NULL OR v_server.owner_id != v_user_id THEN
        v_result.error_message := 'You must be the owner of this server to request verification';
        RETURN v_result;
    END IF;

    -- Check if already verified
    IF v_server.verified = true THEN
        v_result.error_message := 'This server is already verified';
        RETURN v_result;
    END IF;

    -- Check for existing pending request
    SELECT id INTO v_existing_request_id
    FROM public.verification_requests
    WHERE server_id = p_server_id AND status = 'pending';

    IF v_existing_request_id IS NOT NULL THEN
        v_result.error_message := 'A verification request is already pending for this server';
        RETURN v_result;
    END IF;

    -- Create the verification request
    INSERT INTO public.verification_requests (
        server_id,
        requested_by,
        status,
        request_notes
    ) VALUES (
        p_server_id,
        v_user_id,
        'pending',
        p_notes
    )
    RETURNING id INTO v_new_request_id;

    -- Success
    v_result.success := true;
    v_result.request_id := v_new_request_id;
    RETURN v_result;

EXCEPTION WHEN unique_violation THEN
    -- Race condition: another pending request was created
    v_result.error_message := 'A verification request is already pending for this server';
    RETURN v_result;
WHEN OTHERS THEN
    v_result.error_message := format('Unexpected error: %s', SQLERRM);
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.request_verification(uuid, text) IS
    'Owner requests verification for their server. Creates a pending verification request.';

-- ============================================================================
-- Function: approve_verification
-- Admin approves a verification request and sets server.verified = true
-- ============================================================================
CREATE OR REPLACE FUNCTION public.approve_verification(
    p_request_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS public.verification_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_request record;
    v_result public.verification_result;
BEGIN
    -- Initialize result
    v_result.success := false;
    v_result.error_message := NULL;
    v_result.request_id := NULL;

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

    -- Fetch and lock the request
    SELECT * INTO v_request
    FROM public.verification_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF v_request IS NULL THEN
        v_result.error_message := 'Verification request not found';
        RETURN v_result;
    END IF;

    IF v_request.status != 'pending' THEN
        v_result.error_message := 'This request has already been reviewed';
        RETURN v_result;
    END IF;

    -- Update the verification request
    UPDATE public.verification_requests
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = v_user_id,
        review_notes = p_notes
    WHERE id = p_request_id;

    -- Set the server as verified
    UPDATE public.mcp_servers
    SET verified = true, updated_at = now()
    WHERE id = v_request.server_id;

    -- Success
    v_result.success := true;
    v_result.request_id := p_request_id;
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    v_result.error_message := format('Unexpected error: %s', SQLERRM);
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.approve_verification(uuid, text) IS
    'Admin approves a verification request. Sets the server verified=true.';

-- ============================================================================
-- Function: reject_verification
-- Admin rejects a verification request (requires notes)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reject_verification(
    p_request_id uuid,
    p_notes text
)
RETURNS public.verification_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_request record;
    v_result public.verification_result;
BEGIN
    -- Initialize result
    v_result.success := false;
    v_result.error_message := NULL;
    v_result.request_id := NULL;

    -- Validate notes
    IF p_notes IS NULL OR trim(p_notes) = '' THEN
        v_result.error_message := 'Notes are required when rejecting a verification request';
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

    -- Fetch and lock the request
    SELECT * INTO v_request
    FROM public.verification_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF v_request IS NULL THEN
        v_result.error_message := 'Verification request not found';
        RETURN v_result;
    END IF;

    IF v_request.status != 'pending' THEN
        v_result.error_message := 'This request has already been reviewed';
        RETURN v_result;
    END IF;

    -- Update the verification request
    UPDATE public.verification_requests
    SET
        status = 'rejected',
        reviewed_at = now(),
        reviewed_by = v_user_id,
        review_notes = p_notes
    WHERE id = p_request_id;

    -- Success
    v_result.success := true;
    v_result.request_id := p_request_id;
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    v_result.error_message := format('Unexpected error: %s', SQLERRM);
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.reject_verification(uuid, text) IS
    'Admin rejects a verification request with required notes.';

-- Grant execute on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION public.request_verification(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_verification(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_verification(uuid, text) TO authenticated;
