-- Migration 014: Allow admin to view all user wishes
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- Fix wishes RLS policies: allow admin to read/update all wishes
-- ============================================

DROP POLICY IF EXISTS "Users can read own wishes" ON wishes;
CREATE POLICY "Users can read own wishes, admin can read all" ON wishes
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can update own wishes" ON wishes;
CREATE POLICY "Users can update own wishes, admin can update all" ON wishes
  FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can delete own wishes" ON wishes;
CREATE POLICY "Users can delete own wishes, admin can delete all" ON wishes
  FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- Done! v5.8 Migration Complete
-- ============================================