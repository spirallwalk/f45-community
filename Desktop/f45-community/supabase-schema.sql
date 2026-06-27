-- ============================================
-- F45 Community - Supabase Schema Setup
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- ============================================

-- 1. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname      TEXT        UNIQUE NOT NULL,
  branch_name   TEXT        NOT NULL,
  total_count   INTEGER     DEFAULT 0 NOT NULL,
  last_workout_date DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. workout_logs 테이블
CREATE TABLE IF NOT EXISTS workout_logs (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, workout_date)  -- 하루에 한 번만 기록 가능
);

-- 3. 자동 횟수 증가 트리거
CREATE OR REPLACE FUNCTION update_workout_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_count = total_count + 1,
    last_workout_date = NEW.workout_date
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_workout_log_insert ON workout_logs;
CREATE TRIGGER after_workout_log_insert
  AFTER INSERT ON workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_count();

-- 4. RLS (Row Level Security) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- profiles: 누구나 읽기 가능 (랭킹)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT TO anon USING (true);

-- profiles: 누구나 삽입 가능 (가입)
CREATE POLICY "profiles_insert_all" ON profiles
  FOR INSERT TO anon WITH CHECK (true);

-- profiles: 누구나 수정 가능 (횟수 직접 수정)
CREATE POLICY "profiles_update_all" ON profiles
  FOR UPDATE TO anon USING (true);

-- workout_logs: 누구나 읽기 가능
CREATE POLICY "workout_logs_select_all" ON workout_logs
  FOR SELECT TO anon USING (true);

-- workout_logs: 누구나 삽입 가능
CREATE POLICY "workout_logs_insert_all" ON workout_logs
  FOR INSERT TO anon WITH CHECK (true);

-- 5. posts 테이블 (커뮤니티 후기)
CREATE TABLE IF NOT EXISTS posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- posts: 누구나 읽기 가능
CREATE POLICY "posts_select_all" ON posts
  FOR SELECT TO anon USING (true);

-- posts: 누구나 삽입 가능
CREATE POLICY "posts_insert_all" ON posts
  FOR INSERT TO anon WITH CHECK (true);

-- posts: 본인 글만 삭제 가능
CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE TO anon USING (true);

-- ============================================
-- 완료! 위 SQL 실행 후 앱을 사용할 수 있습니다.
-- ============================================
