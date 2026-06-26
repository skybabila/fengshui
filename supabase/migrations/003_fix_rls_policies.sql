-- Migration 003: Fix RLS Policies
-- Run this SQL in Supabase SQL Editor
-- Fixes:
-- 1. Articles not showing on frontend (RLS policy issues)
-- 2. Fortune pages client error (missing RLS policies for daily_fortunes)

-- ============================================
-- 1. Fix articles table RLS policies
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any, then recreate
DROP POLICY IF EXISTS "Public can read published articles" ON articles;

CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT
  USING (status = 'published');

-- ============================================
-- 2. Fix daily_fortunes table RLS policies (MISSING - causes client error)
-- ============================================
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

-- Users can read their own fortune records
DROP POLICY IF EXISTS "Users can read own fortunes" ON daily_fortunes;

CREATE POLICY "Users can read own fortunes" ON daily_fortunes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own fortune records
DROP POLICY IF EXISTS "Users can insert own fortunes" ON daily_fortunes;

CREATE POLICY "Users can insert own fortunes" ON daily_fortunes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. Add missing columns to daily_fortunes if they don't exist
-- ============================================
ALTER TABLE daily_fortunes
  ADD COLUMN IF NOT EXISTS fortune_period TEXT DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS month_number INTEGER,
  ADD COLUMN IF NOT EXISTS year INTEGER;

-- ============================================
-- 4. Ensure point_transactions has insert policy (for fortune deductions)
-- ============================================
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transactions" ON point_transactions;

CREATE POLICY "Users can read own transactions" ON point_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON point_transactions;

CREATE POLICY "Users can insert own transactions" ON point_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. Ensure user_profiles has proper update policy
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. Add is_pinned column to articles if missing
-- ============================================
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- ============================================
-- Done! v2.5 Migration Complete
-- ============================================
