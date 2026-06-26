-- Migration 004: Fix signup 500 error - check and fix triggers
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- Step 1: Check if there are any triggers on auth.users
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- ============================================
-- Step 2: Create a safe handle_new_user function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    100
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- Step 3: Drop old trigger if exists, then create new one
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Step 4: Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON SEQUENCE user_profiles_id_seq TO authenticated;

-- ============================================
-- Done! Test signup again
-- ============================================
