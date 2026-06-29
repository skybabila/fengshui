-- Add new columns to prayers table for Temple Worship feature
-- Run this in Supabase SQL Editor

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayers' AND column_name = 'deity_id') THEN
    ALTER TABLE prayers ADD COLUMN deity_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayers' AND column_name = 'deity_name') THEN
    ALTER TABLE prayers ADD COLUMN deity_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayers' AND column_name = 'wish_text') THEN
    ALTER TABLE prayers ADD COLUMN wish_text TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayers' AND column_name = 'blessing_text') THEN
    ALTER TABLE prayers ADD COLUMN blessing_text TEXT;
  END IF;
END $$;
