-- 028_sync_telemetry.sql
-- 2026-05-24: Device Sync Phase 3 段階公開の観測ログテーブル
--
-- /api/sync-telemetry が POST 1 回ごとに 1 行 insert する。
-- 目的:
--   (a) sync 成功率 / 平均 duration / itemCount 分布の監視
--   (b) Phase 3 段階公開 (25 → 50 → 100%) の各段階でエラー率を確認してから次へ進む
--
-- RLS:
--   - insert: 本人 (auth.uid() = user_id) のみ
--   - select: 全ユーザー拒否。集計は service_role (Metabase の metabase_readonly)
--     から bypass で参照する想定。
--
-- 保持ポリシー: 当面は無制限。将来 90 日 ttl が必要になったら別 migration で
--   delete + index 整理する。

CREATE TABLE IF NOT EXISTS public.sync_telemetry (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type    TEXT NOT NULL,    -- 'flashcards' | 'wrong_answers' | 'saved_items' | 'notebook' | 'roadmap' | 'category_progress' | 'all'
  item_count   INTEGER NOT NULL CHECK (item_count >= 0),
  duration_ms  INTEGER NOT NULL CHECK (duration_ms >= 0),
  success      BOOLEAN NOT NULL,
  error_msg    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザー × 時系列での確認が主クエリ
CREATE INDEX IF NOT EXISTS idx_sync_telemetry_user_date
  ON public.sync_telemetry (user_id, created_at DESC);

-- 成功率 / 失敗率の集計
CREATE INDEX IF NOT EXISTS idx_sync_telemetry_type_success
  ON public.sync_telemetry (sync_type, success, created_at DESC);

-- RLS — 本人 insert のみ、select は admin のみ (= RLS 経由のアクセスは禁止)
ALTER TABLE public.sync_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own telemetry" ON public.sync_telemetry;
CREATE POLICY "Users can insert own telemetry"
  ON public.sync_telemetry
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 明示的に SELECT を拒否するポリシーは作らず、ENABLE RLS のみで
-- service_role 以外からは見えない状態にする (デフォルト deny)。

COMMENT ON TABLE public.sync_telemetry IS
  'Device sync telemetry. One row per /api/sync-telemetry call (sync attempt completion).';
COMMENT ON COLUMN public.sync_telemetry.sync_type IS
  'Which sync bucket completed: flashcards | wrong_answers | saved_items | notebook | roadmap | category_progress | all';
COMMENT ON COLUMN public.sync_telemetry.item_count IS
  'Number of items pushed/pulled in this sync attempt.';
COMMENT ON COLUMN public.sync_telemetry.duration_ms IS
  'Wall-clock duration of the sync attempt in milliseconds.';
COMMENT ON COLUMN public.sync_telemetry.error_msg IS
  'Truncated error message when success = false. NULL on success.';
