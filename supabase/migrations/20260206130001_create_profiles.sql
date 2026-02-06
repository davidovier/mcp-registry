-- Migration: Create profiles table with roles
-- Description: User profiles with role-based access (user/admin)

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default) or admin';

-- Create index on role for admin lookups
CREATE INDEX profiles_role_idx ON public.profiles (role) WHERE role = 'admin';

-- Function to check if current user is admin
-- This is a STABLE function that can be used in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has admin role';

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to auto-create a profile row when a new user signs up';

-- Create trigger on auth.users to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy: Users can update their own profile (except role)
-- Note: The role column protection is enforced via a separate trigger
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy: Only admins can update any profile's role
CREATE POLICY "Admins can update profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Trigger to prevent non-admins from changing their own role
CREATE OR REPLACE FUNCTION public.protect_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If the role is being changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Only allow if the current user is an admin
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Only admins can change user roles';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.protect_role_change() IS 'Trigger function to prevent non-admins from changing roles';

CREATE TRIGGER protect_role_change_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_role_change();

-- Grant SELECT on profiles to authenticated users (RLS controls actual access)
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- No INSERT grant for authenticated - profiles are created automatically
-- No DELETE grant - profiles should not be deleted (cascade from auth.users handles this)
