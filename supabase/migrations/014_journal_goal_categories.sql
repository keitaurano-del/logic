-- 014_journal_goal_categories.sql
-- 2026-05-15: ジャーナル目標の階層整理 + カテゴリ追加
--
-- 変更点:
--   - goals.category text  — 'work' | 'private' | null（仕事 / プライベート）
--   - 1 期間に複数目標 OK: unique(user_id, period_type, period_key) を外す
--   - 既存の period_type check は残す（daily 行は破壊しないが UI からは weekly/monthly/yearly のみ扱う）

alter table goals
  add column if not exists category text;

alter table goals
  drop constraint if exists goals_category_check;

alter table goals
  add constraint goals_category_check
  check (category is null or category in ('work', 'private'));

-- 単一目標前提の unique index を解除（同一期間に複数目標を持てるように）
drop index if exists goals_user_period_idx;

-- 一覧クエリ用の通常 index
create index if not exists goals_user_period_lookup_idx
  on goals (user_id, period_type, period_key);
