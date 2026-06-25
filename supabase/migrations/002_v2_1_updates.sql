-- Migration 002: v2.1 Updates
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- 1. Enable RLS and add policies for articles table
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT
  USING (status = 'published');

-- Allow admin full access to articles (via service role)
-- Note: Service role bypasses RLS, so no policy needed for admin

-- ============================================
-- 2. Enable RLS and add policies for other tables
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert on signup (via trigger or service role)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. Extend user_profiles table with new fields
-- ============================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS interests TEXT,
  ADD COLUMN IF NOT EXISTS zodiac_sign TEXT,
  ADD COLUMN IF NOT EXISTS favorite_element TEXT,
  ADD COLUMN IF NOT EXISTS nickname TEXT;

-- ============================================
-- 4. Extend daily_fortunes table for fortune periods
-- ============================================
ALTER TABLE daily_fortunes
  ADD COLUMN IF NOT EXISTS fortune_period TEXT DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS month_number INTEGER,
  ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add unique constraint to prevent duplicate fortunes per period
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_fortune_daily_date
  ON daily_fortunes (user_id, fortune_period, date)
  WHERE fortune_period = 'daily';

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_fortune_weekly
  ON daily_fortunes (user_id, fortune_period, week_number, year)
  WHERE fortune_period = 'weekly';

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_fortune_monthly
  ON daily_fortunes (user_id, fortune_period, month_number, year)
  WHERE fortune_period = 'monthly';

-- ============================================
-- 5. Enable RLS for wishes table
-- ============================================
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishes
CREATE POLICY "Users can read own wishes" ON wishes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishes" ON wishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishes" ON wishes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. Enable RLS for prayers and point_transactions
-- ============================================
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prayers" ON prayers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers" ON prayers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON point_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Create function to handle new user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with 100 initial points
  INSERT INTO user_profiles (id, email, name, points, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    100,  -- Initial 100 yuanbao/points
    'user'
  );
  
  -- Record the initial points transaction
  INSERT INTO point_transactions (user_id, description, points)
  VALUES (NEW.id, 'New member welcome bonus', 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

-- ============================================
-- 8. Create storage bucket for avatars
-- ============================================
-- Note: Run this in Supabase Dashboard > Storage
-- Create bucket named 'avatars' with public access

-- Storage policy for avatars bucket
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. Add indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 10. Update existing users with 100 points if they don't have any
-- ============================================
UPDATE user_profiles
SET points = 100
WHERE points = 0 OR points IS NULL;

-- Add welcome bonus transaction for existing users
INSERT INTO point_transactions (user_id, description, points)
SELECT id, 'Welcome bonus (retroactive)', 100
FROM user_profiles
WHERE points = 100
AND NOT EXISTS (
  SELECT 1 FROM point_transactions 
  WHERE user_id = user_profiles.id 
  AND description = 'Welcome bonus (retroactive)'
);

-- ============================================
-- Done! v2.1 Migration Complete
-- ============================================