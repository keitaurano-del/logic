-- Migration: AI 問題生成（user_ai_problems / user_ai_problem_ratings）と
--           profiles の AI 月次クォータカラム
-- 既存本番では server/routes/problems.ts が手動で挿入を試みていたが
-- 実際のテーブル / カラムが存在せず silent fail していた（Issue #148）。
-- 全て IF NOT EXISTS / ADD COLUMN IF NOT EXISTS で冪等に追加する。

-- =============================================
-- profiles に AI 月次クォータ用カラムを追加
-- =============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_gen_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_gen_month TEXT;

-- =============================================
-- ユーザーが AI 生成した問題の保存（履歴・再開用）
-- =============================================
CREATE TABLE IF NOT EXISTS user_ai_problems (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id      TEXT,
  problem_json  JSONB NOT NULL,
  prompt        TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ai_problems_user_id
  ON user_ai_problems(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_ai_problems_guest_id
  ON user_ai_problems(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_ai_problems_created_at
  ON user_ai_problems(created_at DESC);

ALTER TABLE user_ai_problems ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_ai_problems' AND policyname='users_rw_own_ai_problems'
  ) THEN
    CREATE POLICY users_rw_own_ai_problems ON user_ai_problems
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- AI 生成問題の評価（星 / コメント）
-- =============================================
CREATE TABLE IF NOT EXISTS user_ai_problem_ratings (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id      TEXT,
  problem_id    BIGINT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ai_problem_ratings_problem_id
  ON user_ai_problem_ratings(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_problem_ratings_user_id
  ON user_ai_problem_ratings(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_ai_problem_ratings_guest_id
  ON user_ai_problem_ratings(guest_id) WHERE guest_id IS NOT NULL;

ALTER TABLE user_ai_problem_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_ai_problem_ratings' AND policyname='users_rw_own_ratings'
  ) THEN
    CREATE POLICY users_rw_own_ratings ON user_ai_problem_ratings
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
