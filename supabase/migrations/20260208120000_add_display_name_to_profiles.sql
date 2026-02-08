-- Migration: Add display_name column to profiles
-- Description: Allows users to set a display name; OAuth sign-ups auto-populate from provider metadata

ALTER TABLE public.profiles ADD COLUMN display_name text DEFAULT NULL;

COMMENT ON COLUMN public.profiles.display_name IS 'User display name, auto-populated from OAuth provider metadata';

-- Update handle_new_user trigger to pick up OAuth display names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (
        NEW.id,
        'user',
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            NULL
        )
    )
    ON CONFLICT (id) DO UPDATE
        SET display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);
    RETURN NEW;
END;
$$;
