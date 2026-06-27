-- Migration 007: Admin RLS policies + wishes RLS fix
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- 1. Fix user_profiles: allow admin to read/update all profiles
-- ============================================

-- First, create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Recreate with admin access
CREATE POLICY "Users can read own profile, admin can read all" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile, admin can update all" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. Fix point_transactions: allow admin to read all
-- ============================================
DROP POLICY IF EXISTS "Users can read own transactions" ON point_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON point_transactions;

CREATE POLICY "Users can read own transactions, admin can read all" ON point_transactions
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own transactions, admin can insert all" ON point_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- ============================================
-- 3. Fix wishes: add RLS policies (if not already)
-- ============================================
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own wishes" ON wishes;
CREATE POLICY "Users can read own wishes" ON wishes
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wishes" ON wishes;
CREATE POLICY "Users can insert own wishes" ON wishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wishes" ON wishes;
CREATE POLICY "Users can update own wishes" ON wishes
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wishes" ON wishes;
CREATE POLICY "Users can delete own wishes" ON wishes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Fix prayers: add RLS policies (if not already)
-- ============================================
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own prayers" ON prayers;
CREATE POLICY "Users can read own prayers" ON prayers
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own prayers" ON prayers;
CREATE POLICY "Users can insert own prayers" ON prayers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Done! v3.4 Migration Complete
-- ============================================
