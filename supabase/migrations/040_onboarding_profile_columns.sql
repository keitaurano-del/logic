-- 040_onboarding_profile_columns.sql
--
-- LR-8 / #40: 連番 migration 外で手動適用されていた SQL を取込・冪等化。
-- 取込元: scripts/migrate_profiles_20260427.sql
--   (元コメント: "SCRUM-153 ユーザー属性カラム追加" / 2026-04-27 に Supabase SQL Editor で手動適用)
--
-- 背景:
--   オンボーディング(SCRUM-153)で収集するユーザー属性カラムを profiles に追加する。
--   本番には 2026-04-27 に手動適用済みのため、本マイグレは既適用環境で安全な no-op になるよう
--   すべて `if not exists` ガード付き。新規DBではここで初めてカラムが作られる。
--
-- 注意 (順序):
--   profiles.age_range は 030_birth_year.sql の backfill が参照する。030 側は age_range カラムの
--   有無を実行時に判定する DO ブロックに改修済みのため、本マイグレ(040)が 030 より後に流れても
--   新規DBで 030 が失敗しないようになっている。
--
-- ロールバック:
--   alter table public.profiles
--     drop column if exists age_range,
--     drop column if exists occupation,
--     drop column if exists purposes,
--     drop column if exists self_assessment,
--     drop column if exists onboarded_at;

alter table public.profiles add column if not exists age_range       text;
alter table public.profiles add column if not exists occupation      text;
alter table public.profiles add column if not exists purposes        text[];
alter table public.profiles add column if not exists self_assessment smallint;
alter table public.profiles add column if not exists onboarded_at    timestamptz;

-- インデックス（将来の分析クエリ用）
create index if not exists idx_profiles_age_range  on public.profiles(age_range);
create index if not exists idx_profiles_occupation on public.profiles(occupation);

comment on column public.profiles.age_range       is '年代範囲。030 以降は birth_year に置換 (deprecated だが互換のため残置)。';
comment on column public.profiles.occupation      is '職業 (オンボーディング SCRUM-153)。';
comment on column public.profiles.purposes        is '利用目的 (複数選択, オンボーディング SCRUM-153)。';
comment on column public.profiles.self_assessment is '自己評価 (オンボーディング SCRUM-153)。';
comment on column public.profiles.onboarded_at    is 'オンボーディング完了時刻。';
