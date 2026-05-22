-- 020_study_sessions.sql
-- 2026-05-22: 学習セッション記録テーブル
--
-- これまで `user_progress.study_time_ms` に「累計ミリ秒」だけを保存していたが、
-- (a) 内訳が無いので「どの機能でどれだけ使っているか」の分析ができない、
-- (b) lesson 完了時の onComplete でしか加算されないため、ロールプレイ・フェルミ・
--     ジャーナル・フラッシュカード等の時間がカウント漏れしていた。
-- 細粒度の study session を独立テーブルに記録することで分析基盤を整える。
--
-- `user_progress.study_time_ms` は互換のためそのまま残す（クライアント表示用キャッシュ）。

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,    -- 'lesson' | 'fermi' | 'roleplay' | 'journal' | 'flashcard' | 'ai_problem' | 'daily_problem'
  activity_id   TEXT,             -- e.g. 'lesson-23', 'fermi-5', キャラクターID 等
  started_at    TIMESTAMPTZ NOT NULL,
  ended_at      TIMESTAMPTZ NOT NULL,
  duration_ms   INTEGER NOT NULL CHECK (duration_ms >= 0),
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザー × 日時順での集計が主クエリ
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date
  ON public.study_sessions (user_id, started_at DESC);

-- activity 別の集計
CREATE INDEX IF NOT EXISTS idx_study_sessions_activity
  ON public.study_sessions (activity_type, activity_id);

-- RLS — 本人のみアクセス可
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sessions" ON public.study_sessions;
CREATE POLICY "Users can read own sessions"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.study_sessions;
CREATE POLICY "Users can insert own sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.study_sessions IS
  'Per-activity study session log. Each row = one mount→unmount/flush cycle for a study screen.';
COMMENT ON COLUMN public.study_sessions.activity_type IS
  'Discrete activity bucket: lesson | fermi | roleplay | journal | flashcard | ai_problem | daily_problem';
COMMENT ON COLUMN public.study_sessions.activity_id IS
  'Sub-identifier within the activity bucket (e.g. lesson-23, fermi-5, character id). Nullable for global activities.';
COMMENT ON COLUMN public.study_sessions.metadata IS
  'Free-form context (slideCount, characterId, locale, etc.) for future analytics needs.';
