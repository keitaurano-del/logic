-- 019_rtdn_columns.sql
-- 2026-05-21: Real Time Developer Notifications (RTDN) 受信用カラム追加
--
-- Play Console > Monetization setup > RTDN で Pub/Sub topic を設定し、
-- サブスク更新・解約・払い戻し等の通知を `POST /api/billing/rtdn` で受け取る。
-- 受信履歴の最低限のトレース用に 2 カラム追加する。
--
-- 既存カラム（追加しない）:
--   - status               text   — RTDN で 'active'/'canceled'/'on_hold'/'in_grace_period'/'revoked'/'expired' 等に更新
--   - current_period_end   timestamptz — RENEWED/PURCHASED 時に Google Play API から取り直して更新
--   - stripe_subscription_id text — `gp:<purchaseToken>` 形式で保存、RTDN ハンドラの検索 key
--
-- 追加カラム:
--   - notification_type_last     int          — 直近に受信した RTDN notificationType (1-13)
--   - notification_received_at   timestamptz  — 直近の RTDN 受信時刻

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS notification_type_last int,
  ADD COLUMN IF NOT EXISTS notification_received_at timestamptz;

-- purchaseToken (gp:プレフィックス付き) での検索を高速化
-- RTDN ハンドラが毎回 stripe_subscription_id で lookup するため。
CREATE INDEX IF NOT EXISTS idx_subscriptions_gp_token
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id LIKE 'gp:%';

COMMENT ON COLUMN public.subscriptions.notification_type_last IS
  'Last received Google Play RTDN subscriptionNotification.notificationType (1=RECOVERED, 2=RENEWED, 3=CANCELED, 4=PURCHASED, 5=ON_HOLD, 6=IN_GRACE_PERIOD, 7=RESTARTED, 12=REVOKED, 13=EXPIRED)';
COMMENT ON COLUMN public.subscriptions.notification_received_at IS
  'Timestamp when the last RTDN was received by /api/billing/rtdn';
