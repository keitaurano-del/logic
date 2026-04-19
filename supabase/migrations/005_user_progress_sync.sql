-- Logic App: ユーザー進捗同期テーブル
-- Phase: Supabase データ同期レイヤー
-- 実行場所: https://supabase.com/dashboard/project/yctlelmlwjwlcpcxvmgx/sql/new

-- ユーザーの学習進捗（ローカルstatsのSupabase版）
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
  study_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  study_time_ms BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- プレースメントテスト結果（ユーザーごとに1件、上書き式）
CREATE TABLE IF NOT EXISTS public.user_placement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deviation REAL NOT NULL,
  correct_count INT NOT NULL,
  total_count INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recommended_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE(user_id)
);

-- RLS有効化
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_placement ENABLE ROW LEVEL SECURITY;

-- user_progress ポリシー
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_progress' AND policyname = 'Users can view own progress'
  ) THEN
    CREATE POLICY "Users can view own progress"
      ON public.user_progress FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_progress' AND policyname = 'Users can insert own progress'
  ) THEN
    CREATE POLICY "Users can insert own progress"
      ON public.user_progress FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_progress' AND policyname = 'Users can update own progress'
  ) THEN
    CREATE POLICY "Users can update own progress"
      ON public.user_progress FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_placement ポリシー
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_placement' AND policyname = 'Users can view own placement'
  ) THEN
    CREATE POLICY "Users can view own placement"
      ON public.user_placement FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_placement' AND policyname = 'Users can insert own placement'
  ) THEN
    CREATE POLICY "Users can insert own placement"
      ON public.user_placement FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_placement' AND policyname = 'Users can update own placement'
  ) THEN
    CREATE POLICY "Users can update own placement"
      ON public.user_placement FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
