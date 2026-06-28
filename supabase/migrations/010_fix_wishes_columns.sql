-- Migration 010: Fix wishes columns (safer version)
-- Run this SQL in Supabase SQL Editor
-- Note: This script handles cases where columns may already exist

-- ============================================
-- Add missing columns to wishes table (safe version)
-- ============================================

-- Use a simpler approach - check if column exists before adding

-- For is_public column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE wishes ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column is_public already exists or cannot be added';
END $$;

-- For is_fulfilled column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'is_fulfilled'
    ) THEN
        ALTER TABLE wishes ADD COLUMN is_fulfilled BOOLEAN DEFAULT false;
    END IF;
EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column is_fulfilled already exists or cannot be added';
END $$;

-- For fulfilled_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'fulfilled_at'
    ) THEN
        ALTER TABLE wishes ADD COLUMN fulfilled_at TIMESTAMP WITH TIME ZONE;
    END IF;
EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column fulfilled_at already exists or cannot be added';
END $$;

-- ============================================
-- Done! All wishes columns should now be correct
-- ============================================
