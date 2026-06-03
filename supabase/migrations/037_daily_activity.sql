-- 037_daily_activity.sql
-- 2026-06-03 (MB-2): クライアントの日次アクティビティを Supabase に同期して DAU / 継続率を出す。
--
-- 背景:
--   日次の「学習した日」はローカル localStorage `logic-stats.studyDates`
--   (YYYY-MM-DD のアクティブ日配列、src/stats.ts) でのみ管理されており、
--   Supabase 未同期だった。そのため DAU / WAU / MAU / 継続率コホートが算出できない。
--   1 ユーザー × 1 アクティブ日 = 1 行の薄いテーブルを置き、syncService から
--   studyDates 全件を冪等 upsert する（過去分はそのままバックフィルになる）。
--
-- study_sessions(020) は activity 別の細粒度ログ（時間内訳）で粒度が違う。
-- daily_activity はあくまで「その日アクティブだったか」の boolean 相当を
-- (user_id, active_date) 主キーで持つだけの集計向け軽量テーブル。

CREATE TABLE IF NOT EXISTS public.daily_activity (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_date DATE NOT NULL,
  PRIMARY KEY (user_id, active_date)
);

-- DAU / WAU / MAU の日付レンジ集計用。active_date 単独インデックス。
CREATE INDEX IF NOT EXISTS idx_daily_activity_active_date
  ON public.daily_activity (active_date);

-- ─── RLS — 本人のみ select/insert/update/delete ─────────────────────
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own daily_activity" ON public.daily_activity;
CREATE POLICY "Users can read own daily_activity"
  ON public.daily_activity
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily_activity" ON public.daily_activity;
CREATE POLICY "Users can insert own daily_activity"
  ON public.daily_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily_activity" ON public.daily_activity;
CREATE POLICY "Users can update own daily_activity"
  ON public.daily_activity
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily_activity" ON public.daily_activity;
CREATE POLICY "Users can delete own daily_activity"
  ON public.daily_activity
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 分析用 read-only role への SELECT 付与（021 metabase_readonly パターン）───
-- 021 で ALTER DEFAULT PRIVILEGES + BYPASSRLS を付与済みなので新規テーブルにも
-- 自動で SELECT が乗るが、role 不在環境でも冪等に走らせたいので明示 grant する。
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_readonly') THEN
    GRANT SELECT ON public.daily_activity TO metabase_readonly;
  END IF;
END $$;

COMMENT ON TABLE public.daily_activity IS
  'Per-user active-day log (1 row = 1 user × 1 active date). Source for DAU/WAU/MAU and retention cohorts. Backfilled from client logic-stats.studyDates via syncService.';
COMMENT ON COLUMN public.daily_activity.active_date IS
  'Local-date (YYYY-MM-DD) on which the user was active. Matches src/stats.ts studyDates (JST local date, not UTC).';
