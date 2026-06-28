-- Migration 009: Add guidance columns to daily_fortunes table
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- Add new columns to daily_fortunes for expanded guidance
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_fortunes' AND column_name = 'advice') THEN
        ALTER TABLE daily_fortunes ADD COLUMN advice TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_fortunes' AND column_name = 'lucky_items') THEN
        ALTER TABLE daily_fortunes ADD COLUMN lucky_items TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_fortunes' AND column_name = 'caution_items') THEN
        ALTER TABLE daily_fortunes ADD COLUMN caution_items TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_fortunes' AND column_name = 'guidance') THEN
        ALTER TABLE daily_fortunes ADD COLUMN guidance TEXT;
    END IF;
END $$;

-- ============================================
-- Done! v3.7 Migration Complete
-- ============================================
