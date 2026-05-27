-- 032_journal_assistant_conversations.sql
-- 2026-05-27: ジャーナル AI アシスタントの会話履歴を永続化する。
--
-- ジャーナル画面の AI アシスタント（holistic feedback）の応答を後から
-- 見返せるよう、1 応答 = 1 行で保存する。daily_journals / goals と同じく
-- ユーザー個別データなので RLS で本人のみ参照・編集可とする。
--
-- 注意: このマイグレーションの本番適用は Keita 承認案件。ファイル作成のみで適用はしない。

create table if not exists journal_assistant_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  -- AI からのアドバイス本文（markdown）。クライアントで JournalRichText 整形して表示。
  feedback text not null,
  -- 推薦レッスン（解決済みの表示用情報を保存。後から ID 解決に失敗しても表示できる）
  -- 形: [{ "id": 12, "title": "...", "category": "..." }]
  recommended_lessons jsonb not null default '[]'::jsonb,
  -- 推薦コース。形: [{ "id": "...", "title": "...", "category": "...", "image": "...", "lessonCount": 8 }]
  recommended_courses jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists journal_assistant_conversations_user_created_idx
  on journal_assistant_conversations (user_id, created_at desc);

-- ─── RLS ───────────────────────────────────────────────────────────
alter table journal_assistant_conversations enable row level security;

drop policy if exists "users can manage own assistant conversations"
  on journal_assistant_conversations;
create policy "users can manage own assistant conversations"
  on journal_assistant_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
