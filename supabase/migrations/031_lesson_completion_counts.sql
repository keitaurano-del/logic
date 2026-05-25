-- Logic App: レッスン完了回数 (completion_counts) を user_progress に追加。
-- Phase: 完了回数バッジ UI のサーバ同期
--
-- 既存 user_progress (005_user_progress_sync.sql, 027_user_progress_category.sql) に
-- jsonb 列で相乗りさせる。クライアントの localStorage
-- (`logic-completion-counts`) と 1:1 で対応。
--
-- 形式:
--   { "lesson-20": 3, "lesson-21": 1, "fermi": 7 }
--
-- conflict resolution はクライアント側で Max value マージするので
-- スキーマ側に制約はかけない。RLS は既存 user_progress と同じ。

alter table public.user_progress
  add column if not exists completion_counts jsonb not null default '{}'::jsonb;

-- ロールバック手順 (手動):
--   alter table public.user_progress drop column if exists completion_counts;
