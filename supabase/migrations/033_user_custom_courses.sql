-- Migration: AI カスタムコース生成機能
--   - user_custom_courses: ユーザーが AI 生成した「あなた専用コース」（複数保持）
--   - user_ai_course_usage: 無料プランの月次生成回数を集計（無料は月3回まで）
--
-- 設計メモ:
--   - 永続化は localStorage（logic-custom-courses）+ この Supabase テーブルの
--     ハイブリッド（roadmapStore のパターンに倣う last-write / union sync）。
--   - 課金回数の集計はサーバ側で user_ai_course_usage を権威ソースとして
--     インクリメントする（クライアント表示用には profiles ベースでなく専用テーブル）。
--   - 既存 AI クォータは profiles.ai_gen_count（problems.ts、有料限定機能用）で
--     あり、無料ユーザーにも月3回許可する本機能とは集計軸が異なるため別テーブルにする。
--   - すべて IF NOT EXISTS / 冪等。RLS は本人のみ all。

-- =============================================
-- user_custom_courses
-- =============================================
CREATE TABLE IF NOT EXISTS user_custom_courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  lesson_ids  JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompt      TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_custom_courses_user_id
  ON user_custom_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_courses_created_at
  ON user_custom_courses(created_at DESC);

ALTER TABLE user_custom_courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_custom_courses' AND policyname='users_rw_own_custom_courses'
  ) THEN
    CREATE POLICY users_rw_own_custom_courses ON user_custom_courses
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- user_ai_course_usage（無料プランの月次生成回数集計）
-- =============================================
-- period_month は 'YYYY-MM' 形式（サーバ側で生成）。
-- 1 ユーザー × 1 月で 1 行。生成のたびにサーバが count を +1 する。
CREATE TABLE IF NOT EXISTS user_ai_course_usage (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_month TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, period_month)
);

ALTER TABLE user_ai_course_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_ai_course_usage' AND policyname='users_rw_own_ai_course_usage'
  ) THEN
    CREATE POLICY users_rw_own_ai_course_usage ON user_ai_course_usage
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
