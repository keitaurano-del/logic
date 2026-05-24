-- Logic App: notebooks テーブルにジャーナル用カラムを追加
-- Phase: Device Sync Phase 1
--
-- 既存 notebooks テーブルは content jsonb 単一カラムだった (001_initial_schema.sql)。
-- 実装側 (src/db/notebookDb.ts) は date / ai_summary / user_memo を前提にしているため、
-- カラム追加 + unique(user_id, date) を張って実装と整合させる。
-- 既存 content カラムは将来削除可能だが、生本番データ消失防止のため当面残す。
--
-- 注意: 既存 RLS ポリシー "notebooks: self only" (001_initial_schema.sql:94) はそのまま有効。

alter table public.notebooks
  add column if not exists date date,
  add column if not exists ai_summary text default '',
  add column if not exists user_memo text default '',
  add column if not exists created_at timestamptz default now();

-- (user_id, date) で upsert できるよう unique 制約を張る
-- date が null の旧 row があると失敗するので NOT NULL は付けず unique のみ
create unique index if not exists notebooks_user_date_uniq
  on public.notebooks (user_id, date)
  where date is not null;

create index if not exists notebooks_user_updated_idx
  on public.notebooks (user_id, updated_at desc);

-- ロールバック手順 (手動):
--   drop index if exists notebooks_user_date_uniq;
--   drop index if exists notebooks_user_updated_idx;
--   alter table public.notebooks
--     drop column if exists date,
--     drop column if exists ai_summary,
--     drop column if exists user_memo,
--     drop column if exists created_at;
