-- 01_mrr_paying_users.sql
-- ダッシュボード: MRR / 課金者数推移
--
-- 目的:
--   月次の MRR (Monthly Recurring Revenue)、active 課金者数、
--   新規購読数 / チャーン数の推移を可視化する。
--
-- 集計ロジック:
--   - active 判定: subscriptions.status IN ('active', 'in_grace_period')
--     かつ current_period_end >= 月初
--   - MRR:
--       paid_monthly → 1480 JPY
--       paid_yearly  → 9800 / 12 = 816.67 JPY（年額を月次正規化）
--       free         → 0
--   - new: その月に created_at が入ったレコード（status active のみ）
--   - churn: 前月 active だったが当月 active でないユーザー
--
-- 出力: 1 行 = 1 月。Metabase で line chart にする想定。

WITH months AS (
  -- 直近 12 ヶ月のスケルトン
  SELECT generate_series(
    date_trunc('month', now()) - interval '11 months',
    date_trunc('month', now()),
    interval '1 month'
  )::date AS month_start
),
active_per_month AS (
  SELECT
    m.month_start,
    s.user_id,
    s.plan,
    s.status,
    s.created_at
  FROM months m
  LEFT JOIN public.subscriptions s
    ON s.status IN ('active', 'in_grace_period')
   AND s.current_period_end >= m.month_start
   AND s.created_at < (m.month_start + interval '1 month')
),
agg AS (
  SELECT
    month_start,
    COUNT(DISTINCT user_id) FILTER (WHERE plan IS NOT NULL) AS paying_users,
    COUNT(DISTINCT user_id) FILTER (WHERE plan = 'paid_monthly') AS monthly_users,
    COUNT(DISTINCT user_id) FILTER (WHERE plan = 'paid_yearly')  AS yearly_users,
    SUM(
      CASE plan
        WHEN 'paid_monthly' THEN 1480
        WHEN 'paid_yearly'  THEN 9800.0 / 12.0
        ELSE 0
      END
    ) AS mrr_jpy,
    COUNT(DISTINCT user_id) FILTER (
      WHERE created_at >= month_start
        AND created_at <  month_start + interval '1 month'
    ) AS new_paying_users
  FROM active_per_month
  GROUP BY month_start
),
prev_active AS (
  -- 前月 active の集合を取って churn を計算
  SELECT
    month_start,
    LAG(paying_users) OVER (ORDER BY month_start) AS prev_paying_users
  FROM agg
)
SELECT
  a.month_start,
  a.paying_users,
  a.monthly_users,
  a.yearly_users,
  ROUND(a.mrr_jpy)::int                                AS mrr_jpy,
  a.new_paying_users,
  GREATEST(COALESCE(p.prev_paying_users, 0) - a.paying_users + a.new_paying_users, 0)
    AS churned_users
FROM agg a
LEFT JOIN prev_active p USING (month_start)
ORDER BY a.month_start;
