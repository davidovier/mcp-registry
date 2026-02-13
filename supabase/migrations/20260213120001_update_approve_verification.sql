-- Migration: Update approve_verification RPC to set verified_at
-- Description: Modify the approve_verification function to also set verified_at timestamp

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

    -- Set the server as verified with timestamp
    UPDATE public.mcp_servers
    SET verified = true, verified_at = now(), updated_at = now()
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
    'Admin approves a verification request. Sets the server verified=true and verified_at=now().';
