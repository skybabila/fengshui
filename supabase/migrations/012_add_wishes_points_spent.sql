-- Migration 012: Add points_spent column to wishes table
-- Run this SQL in Supabase SQL Editor

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'points_spent'
    ) THEN
        ALTER TABLE wishes ADD COLUMN points_spent INTEGER DEFAULT 0;
    END IF;
EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column points_spent already exists or cannot be added';
END $$;
