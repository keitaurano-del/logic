-- 02_retention_cohort.sql
-- ダッシュボード: D1 / D7 / D30 残存率
--
-- 目的:
--   登録週ごとのコホートで、N 日後にアクティブだったユーザーの割合を出す。
--   アクティブの定義は「その日に study_sessions が 1 件以上」。
--
-- 集計ロジック:
--   - コホート: auth.users.created_at の週単位（直近 12 週分）
--   - active_on_day: study_sessions.started_at の DATE を user_id ごとに distinct
--   - D1 = 登録日 + 1 日, D7 = +7 日, D30 = +30 日にアクティブかどうか
--   - retention_rate = (アクティブだったコホートメンバー数) / (コホートサイズ)
--
-- 出力: 1 行 = 1 コホート。Metabase で line chart (D1/D7/D30) 想定。

WITH cohort_users AS (
  SELECT
    id AS user_id,
    date_trunc('week', created_at)::date AS cohort_week,
    created_at::date AS signup_date
  FROM public.metabase_users
  WHERE created_at >= now() - interval '12 weeks'
),
sessions_per_day AS (
  SELECT DISTINCT
    user_id,
    started_at::date AS active_date
  FROM public.study_sessions
  WHERE started_at >= now() - interval '13 weeks'
),
cohort_active AS (
  SELECT
    c.cohort_week,
    c.user_id,
    BOOL_OR(s.active_date = c.signup_date + 1)  AS active_d1,
    BOOL_OR(s.active_date = c.signup_date + 7)  AS active_d7,
    BOOL_OR(s.active_date = c.signup_date + 30) AS active_d30
  FROM cohort_users c
  LEFT JOIN sessions_per_day s ON s.user_id = c.user_id
  GROUP BY c.cohort_week, c.user_id
)
SELECT
  cohort_week,
  COUNT(*) AS cohort_size,
  ROUND(100.0 * COUNT(*) FILTER (WHERE active_d1)  / NULLIF(COUNT(*), 0), 1) AS d1_retention_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE active_d7)  / NULLIF(COUNT(*), 0), 1) AS d7_retention_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE active_d30) / NULLIF(COUNT(*), 0), 1) AS d30_retention_pct
FROM cohort_active
GROUP BY cohort_week
ORDER BY cohort_week;
