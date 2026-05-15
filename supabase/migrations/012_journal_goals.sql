-- 012_journal_goals.sql
-- 2026-05-15: ジャーナル & 目標管理機能
--
-- 追加テーブル:
--   - user_settings:    アシスタント名などのユーザー個別設定
--   - daily_journals:   日次ジャーナル（気分・天気・予定・振り返り・AI要約）
--   - goals:            目標（日次/週次/月次/年次）
--   - goal_reviews:     目標に対する振り返り + AI フィードバック

-- ─── user_settings ─────────────────────────────────────────────────
create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  assistant_name text default 'パーソナルアシスタント',
  updated_at timestamptz default now()
);

-- ─── daily_journals ───────────────────────────────────────────────
create table if not exists daily_journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mood int check (mood between 1 and 5),
  weather text check (weather in ('sunny', 'cloudy', 'rainy', 'snowy')),
  morning_memo text,
  schedule_notes text,
  evening_reflection text,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists daily_journals_user_date_idx
  on daily_journals (user_id, date desc);

-- ─── goals ────────────────────────────────────────────────────────
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly', 'yearly')),
  period_key text not null,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists goals_user_period_idx
  on goals (user_id, period_type, period_key);

-- ─── goal_reviews ─────────────────────────────────────────────────
create table if not exists goal_reviews (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  review_text text,
  ai_feedback text,
  reviewed_at timestamptz default now()
);

create index if not exists goal_reviews_goal_idx
  on goal_reviews (goal_id, reviewed_at desc);

-- ─── RLS 有効化 ─────────────────────────────────────────────────────
alter table user_settings   enable row level security;
alter table daily_journals  enable row level security;
alter table goals           enable row level security;
alter table goal_reviews    enable row level security;

-- ─── RLS ポリシー ────────────────────────────────────────────────
-- 自分の行だけ参照・編集できる（auth.uid() ベース）
drop policy if exists "users can manage own settings" on user_settings;
create policy "users can manage own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can manage own journals" on daily_journals;
create policy "users can manage own journals"
  on daily_journals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can manage own goals" on goals;
create policy "users can manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can manage own goal_reviews" on goal_reviews;
create policy "users can manage own goal_reviews"
  on goal_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── updated_at 自動更新トリガー ──────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_user_settings_updated_at on user_settings;
create trigger trg_user_settings_updated_at
  before update on user_settings
  for each row execute function set_updated_at();

drop trigger if exists trg_daily_journals_updated_at on daily_journals;
create trigger trg_daily_journals_updated_at
  before update on daily_journals
  for each row execute function set_updated_at();

drop trigger if exists trg_goals_updated_at on goals;
create trigger trg_goals_updated_at
  before update on goals
  for each row execute function set_updated_at();
