-- 06_dau_wau_mau.sql
-- ダッシュボード: DAU / WAU / MAU（daily_activity ベース、MB-2）
--
-- 前提テーブル: public.daily_activity (user_id, active_date)
--   1 行 = 1 ユーザー × 1 アクティブ日。クライアントの studyDates を
--   syncService が冪等 upsert して埋める。
--
-- Metabase では下の 3 本を別 Question として登録する想定。
-- いずれも Supabase SQL Editor にそのまま貼って動く生 SQL。

-- ── DAU: 直近 30 日の日次アクティブユーザー数（時系列） ──
select
  active_date,
  count(distinct user_id) as dau
from public.daily_activity
where active_date >= current_date - 30
group by active_date
order by active_date;


-- ── WAU: 直近 12 週の週次アクティブユーザー数 ──
select
  date_trunc('week', active_date)::date as week,
  count(distinct user_id) as wau
from public.daily_activity
where active_date >= current_date - (7 * 12)
group by 1
order by 1;


-- ── MAU: 直近 6 か月の月次アクティブユーザー数 ──
select
  date_trunc('month', active_date)::date as month,
  count(distinct user_id) as mau
from public.daily_activity
where active_date >= current_date - (30 * 6)
group by 1
order by 1;


-- ── 当日スナップショット: 今日の DAU / 直近7日の WAU / 直近30日の MAU を 1 行で ──
select
  (select count(distinct user_id) from public.daily_activity
     where active_date = current_date) as dau_today,
  (select count(distinct user_id) from public.daily_activity
     where active_date >= current_date - 6) as wau_7d,
  (select count(distinct user_id) from public.daily_activity
     where active_date >= current_date - 29) as mau_30d;
