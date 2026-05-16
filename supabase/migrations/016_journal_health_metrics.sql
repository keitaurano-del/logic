-- 016_journal_health_metrics.sql
-- 2026-05-16: ジャーナルに Health Connect 由来の身体活動指標を保存
--
-- 追加カラム:
--   - daily_journals.steps_count   integer   — 当日の合計歩数
--   - daily_journals.sleep_minutes integer   — 前夜の睡眠時間（分）
--   - daily_journals.sleep_start   timestamptz — 前夜の睡眠開始時刻
--   - daily_journals.sleep_end     timestamptz — 前夜の睡眠終了時刻
--
-- いずれも端末側 Health Connect / HealthKit から取得したスナップショット。
-- 取得できなかった日は NULL のまま（既存行の意味は壊さない）。

alter table daily_journals
  add column if not exists steps_count integer,
  add column if not exists sleep_minutes integer,
  add column if not exists sleep_start timestamptz,
  add column if not exists sleep_end timestamptz;

-- 値域チェック（負数・極端値の混入防止）
alter table daily_journals
  drop constraint if exists daily_journals_steps_count_check;
alter table daily_journals
  add constraint daily_journals_steps_count_check
  check (steps_count is null or (steps_count >= 0 and steps_count <= 200000));

alter table daily_journals
  drop constraint if exists daily_journals_sleep_minutes_check;
alter table daily_journals
  add constraint daily_journals_sleep_minutes_check
  check (sleep_minutes is null or (sleep_minutes >= 0 and sleep_minutes <= 1440));
