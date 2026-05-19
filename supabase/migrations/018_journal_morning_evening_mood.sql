-- 018_journal_morning_evening_mood.sql
-- 2026-05-19: ジャーナルの mood / weather を朝・夜で別々に保存できるようカラムを追加
--
-- 追加内容:
--   1. daily_journals.morning_mood, morning_weather, evening_mood, evening_weather
--   2. 既存 mood / weather は evening_* にバックフィル（旧クライアントは「夜」前提で書き込んでいた）
--   3. legacy の mood / weather カラムは互換のため一旦残す（将来削除）

alter table public.daily_journals
  add column if not exists morning_mood int check (morning_mood between 1 and 5),
  add column if not exists morning_weather text check (morning_weather in ('sunny', 'cloudy', 'rainy', 'snowy')),
  add column if not exists evening_mood int check (evening_mood between 1 and 5),
  add column if not exists evening_weather text check (evening_weather in ('sunny', 'cloudy', 'rainy', 'snowy'));

-- 既存データを evening_* に複写（evening_* が NULL の行のみ）
update public.daily_journals
  set evening_mood = mood
  where evening_mood is null and mood is not null;

update public.daily_journals
  set evening_weather = weather
  where evening_weather is null and weather is not null;
