-- 036_profile_xp.sql
--
-- AF-05 (P0): 再ログインで XP / レベルが完全消失するデータ消失バグの修正。
--
-- 背景:
--   XP は localStorage `logic-xp` 専用で、Supabase 側に保存先が無かった。
--   syncOnLogout が logic-xp を消し、syncOnLogin にも pull が無いため、
--   再ログインで端末からもリモートからも XP が完全消失していた。
--
-- 変更内容:
--   profiles.xp integer カラムを追加 (NOT NULL, default 0)。
--   level は XP から算出 (getCurrentLevel) するためカラムは不要。
--
-- 分離方針:
--   ランキング用の user_stats (PK = guest_id, ゲスト系統) はそのまま維持し、
--   profiles.xp とは別物として扱う。profiles.xp は auth user (UUID) に紐づく
--   「その人の累積 XP」の正準ストア。guest_id 系の集計とは独立。
--
-- ロールバック (手動):
--   alter table public.profiles drop column if exists xp;

alter table public.profiles
  add column if not exists xp integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_xp_nonneg;

alter table public.profiles
  add constraint profiles_xp_nonneg check (xp >= 0);

comment on column public.profiles.xp is
  '累積 XP (logic-xp の正準ストア)。level はこの値から算出。ゲスト系 user_stats.xp とは別物。';
