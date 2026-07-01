-- New feature tables for Tarot, AI Chat, Feng Shui, Zodiac Numerology

-- Tarot Readings table
CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spread_type TEXT NOT NULL,
  cards TEXT[] NOT NULL DEFAULT '{}',
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chat Sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coins_spent INTEGER NOT NULL DEFAULT 20,
  rounds_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feng Shui Reports table
CREATE TABLE IF NOT EXISTS fengshui_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  space_type TEXT NOT NULL,
  layout_description TEXT,
  main_concern TEXT,
  improvement_goal TEXT,
  report_data JSONB,
  coins_spent INTEGER NOT NULL DEFAULT 35,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zodiac Reports table
CREATE TABLE IF NOT EXISTS zodiac_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TEXT,
  report_data JSONB,
  coins_spent INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for new tables
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fengshui_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE zodiac_reports ENABLE ROW LEVEL SECURITY;

-- Tarot readings policies
CREATE POLICY "Users can read own tarot readings, admin can read all" ON tarot_readings
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own tarot readings" ON tarot_readings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI chat sessions policies
CREATE POLICY "Users can read own chat sessions, admin can read all" ON ai_chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own chat sessions" ON ai_chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON ai_chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- Feng Shui reports policies
CREATE POLICY "Users can read own fengshui reports, admin can read all" ON fengshui_reports
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own fengshui reports" ON fengshui_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Zodiac reports policies
CREATE POLICY "Users can read own zodiac reports, admin can read all" ON zodiac_reports
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own zodiac reports" ON zodiac_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
