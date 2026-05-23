-- 05_rtdn_status.sql
-- ダッシュボード: RTDN (Real Time Developer Notifications) ステータス分布
--
-- 目的:
--   Google Play から届く RTDN の notificationType (1-13) を集計して、
--   チャーン状況・更新失敗・払戻し等の異常を早期検知する。
--
-- notificationType 一覧（subscriptionNotification.notificationType）:
--   1=RECOVERED, 2=RENEWED, 3=CANCELED, 4=PURCHASED, 5=ON_HOLD,
--   6=IN_GRACE_PERIOD, 7=RESTARTED, 8=PRICE_CHANGE_CONFIRMED,
--   9=DEFERRED, 10=PAUSED, 11=PAUSE_SCHEDULE_CHANGED,
--   12=REVOKED, 13=EXPIRED
--
-- 集計ロジック:
--   - 直近 30 日に受信した RTDN の件数を notificationType 別に集計
--   - 直近 7 日と 30 日の比較で短期トレンドも見る
--   - チャーン系 (3=CANCELED, 12=REVOKED, 13=EXPIRED) を別カラムで色分けできるよう label を付与
--
-- 出力: 1 行 = 1 notificationType。Metabase で棒グラフ + 折れ線（日次）想定。

SELECT
  notification_type_last AS notification_type,
  CASE notification_type_last
    WHEN  1 THEN '01 RECOVERED'
    WHEN  2 THEN '02 RENEWED'
    WHEN  3 THEN '03 CANCELED'
    WHEN  4 THEN '04 PURCHASED'
    WHEN  5 THEN '05 ON_HOLD'
    WHEN  6 THEN '06 IN_GRACE_PERIOD'
    WHEN  7 THEN '07 RESTARTED'
    WHEN  8 THEN '08 PRICE_CHANGE_CONFIRMED'
    WHEN  9 THEN '09 DEFERRED'
    WHEN 10 THEN '10 PAUSED'
    WHEN 11 THEN '11 PAUSE_SCHEDULE_CHANGED'
    WHEN 12 THEN '12 REVOKED'
    WHEN 13 THEN '13 EXPIRED'
    ELSE 'UNKNOWN'
  END AS label,
  CASE
    WHEN notification_type_last IN (3, 12, 13) THEN 'churn'
    WHEN notification_type_last IN (5, 6)       THEN 'at_risk'
    WHEN notification_type_last IN (1, 2, 4, 7) THEN 'healthy'
    ELSE 'other'
  END AS category,
  COUNT(*) FILTER (
    WHERE notification_received_at >= now() - interval '7 days'
  ) AS count_7d,
  COUNT(*) FILTER (
    WHERE notification_received_at >= now() - interval '30 days'
  ) AS count_30d,
  COUNT(*) AS count_all_time,
  MAX(notification_received_at) AS last_received_at
FROM public.subscriptions
WHERE notification_type_last IS NOT NULL
GROUP BY notification_type_last
ORDER BY notification_type_last;
