-- Migration 011: Complete user_profiles missing columns
-- Run this SQL in Supabase SQL Editor
-- This script adds ALL missing columns that the app needs

-- ============================================
-- Add all missing columns to user_profiles
-- ============================================

-- nickname
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'nickname') THEN
        ALTER TABLE user_profiles ADD COLUMN nickname TEXT;
    END IF;
END $$;

-- birthday
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'birthday') THEN
        ALTER TABLE user_profiles ADD COLUMN birthday DATE;
    END IF;
END $$;

-- zodiac_sign
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'zodiac_sign') THEN
        ALTER TABLE user_profiles ADD COLUMN zodiac_sign TEXT;
    END IF;
END $$;

-- favorite_element
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'favorite_element') THEN
        ALTER TABLE user_profiles ADD COLUMN favorite_element TEXT;
    END IF;
END $$;

-- interests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'interests') THEN
        ALTER TABLE user_profiles ADD COLUMN interests TEXT;
    END IF;
END $$;

-- avatar_url
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- points (make sure it exists with default)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'points') THEN
        ALTER TABLE user_profiles ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
END $$;

-- role (make sure it exists with default)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================
-- Verify: list all current columns
-- ============================================
-- After running, you can check with:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles' ORDER BY column_name;

-- ============================================
-- Done! All user_profiles columns should now be present
-- ============================================
