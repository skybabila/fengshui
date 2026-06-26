-- ============================================
-- 综合修复脚本：执行此脚本一次性修复所有问题
-- ============================================

-- ============================================
-- 1. 修复 daily_fortunes 表结构（添加缺失的列）
-- ============================================
ALTER TABLE daily_fortunes
  ADD COLUMN IF NOT EXISTS fortune_period TEXT DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS month_number INTEGER,
  ADD COLUMN IF NOT EXISTS year INTEGER;

-- ============================================
-- 2. 修复 daily_fortunes RLS 策略
-- ============================================
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own fortunes" ON daily_fortunes;
CREATE POLICY "Users can read own fortunes" ON daily_fortunes
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fortunes" ON daily_fortunes;
CREATE POLICY "Users can insert own fortunes" ON daily_fortunes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. 修复 articles RLS 策略
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT
  USING (status = 'published');

-- ============================================
-- 4. 修复 point_transactions RLS 策略
-- ============================================
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transactions" ON point_transactions;
CREATE POLICY "Users can read own transactions" ON point_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON point_transactions;
CREATE POLICY "Users can insert own transactions" ON point_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. 修复 user_profiles RLS 策略
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. 添加 articles 缺失列
-- ============================================
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- ============================================
-- 7. 修复注册触发器（解决 500 错误）
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    100
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. 授予权限
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO authenticated;

-- ============================================
-- 执行完成！
-- ============================================
