-- 041_fermi_answers.sql
--
-- LR-8 / #40: 連番 migration 外で手動適用されていた SQL を取込・冪等化。
-- 取込元: scripts/migrate_fermi_answers_20260427.sql
--   (元コメント: "フェルミ推定 回答データ蓄積テーブル" / 2026-04-27 に Supabase SQL Editor で手動適用)
--
-- 背景:
--   フェルミ推定の回答ログ(分析・ユーザー振り返り用)を蓄積する fermi_answers テーブル。
--   010_fermi_scores.sql の fermi_scores(ランキング用)とは別テーブル。
--   本番には 2026-04-27 に手動適用済みのため、既適用環境で安全な no-op になるよう
--   `create table if not exists` / `create index if not exists` / `drop policy if exists`
--   ガードを付与。新規DBではここで初めて作成される。本テーブルは他マイグレに依存せず順序非依存。
--
-- ロールバック: drop table if exists public.fermi_answers;

create table if not exists public.fermi_answers (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),

  -- 問題情報
  question_date date not null,                    -- 出題日 (例: 2026-04-27)
  question_text text not null,                    -- 問題文

  -- ユーザー識別（認証前は guest_id で管理）
  user_id       uuid references auth.users(id) on delete set null,
  guest_id      text,                             -- 未認証ユーザーの localStorage ID

  -- 回答内容
  user_input    text not null,                    -- ユーザーの回答テキスト
  hint_used     boolean not null default false,   -- ヒント使用フラグ
  elapsed_sec   integer,                          -- 解答時間（秒）

  -- AI スコア
  score           smallint,                       -- 0〜100点
  score_breakdown text,                           -- "論理性 40/50 · 独自性 25/30 · 明確さ 15/20"
  ai_feedback     text,                           -- AI フィードバック本文

  -- メタ情報
  locale        text not null default 'ja',       -- 'ja' or 'en'
  app_version   text                              -- クライアントアプリバージョン
);

-- インデックス
create index if not exists idx_fermi_answers_question_date on public.fermi_answers(question_date);
create index if not exists idx_fermi_answers_user_id       on public.fermi_answers(user_id)  where user_id  is not null;
create index if not exists idx_fermi_answers_guest_id      on public.fermi_answers(guest_id) where guest_id is not null;
create index if not exists idx_fermi_answers_score         on public.fermi_answers(score)    where score    is not null;
create index if not exists idx_fermi_answers_created_at    on public.fermi_answers(created_at desc);

-- RLS (Row Level Security)
alter table public.fermi_answers enable row level security;

-- ユーザーは自分の回答のみ閲覧可（drop で冪等化: 再適用しても重複作成にならない）
drop policy if exists "users_read_own_answers" on public.fermi_answers;
create policy "users_read_own_answers" on public.fermi_answers
  for select using (
    auth.uid() = user_id
    or guest_id = current_setting('app.guest_id', true)
  );

-- サービスロールは全件アクセス可（サーバーサイド API から使用）
-- (service_role key は RLS をバイパスするのでポリシー不要)

comment on table  public.fermi_answers               is 'フェルミ推定の回答ログ。分析・ユーザー振り返り用。';
comment on column public.fermi_answers.question_date is '出題日（毎日同じ問題なので日付でグループ可能）';
comment on column public.fermi_answers.score         is 'AI による採点結果 0〜100点';
comment on column public.fermi_answers.guest_id      is '非認証ユーザー識別子（localStorage: logic-guest-id）';
