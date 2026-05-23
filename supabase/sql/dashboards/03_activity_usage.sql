-- 03_activity_usage.sql
-- ダッシュボード: Activity 別利用時間
--
-- 目的:
--   lesson / fermi / roleplay / journal / flashcard / ai_problem / daily_problem
--   ごとに、累計学習時間とユニーク利用ユーザー数を出す。
--   どの機能が使われていてどの機能が伸び悩んでいるかを把握する。
--
-- 集計ロジック:
--   - 期間: 直近 30 日
--   - duration_minutes: SUM(duration_ms) / 60000.0
--   - unique_users: COUNT(DISTINCT user_id)
--   - sessions: 全 study_sessions 件数
--
-- 出力: 1 行 = 1 activity_type。Metabase で横棒グラフ想定。

SELECT
  activity_type,
  COUNT(*)                                 AS sessions,
  COUNT(DISTINCT user_id)                  AS unique_users,
  ROUND(SUM(duration_ms) / 60000.0, 1)     AS total_minutes,
  ROUND(AVG(duration_ms) / 60000.0, 2)     AS avg_session_minutes,
  ROUND(
    SUM(duration_ms) / 60000.0 / NULLIF(COUNT(DISTINCT user_id), 0),
    1
  ) AS minutes_per_user
FROM public.study_sessions
WHERE started_at >= now() - interval '30 days'
GROUP BY activity_type
ORDER BY total_minutes DESC;
