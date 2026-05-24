-- Logic App: ブックマーク (saved items) を Supabase に保持する
-- Phase: Device Sync Phase 1
-- レッスン/コース/AI問題/Fermi のブックマークを端末間で共有する

create table if not exists public.user_saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- 'lesson' | 'course' | 'lesson-step' | 'ai-problem' | 'fermi'
  item_type text not null,
  ref_id text not null,

  title text not null,
  subtitle text,
  image text,
  step_index integer,
  parent_lesson_id integer,

  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, item_type, ref_id)
);

create index if not exists user_saved_items_user_idx
  on public.user_saved_items (user_id, saved_at desc);

alter table public.user_saved_items enable row level security;

drop policy if exists "user_saved_items: self only" on public.user_saved_items;
create policy "user_saved_items: self only"
  on public.user_saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ロールバック手順 (手動):
--   drop policy if exists "user_saved_items: self only" on public.user_saved_items;
--   drop index if exists user_saved_items_user_idx;
--   drop table if exists public.user_saved_items;
