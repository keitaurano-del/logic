-- 030_birth_year.sql
--
-- Profile 編集機能の一環として、age (年代範囲) を birth_year (西暦) に置き換える。
-- 年齢は時間経過で変動するが、生まれ年は不変なので分析・コホート集計に向く。
--
-- 変更内容:
--   1. profiles.birth_year smallint カラム追加 (nullable, range 1900〜現在年)
--   2. 既存ユーザーの age_range 値から birth_year を逆算して埋める
--      - 'teens'   → 16歳相当
--      - '20s'     → 25歳相当
--      - '30s'     → 35歳相当
--      - '40s'     → 45歳相当
--      - '50plus'  → 55歳相当
--   3. age_range カラムは互換のため残置 (将来削除予定)
--   4. CHECK 制約: birth_year は 1900 〜 EXTRACT(YEAR FROM now()) の範囲のみ許可
--
-- ロールバック: ALTER TABLE public.profiles DROP COLUMN birth_year;

alter table public.profiles
  add column if not exists birth_year smallint;

-- 既存ユーザーの age_range から birth_year を逆算 (NULL のみ更新、既存値を尊重)
-- LR-8/#40: age_range は元々連番外の手動SQL(現 040_onboarding_profile_columns.sql)で
--   追加されたカラム。本マイグレが 040 より先に流れる新規DBでもエラーにならないよう、
--   カラム存在を実行時判定してから backfill する。本番(age_range 既存)では従来と同一挙動。
do $$
declare
  current_year int := extract(year from now())::int;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'age_range'
  ) then
    execute format($sql$
      update public.profiles
      set birth_year = case age_range
        when 'teens'  then (%1$s - 16)::smallint
        when '20s'    then (%1$s - 25)::smallint
        when '30s'    then (%1$s - 35)::smallint
        when '40s'    then (%1$s - 45)::smallint
        when '50plus' then (%1$s - 55)::smallint
        else null
      end
      where birth_year is null
        and age_range is not null
    $sql$, current_year);
  end if;
end $$;

-- CHECK 制約: 妥当な範囲のみ
alter table public.profiles
  drop constraint if exists profiles_birth_year_range;

alter table public.profiles
  add constraint profiles_birth_year_range
  check (birth_year is null or (birth_year >= 1900 and birth_year <= extract(year from now())::int));

comment on column public.profiles.birth_year is
  '生まれ年 (西暦)。プロフィール編集と分析用。age_range は deprecated。';
