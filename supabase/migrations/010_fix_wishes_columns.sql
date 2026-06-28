-- Migration 010: Fix wishes is_public and profile display issues
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- Add is_public column to wishes table
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'is_public') THEN
        ALTER TABLE wishes ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Ensure is_fulfilled and fulfilled_at columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'is_fulfilled') THEN
        ALTER TABLE wishes ADD COLUMN is_fulfilled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'fulfilled_at') THEN
        ALTER TABLE wishes ADD COLUMN fulfilled_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================
-- Done! v3.8 Migration Complete
-- ============================================
