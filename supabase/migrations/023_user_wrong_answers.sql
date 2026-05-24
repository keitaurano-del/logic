-- Logic App: 誤答リストを Supabase に保持する
-- Phase: Device Sync Phase 1
-- 「弱点復習」機能の入口データを端末間で共有する

create table if not exists public.user_wrong_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  lesson_id integer not null,
  lesson_title text,
  category text,
  question text not null,
  correct_answer text not null,
  selected_answer text,
  explanation text,

  -- 4択再出題用 options (WrongAnswerOption[])
  options jsonb,

  wrong_at timestamptz not null default now(),
  resolved_at timestamptz,
  retry_count integer not null default 0,
  retry_correct_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, lesson_id, question)
);

create index if not exists user_wrong_answers_user_idx
  on public.user_wrong_answers (user_id, resolved_at, wrong_at desc);

create index if not exists user_wrong_answers_user_updated_idx
  on public.user_wrong_answers (user_id, updated_at desc);

alter table public.user_wrong_answers enable row level security;

drop policy if exists "user_wrong_answers: self only" on public.user_wrong_answers;
create policy "user_wrong_answers: self only"
  on public.user_wrong_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ロールバック手順 (手動):
--   drop policy if exists "user_wrong_answers: self only" on public.user_wrong_answers;
--   drop index if exists user_wrong_answers_user_idx;
--   drop index if exists user_wrong_answers_user_updated_idx;
--   drop table if exists public.user_wrong_answers;
