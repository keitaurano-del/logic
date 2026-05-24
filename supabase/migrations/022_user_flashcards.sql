-- Logic App: SRS フラッシュカード本体を Supabase に保持する
-- Phase: Device Sync Phase 1
-- 端末をまたいで SM-2 状態 (interval / ease / next_review) を共有する

create table if not exists public.user_flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- 既存 client-side id をそのまま使うキー
  -- "${ts}-${rand}" など loadCards() で発行された id
  card_key text not null,

  -- カード本体
  source text not null,             -- "lesson-21" / "ai-weak" 等
  category text not null,
  front text not null,
  back text not null,

  -- SM-2 state
  interval_days integer not null default 0,
  ease real not null default 2.5,
  next_review date not null,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, card_key)
);

create index if not exists user_flashcards_user_due_idx
  on public.user_flashcards (user_id, next_review);

create index if not exists user_flashcards_user_updated_idx
  on public.user_flashcards (user_id, updated_at desc);

alter table public.user_flashcards enable row level security;

drop policy if exists "user_flashcards: self only" on public.user_flashcards;
create policy "user_flashcards: self only"
  on public.user_flashcards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ロールバック手順 (手動):
--   drop policy if exists "user_flashcards: self only" on public.user_flashcards;
--   drop index if exists user_flashcards_user_due_idx;
--   drop index if exists user_flashcards_user_updated_idx;
--   drop table if exists public.user_flashcards;
