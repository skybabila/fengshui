-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_fortunes table
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fortune_type TEXT NOT NULL,
  description TEXT NOT NULL,
  zodiac_sign TEXT,
  element TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prayers table
CREATE TABLE IF NOT EXISTS prayers (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_type TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishes table
CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_fortunes_user_date ON daily_fortunes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_prayers_user ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_user ON wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own daily fortunes" ON daily_fortunes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily fortunes" ON daily_fortunes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own prayers" ON prayers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prayers" ON prayers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own point transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public wishes" ON wishes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own wishes" ON wishes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishes" ON wishes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view articles" ON articles
  FOR SELECT USING (true);

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name' || '', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample articles
INSERT INTO articles (title, excerpt, content, category, author) VALUES
('Understanding the Five Elements in Feng Shui', 'Learn how the five elements - Wood, Fire, Earth, Metal, and Water - interact and influence your life and environment.', 'The Five Elements (Wu Xing) are the foundation of Feng Shui philosophy. Each element represents different qualities and energies...', 'Feng Shui', 'Master Li'),
('Creating Harmonious Spaces', 'Discover practical tips for arranging your home and workspace to promote positive energy flow and balance.', 'Creating harmonious spaces involves understanding the flow of Qi (life energy) and arranging furniture and decor to enhance it...', 'Feng Shui', 'Master Li'),
('Daily Feng Shui Practices', 'Simple rituals and practices to align your daily life with natural energy patterns for greater well-being.', 'Incorporating Feng Shui into your daily routine can bring balance and harmony to your life...', 'Wellness', 'Master Li'),
('Chinese Zodiac and Personality', 'Explore how your zodiac sign influences your personality traits and life path according to Chinese astrology.', 'The Chinese zodiac consists of 12 animal signs, each representing different personality traits...', 'Fortune', 'Master Li'),
('History of Feng Shui', 'Trace the origins and evolution of Feng Shui from ancient China to modern practices.', 'Feng Shui has a rich history dating back thousands of years to ancient China...', 'History', 'Master Li'),
('The Philosophy of Qi', 'Deep dive into the concept of Qi (life energy) and its role in traditional Chinese philosophy.', 'Qi is the vital life energy that flows through all living things...', 'Philosophy', 'Master Li')
ON CONFLICT DO NOTHING;
