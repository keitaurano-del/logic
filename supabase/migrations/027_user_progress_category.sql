-- Logic App: カテゴリ別マスタリー (logic-progress) を user_progress に同期するための列追加
-- Phase: Device Sync Phase 1
--
-- 既存 user_progress (005_user_progress_sync.sql) は logic-stats を保持。
-- カテゴリ別 progress は別概念だが、user_progress に JSONB で相乗りさせる方が
-- ラウンドトリップが減る (1 リクエストで両方取れる)。

alter table public.user_progress
  add column if not exists category_progress jsonb not null default '{}'::jsonb;

-- ロールバック手順 (手動):
--   alter table public.user_progress drop column if exists category_progress;
