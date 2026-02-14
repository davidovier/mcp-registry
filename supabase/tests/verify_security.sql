-- ============================================================================
-- Security Verification Tests
-- ============================================================================
-- Run these tests after applying migrations to verify security is correct.
-- Execute in Supabase Studio SQL Editor or via psql.

-- ============================================================================
-- TEST 1: Verify gen_random_uuid() works
-- ============================================================================
DO $$
DECLARE
    v_uuid uuid;
BEGIN
    v_uuid := gen_random_uuid();
    IF v_uuid IS NULL THEN
        RAISE EXCEPTION 'TEST FAILED: gen_random_uuid() returned NULL';
    END IF;
    RAISE NOTICE 'TEST 1 PASSED: gen_random_uuid() works - %', v_uuid;
END $$;

-- ============================================================================
-- TEST 2: Verify is_admin() function exists and is SECURITY DEFINER
-- ============================================================================
DO $$
DECLARE
    v_prosecdef boolean;
BEGIN
    SELECT prosecdef INTO v_prosecdef
    FROM pg_proc
    WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace;

    IF v_prosecdef IS NULL THEN
        RAISE EXCEPTION 'TEST FAILED: is_admin() function not found';
    END IF;

    IF NOT v_prosecdef THEN
        RAISE EXCEPTION 'TEST FAILED: is_admin() is not SECURITY DEFINER';
    END IF;

    RAISE NOTICE 'TEST 2 PASSED: is_admin() exists and is SECURITY DEFINER';
END $$;

-- ============================================================================
-- TEST 3: Verify approve_submission RPC exists
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'approve_submission' AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: approve_submission() RPC not found';
    END IF;
    RAISE NOTICE 'TEST 3 PASSED: approve_submission() RPC exists';
END $$;

-- ============================================================================
-- TEST 4: Verify reject_submission RPC exists
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'reject_submission' AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: reject_submission() RPC not found';
    END IF;
    RAISE NOTICE 'TEST 4 PASSED: reject_submission() RPC exists';
END $$;

-- ============================================================================
-- TEST 5: Verify protect_role_change trigger exists
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'protect_role_change_trigger'
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: protect_role_change_trigger not found';
    END IF;
    RAISE NOTICE 'TEST 5 PASSED: protect_role_change_trigger exists';
END $$;

-- ============================================================================
-- TEST 6: Verify RLS is enabled on all tables
-- ============================================================================
DO $$
DECLARE
    v_table text;
    v_rls boolean;
BEGIN
    FOR v_table, v_rls IN
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('mcp_servers', 'profiles', 'mcp_server_submissions')
    LOOP
        IF NOT v_rls THEN
            RAISE EXCEPTION 'TEST FAILED: RLS not enabled on table %', v_table;
        END IF;
        RAISE NOTICE 'TEST 6 PASSED: RLS enabled on %', v_table;
    END LOOP;
END $$;

-- ============================================================================
-- TEST 7: Verify admin-only INSERT policy on mcp_servers
-- ============================================================================
DO $$
DECLARE
    v_policy_count int;
BEGIN
    SELECT count(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'mcp_servers'
    AND policyname ILIKE '%admin%insert%'
    AND cmd = 'INSERT';

    IF v_policy_count = 0 THEN
        RAISE EXCEPTION 'TEST FAILED: No admin INSERT policy on mcp_servers';
    END IF;
    RAISE NOTICE 'TEST 7 PASSED: Admin INSERT policy exists on mcp_servers';
END $$;

-- ============================================================================
-- TEST 8: Verify verification RPC functions exist
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'request_verification'
          AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: request_verification() RPC not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'approve_verification'
          AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: approve_verification() RPC not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'reject_verification'
          AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: reject_verification() RPC not found';
    END IF;

    RAISE NOTICE 'TEST 8 PASSED: verification RPC functions exist';
END $$;

-- ============================================================================
-- TEST 9: Verify suggest_servers function has SECURITY DEFINER and safe search_path
-- ============================================================================
DO $$
DECLARE
    v_prosecdef boolean;
    v_proconfig text[];
BEGIN
    SELECT p.prosecdef, p.proconfig
    INTO v_prosecdef, v_proconfig
    FROM pg_proc p
    WHERE p.proname = 'suggest_servers'
      AND p.pronamespace = 'public'::regnamespace;

    IF v_prosecdef IS NULL THEN
        RAISE EXCEPTION 'TEST FAILED: suggest_servers() function not found';
    END IF;

    IF NOT v_prosecdef THEN
        RAISE EXCEPTION 'TEST FAILED: suggest_servers() is not SECURITY DEFINER';
    END IF;

    IF v_proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(v_proconfig) cfg
        WHERE cfg = 'search_path=public'
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: suggest_servers() does not enforce search_path=public';
    END IF;

    RAISE NOTICE 'TEST 9 PASSED: suggest_servers() is SECURITY DEFINER with fixed search_path';
END $$;

-- ============================================================================
-- TEST 10: Verify bootstrap and audit tables have RLS enabled
-- ============================================================================
DO $$
DECLARE
    v_table text;
    v_rls boolean;
BEGIN
    FOR v_table, v_rls IN
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('bootstrap_state', 'audit_log')
    LOOP
        IF NOT v_rls THEN
            RAISE EXCEPTION 'TEST FAILED: RLS not enabled on table %', v_table;
        END IF;
        RAISE NOTICE 'TEST 10 PASSED: RLS enabled on %', v_table;
    END LOOP;
END $$;

-- ============================================================================
-- TEST 11: Verify verification_requests has one-pending-request unique index
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'verification_requests'
          AND indexname = 'idx_one_pending_verification_per_server'
    ) THEN
        RAISE EXCEPTION 'TEST FAILED: idx_one_pending_verification_per_server index not found';
    END IF;

    RAISE NOTICE 'TEST 11 PASSED: partial unique index for one pending request exists';
END $$;

-- ============================================================================
-- Summary
-- ============================================================================
RAISE NOTICE '';
RAISE NOTICE '============================================';
RAISE NOTICE 'All security verification tests passed!';
RAISE NOTICE '============================================';
