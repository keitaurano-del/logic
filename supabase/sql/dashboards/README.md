# Metabase Dashboard SQL

Metabase の各 Question で使う SQL を本ディレクトリにバージョン管理する。
Metabase 上に登録した Question と本ディレクトリの `.sql` ファイルを 1:1 で対応させ、
変更履歴を Git で追跡できる状態にしておくこと。

## ファイル一覧

| ファイル | ダッシュボード | 集計概要 |
|---|---|---|
| `01_mrr_paying_users.sql` | MRR / 課金者数推移 | 月次 MRR と active 課金者数の時系列 |
| `02_retention_cohort.sql` | D1/D7/D30 残存 | 登録週コホート別残存率（profiles.created_at × daily_activity） |
| `03_activity_usage.sql` | Activity 別利用時間 | activity_type ごとの累計時間とユニークユーザー数 |
| `04_placement_distribution.sql` | Placement 偏差値分布 | 偏差値レンジ別ユーザー数 |
| `05_rtdn_status.sql` | RTDN ステータス分布 | notification_type_last 別件数・推移 |
| `06_dau_wau_mau.sql` | DAU / WAU / MAU | daily_activity ベースの日次/週次/月次アクティブユーザー数 |

## 運用ルール

1. Metabase で Question を新規作成 / 編集したら、対応する `.sql` ファイルを更新して commit する。
2. SQL の DRY-run は Metabase の "Open Editor" → "Preview" で確認する。
3. 集計ロジックを変えるときは PR レビューを経由して docs/ANALYTICS_DASHBOARD.md の指標解釈も同期更新する。
4. 値の単位（円・%・件など）は SELECT 句のカラム alias に明示する（例: `mrr_jpy`、`retention_rate_pct`）。

## 前提テーブル

- `public.subscriptions` (plan, status, current_period_end, notification_type_last, notification_received_at, ...)
- `public.study_sessions` (activity_type, duration_ms, started_at, user_id)
- `public.daily_activity` (user_id, active_date — `037_daily_activity.sql` で作成。DAU/継続率の元)
- `public.profiles` (id, created_at — 登録日コホートの起点)
- `public.placement_results` (deviation, user_id)
- `public.metabase_users` (id, created_at — auth.users のラップ view、`021_metabase_readonly.sql` で作成)

## 通貨レート

MRR 計算は **円ベース**で固定。プラン定価は以下:

| plan | 月次正規化 MRR (JPY) |
|---|---|
| `paid_monthly` | 1480 |
| `paid_yearly`  | 9800 / 12 ≒ 817 |
| `free`         | 0 |

`logic_paid_monthly` / `logic_paid_yearly` の Play Console 価格と一致させること。
価格改定時は `01_mrr_paying_users.sql` 内の CASE 式を更新する。
