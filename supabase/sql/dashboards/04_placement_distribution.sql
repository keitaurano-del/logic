-- 04_placement_distribution.sql
-- ダッシュボード: Placement 偏差値分布
--
-- 目的:
--   placement test (新規ユーザーが最初に受ける診断) の結果偏差値が
--   どのレンジに分布しているかを把握する。マーケのターゲット層と
--   実利用層のズレを検出するための基礎指標。
--
-- 集計ロジック:
--   - 同一ユーザーが複数回受験した場合は最新だけ採用
--   - 偏差値レンジは <40 / 40-50 / 50-60 / 60+ の 4 階層
--   - ゲスト (user_id IS NULL かつ guest_id 持ち) も含める
--
-- 出力: 1 行 = 1 レンジ。Metabase で棒グラフ想定。

WITH latest_per_user AS (
  SELECT DISTINCT ON (COALESCE(user_id::text, guest_id))
    COALESCE(user_id::text, guest_id) AS subject_id,
    deviation,
    completed_at
  FROM public.placement_results
  WHERE deviation IS NOT NULL
  ORDER BY COALESCE(user_id::text, guest_id), completed_at DESC
),
bucketed AS (
  SELECT
    subject_id,
    deviation,
    CASE
      WHEN deviation <  40 THEN '1: <40'
      WHEN deviation <  50 THEN '2: 40-50'
      WHEN deviation <  60 THEN '3: 50-60'
      ELSE                       '4: 60+'
    END AS bucket
  FROM latest_per_user
)
SELECT
  bucket,
  COUNT(*)                                AS users,
  ROUND(AVG(deviation), 1)                AS avg_deviation,
  ROUND(MIN(deviation), 1)                AS min_deviation,
  ROUND(MAX(deviation), 1)                AS max_deviation,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_total
FROM bucketed
GROUP BY bucket
ORDER BY bucket;
