-- Migration: Update approve_submission to set owner_id
-- Description:
--   Modify the approve_submission RPC to include owner_id from submitted_by

-- Drop and recreate the function with owner_id support
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

    -- Insert into mcp_servers (now includes owner_id)
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
        verified,
        owner_id
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
        false,
        v_submission.submitted_by  -- Set owner from submitter
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
    'Atomically approve a submission: validates admin, checks slug, inserts server with owner_id, updates submission';
