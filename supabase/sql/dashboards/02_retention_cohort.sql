-- 02_retention_cohort.sql
-- ダッシュボード: D1 / D7 / D30 残存率（週次コホート、daily_activity ベース、MB-2）
--
-- 目的:
--   登録週ごとのコホートで、登録から N 日後にアクティブだったユーザーの割合を出す。
--   アクティブの定義は「その日に daily_activity の行がある」。
--
-- 集計ロジック:
--   - コホート: profiles.created_at の週単位（直近 12 週分）= 登録日（コホート起点）
--   - active_date: daily_activity.active_date を user_id ごとに distinct
--   - D1 = 登録日 + 1 日, D7 = +7 日, D30 = +30 日にアクティブかどうか
--   - retention_pct = (アクティブだったコホートメンバー数) / (コホートサイズ)
--
-- 旧版は study_sessions / metabase_users を参照していたが、日次アクティブの
-- 正本を daily_activity に、登録日の正本を profiles に置き換えた（実カラムで動く形）。
-- 出力: 1 行 = 1 コホート週。Metabase で line chart (D1/D7/D30) 想定。
-- Supabase SQL Editor にそのまま貼って動く。

with cohort_users as (
  select
    id as user_id,
    date_trunc('week', created_at)::date as cohort_week,
    created_at::date as signup_date
  from public.profiles
  where created_at >= now() - interval '12 weeks'
),
active_days as (
  select distinct
    user_id,
    active_date
  from public.daily_activity
  where active_date >= (current_date - 13 * 7)
),
cohort_active as (
  select
    c.cohort_week,
    c.user_id,
    bool_or(a.active_date = c.signup_date + 1)  as active_d1,
    bool_or(a.active_date = c.signup_date + 7)  as active_d7,
    bool_or(a.active_date = c.signup_date + 30) as active_d30
  from cohort_users c
  left join active_days a on a.user_id = c.user_id
  group by c.cohort_week, c.user_id
)
select
  cohort_week,
  count(*) as cohort_size,
  round(100.0 * count(*) filter (where active_d1)  / nullif(count(*), 0), 1) as d1_retention_pct,
  round(100.0 * count(*) filter (where active_d7)  / nullif(count(*), 0), 1) as d7_retention_pct,
  round(100.0 * count(*) filter (where active_d30) / nullif(count(*), 0), 1) as d30_retention_pct
from cohort_active
group by cohort_week
order by cohort_week;
