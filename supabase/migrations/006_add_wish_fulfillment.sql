-- Add is_fulfilled and fulfilled_at columns to wishes table
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

-- Update existing wishes to have is_fulfilled = false
UPDATE wishes SET is_fulfilled = FALSE WHERE is_fulfilled IS NULL;

-- Make is_fulfilled NOT NULL with default false
ALTER TABLE wishes ALTER COLUMN is_fulfilled SET NOT NULL;
ALTER TABLE wishes ALTER COLUMN is_fulfilled SET DEFAULT FALSE;
