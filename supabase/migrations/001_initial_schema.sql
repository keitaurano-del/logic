-- Logic App: Initial Schema Migration
-- Phase 2: DB 永続化
-- 実行場所: https://supabase.com/dashboard/project/yctlelmlwjwlcpcxvmgx/sql/new

-- 1. profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  goal text,
  language text default 'ja',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. progress（学習進捗）
create table if not exists public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  lesson_id int,
  category text,
  score int default 0,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. notebooks（ノート）
create table if not exists public.notebooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 4. roadmap_progress（ロードマップ進捗）
create table if not exists public.roadmap_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  node_id text not null,
  status text default 'locked',
  updated_at timestamptz default now(),
  unique(user_id, node_id)
);

-- 5. subscriptions（サブスクリプション / Phase 3 で使用）
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. placement_results（偏差値ランキング）
create table if not exists public.placement_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  guest_id text,
  nickname text,
  deviation numeric,
  correct_count int default 0,
  total_count int default 0,
  completed_at timestamptz default now()
);

-- 7. reports（問題報告）
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete set null,
  lesson_title text,
  lesson_id int,
  question text,
  options jsonb,
  issue_type text,
  comment text,
  created_at timestamptz default now()
);

-- RLS 有効化
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.notebooks enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.placement_results enable row level security;
alter table public.reports enable row level security;

-- RLS ポリシー（自分のデータのみアクセス可）
create policy "profiles: self only" on public.profiles for all using (auth.uid() = id);
create policy "progress: self only" on public.progress for all using (auth.uid() = user_id);
create policy "notebooks: self only" on public.notebooks for all using (auth.uid() = user_id);
create policy "roadmap: self only" on public.roadmap_progress for all using (auth.uid() = user_id);
create policy "subscriptions: self only" on public.subscriptions for all using (auth.uid() = user_id);
create policy "placement: read all" on public.placement_results for select using (true);
create policy "placement: write own" on public.placement_results for insert with check (auth.uid() = user_id or user_id is null);
create policy "reports: insert only" on public.reports for insert with check (true);

-- 新規ユーザー登録時に profiles を自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'ja'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
