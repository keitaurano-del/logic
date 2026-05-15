-- 013_journal_tags.sql
-- 2026-05-15: daily_journals.tags 列を追加（ジャーナル v2 — 朝の意図 / 夜の振り返り / タグ）
--
-- 追加カラム:
--   - daily_journals.tags text[]  — 任意の自由タグ（例: 'クライアントMTG', '集中', '体調不良' など）

alter table daily_journals
  add column if not exists tags text[] default '{}'::text[];

-- タグ検索用の GIN インデックス
create index if not exists daily_journals_tags_gin_idx
  on daily_journals using gin (tags);
