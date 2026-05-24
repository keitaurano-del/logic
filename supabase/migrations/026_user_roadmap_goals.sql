-- Logic App: roadmap goals 用の新テーブル
-- Phase: Device Sync Phase 1
--
-- 既存 roadmap_progress (001_initial_schema.sql) は node_id + status の単純 K-V で、
-- 現在の GoalEntry (targetDate / dailyMinutes / completedSteps[]) 構造に合わない。
-- 旧テーブルは deprecated として残置し、新テーブルに移行する。

create table if not exists public.user_roadmap_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  goal_id text not null,
  target_date date,
  daily_minutes integer not null default 15,
  completed_steps jsonb not null default '[]'::jsonb,
  setup_done boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, goal_id)
);

create index if not exists user_roadmap_goals_user_idx
  on public.user_roadmap_goals (user_id, updated_at desc);

alter table public.user_roadmap_goals enable row level security;

drop policy if exists "user_roadmap_goals: self only" on public.user_roadmap_goals;
create policy "user_roadmap_goals: self only"
  on public.user_roadmap_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ロールバック手順 (手動):
--   drop policy if exists "user_roadmap_goals: self only" on public.user_roadmap_goals;
--   drop index if exists user_roadmap_goals_user_idx;
--   drop table if exists public.user_roadmap_goals;
