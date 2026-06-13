/**
 * billing.ts — Google Play 課金検証ルート
 *
 * createBillingRouter(deps) を呼び出して Router を取得する。
 * 依存する supabase は引数で受け取る（server/index.ts が注入する）。
 *
 * 登録されるルート:
 *   POST /api/billing/verify  — Google Play 購入検証
 *   POST /api/billing/rtdn    — Real Time Developer Notifications (Pub/Sub Push)
 *
 * 履歴:
 *   2026-05-04 Web版廃止に伴い Stripe 関連ルート（webhook/checkout/portal/cancel）を削除。
 *   2026-05-21 RTDN endpoint 追加（Pub/Sub Push 経由でサブスク状態を Supabase に反映）。
 */

import express from 'express'
import rateLimit from 'express-rate-limit'
import { google } from 'googleapis'
import { GoogleAuth, OAuth2Client } from 'google-auth-library'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveAuthedUser } from '../auth.js'

// Pub/Sub JWT 署名検証用クライアント（シングルトン）。
// Google は https://www.googleapis.com/oauth2/v3/certs の公開鍵で JWT に署名し、
// audience には Push subscription を受け取るエンドポイント URL が入る。
const _pubsubVerifyClient = new OAuth2Client()

/**
 * Pub/Sub Push リクエストの Authorization Bearer JWT を検証する。
 * - 検証に使う audience: RTDN_ENDPOINT_URL 環境変数（未設定時はスキップ）
 * - email が *.gcp-sa-pubsub.iam.gserviceaccount.com であることを確認
 * - 失敗時は false を返す（throw しない）
 */
async function verifyPubSubJwt(authHeader: string | undefined): Promise<boolean> {
  // 環境変数未設定の場合は検証スキップ（RTDN 設定前の開発環境を壊さない）。
  const audience = process.env.RTDN_ENDPOINT_URL
  if (!audience) return true

  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  if (!token) return false

  try {
    const ticket = await _pubsubVerifyClient.verifyIdToken({ idToken: token, audience })
    const payload = ticket.getPayload()
    return (
      payload?.email_verified === true &&
      typeof payload.email === 'string' &&
      payload.email.endsWith('.gserviceaccount.com')
    )
  } catch {
    return false
  }
}

interface BillingDeps {
  supabase: SupabaseClient
}

// /api/billing/verify 専用 limiter: 1 分あたり 10 回 / IP。
// 課金検証は購入直後のみ呼ばれる想定なのでブルートフォース耐性を上げる。
const billingVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many billing verification requests. Please wait a minute.' },
})

// /api/billing/rtdn 専用 limiter: 1 分あたり 600 回 / IP。
// Google Pub/Sub Push サーバーから大量配信される可能性があるため緩めに設定。
// Pub/Sub 側で再配信されることもあり、ack 失敗 (500 等) はリトライ嵐に繋がるので、
// レート制限に当たっても 200 を返す方が安全。とはいえ完全な無制限は避ける。
const rtdnLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many RTDN requests.' },
})

// Google Play Real Time Developer Notifications — subscriptionNotification.notificationType
// https://developer.android.com/google/play/billing/rtdn-reference
// status カラムへ反映する文字列定義もここに集約。
type RtdnStatusUpdate = {
  status: string
  // current_period_end を expiryTimeMillis で更新するか
  updatePeriodEnd?: boolean
}
const RTDN_NOTIFICATION_TYPES: Record<number, RtdnStatusUpdate> = {
  1: { status: 'active' },                          // SUBSCRIPTION_RECOVERED
  2: { status: 'active', updatePeriodEnd: true },   // SUBSCRIPTION_RENEWED
  3: { status: 'canceled' },                        // SUBSCRIPTION_CANCELED
  4: { status: 'active', updatePeriodEnd: true },   // SUBSCRIPTION_PURCHASED
  5: { status: 'on_hold' },                         // SUBSCRIPTION_ON_HOLD
  6: { status: 'in_grace_period' },                 // SUBSCRIPTION_IN_GRACE_PERIOD
  7: { status: 'active' },                          // SUBSCRIPTION_RESTARTED
  // 8: SUBSCRIPTION_PRICE_CHANGE_CONFIRMED — status 変更なし
  // 9: SUBSCRIPTION_DEFERRED — status 変更なし、expiry のみ
  // 10: SUBSCRIPTION_PAUSED, 11: SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED — ポーズ未対応
  12: { status: 'revoked' },                        // SUBSCRIPTION_REVOKED (払い戻し)
  13: { status: 'expired' },                        // SUBSCRIPTION_EXPIRED
}

export function createBillingRouter(deps: BillingDeps): express.Router {
  const { supabase } = deps
  const router = express.Router()

  // ------------------------------------------
  // Google Play Billing 購入検証 (SCRUM-116)
  // ------------------------------------------
  // express.json() がグローバル登録される前にこの router が mount されるため、
  // verify でも rtdn と同様に route 単位で JSON ボディをパースする
  // （body-parser は idempotent。グローバル json と二重でも安全）。
  router.post('/api/billing/verify', billingVerifyLimiter, express.json({ limit: '64kb' }), async (req, res) => {
    try {
      // LR-1: 認証ユーザー束縛。body.userId は信用せず、Authorization: Bearer の
      // Supabase access_token を service-role で検証して得た userId を権威とする。
      const authedUser = await resolveAuthedUser(req, supabase)
      if (!authedUser) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      const userId = authedUser.id

      const { purchaseToken, productId } = req.body as {
        purchaseToken: string
        productId: string
      }

      if (!purchaseToken || !productId) {
        return res.status(400).json({ error: 'purchaseToken and productId are required' })
      }

      // Google Play Developer API による実検証
      const gpPrivateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY
      const gpClientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL
      const gpPackageName = process.env.GOOGLE_PLAY_PACKAGE_NAME
      if (!gpPrivateKey || !gpClientEmail) {
        return res.status(503).json({ error: 'Google Play verification not configured' })
      }

      let gpExpiryTimeMillis: number | null = null
      if (gpPackageName) {
        const auth = new GoogleAuth({
          credentials: JSON.parse(gpPrivateKey) as Record<string, unknown>,
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        })
        const androidpublisher = google.androidpublisher({ version: 'v3', auth })
        const result = await androidpublisher.purchases.subscriptions.get({
          packageName: gpPackageName,
          subscriptionId: productId,
          token: purchaseToken,
        })
        const sub = result.data
        const paymentState = sub.paymentState
        const expiryTimeMillis = Number(sub.expiryTimeMillis ?? '0')
        const validPayment = paymentState === 1 || paymentState === 2
        const notExpired = expiryTimeMillis > Date.now()
        if (!validPayment || !notExpired) {
          return res.status(400).json({
            error: 'Purchase verification failed',
            details: `paymentState=${paymentState}, expiryTimeMillis=${expiryTimeMillis}`,
          })
        }
        gpExpiryTimeMillis = expiryTimeMillis

        // Acknowledgement — Play Billing 必須要件。3 日以内に ack しないと自動返金される。
        // acknowledgementState: 0=未ack, 1=ack済。冪等性のため未ackのみ呼ぶ。
        if (sub.acknowledgementState === 0) {
          try {
            await androidpublisher.purchases.subscriptions.acknowledge({
              packageName: gpPackageName,
              subscriptionId: productId,
              token: purchaseToken,
              requestBody: { developerPayload: '' },
            })
          } catch (ackErr) {
            console.error('billing/verify acknowledge failed:', ackErr)
            // ack 失敗は verify 自体は通すが、ログには残す。3日以内に再 ack できる余地を残す。
          }
        }
      }

      // productId からプランを特定（2026-05-15 単一有料プラン化）
      // - 新 ID: logic_paid_monthly / logic_paid_yearly
      // - legacy ID も後方互換のため受け付け、新型に正規化する
      type PlanType = 'paid_monthly' | 'paid_yearly'
      const productToPlan: Record<string, PlanType> = {
        logic_paid_monthly: 'paid_monthly',
        logic_paid_yearly: 'paid_yearly',
        // ─── legacy product IDs (backward compat) ───
        logic_basic_monthly: 'paid_monthly',
        logic_basic_yearly: 'paid_yearly',
        logic_standard_monthly: 'paid_monthly',
        logic_standard_yearly: 'paid_yearly',
        logic_premium_monthly: 'paid_monthly',
        logic_premium_yearly: 'paid_yearly',
        logic_campaign_yearly: 'paid_yearly',
      }
      const plan = productToPlan[productId]
      if (!plan) {
        return res.status(400).json({ error: `Unknown productId: ${productId}` })
      }

      // 有効期限算出: APIレスポンスの expiryTimeMillis を優先、なければ固定計算
      const isYearly = plan === 'paid_yearly'
      const currentPeriodEnd = gpExpiryTimeMillis
        ? new Date(gpExpiryTimeMillis).toISOString()
        : new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()

      // Supabase に upsert（user_id は認証済みユーザーに束縛、body の値は使わない）
      if (supabase) {
        await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan,
              status: 'active',
              current_period_end: currentPeriodEnd,
              // 購入トークンを将来の検証用に保存（カラム名は履歴互換で stripe_subscription_id だが Google Play 用に gp: プレフィックス付き）
              stripe_subscription_id: `gp:${purchaseToken}`,
            },
            { onConflict: 'user_id' }
          )
      }

      res.json({ success: true, plan, currentPeriodEnd })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Internal server error'
      console.error('billing/verify error:', e)
      res.status(500).json({ error: message })
    }
  })

  // ------------------------------------------
  // Real Time Developer Notifications (RTDN)
  // ------------------------------------------
  // Google Play Console > Monetization setup > RTDN で Pub/Sub topic を設定し、
  // その topic に Push subscription を作って `https://<host>/api/billing/rtdn` を指定する。
  //
  // Pub/Sub Push リクエスト形式:
  //   {
  //     "message": {
  //       "data": "<base64 encoded JSON>",
  //       "messageId": "...",
  //       "publishTime": "..."
  //     },
  //     "subscription": "projects/.../subscriptions/..."
  //   }
  //
  // 内側の data (base64 decode 後) は:
  //   {
  //     "version": "1.0",
  //     "packageName": "com.logicalthinking.app",
  //     "eventTimeMillis": "...",
  //     "subscriptionNotification": { "version", "notificationType", "purchaseToken", "subscriptionId" }
  //     // or "oneTimeProductNotification" or "testNotification"
  //   }
  //
  // express.json() がグローバルに登録される前にこの router が mount されているため、
  // route 単位で express.json() を当てる。
  router.post('/api/billing/rtdn', rtdnLimiter, express.json({ limit: '256kb' }), async (req, res) => {
    try {
      // Pub/Sub Push JWT 署名検証。
      // RTDN_ENDPOINT_URL が設定されている場合のみ検証し、不正リクエストを 401 で拒否。
      // 未設定（開発環境・RTDN 設定前）は通過させる。
      const jwtOk = await verifyPubSubJwt(req.headers.authorization)
      if (!jwtOk) {
        console.warn('rtdn: JWT verification failed, rejecting request')
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const body = req.body as {
        message?: {
          data?: string
          messageId?: string
          publishTime?: string
        }
        subscription?: string
      }

      const data = body?.message?.data
      if (!data) {
        // Pub/Sub Push の検証リクエスト等で body が空の場合がある。常に 200 で ack する。
        console.warn('rtdn: missing message.data, returning 200 ack')
        return res.status(200).json({ ok: true, ignored: 'no_data' })
      }

      let decoded: string
      try {
        decoded = Buffer.from(data, 'base64').toString('utf-8')
      } catch (e) {
        console.error('rtdn: base64 decode failed:', e)
        return res.status(200).json({ ok: true, ignored: 'invalid_base64' })
      }

      let payload: {
        version?: string
        packageName?: string
        eventTimeMillis?: string
        subscriptionNotification?: {
          version?: string
          notificationType?: number
          purchaseToken?: string
          subscriptionId?: string
        }
        oneTimeProductNotification?: {
          version?: string
          notificationType?: number
          purchaseToken?: string
          sku?: string
        }
        testNotification?: { version?: string }
      }
      try {
        payload = JSON.parse(decoded)
      } catch (e) {
        console.error('rtdn: JSON parse failed:', e, 'decoded:', decoded)
        return res.status(200).json({ ok: true, ignored: 'invalid_json' })
      }

      // testNotification (Pub/Sub topic 設定時に Play Console が送る疎通テスト) は ack のみ
      if (payload.testNotification) {
        console.log('rtdn: testNotification received, version=', payload.testNotification.version)
        return res.status(200).json({ ok: true, type: 'test' })
      }

      // 一回限り商品 (consumable / 非定期) は現状未対応。ack だけ返す。
      if (payload.oneTimeProductNotification) {
        console.log('rtdn: oneTimeProductNotification received (not handled):', payload.oneTimeProductNotification)
        return res.status(200).json({ ok: true, type: 'one_time', handled: false })
      }

      const note = payload.subscriptionNotification
      if (!note) {
        console.warn('rtdn: no subscriptionNotification in payload:', payload)
        return res.status(200).json({ ok: true, ignored: 'no_subscription_notification' })
      }

      const { notificationType, purchaseToken, subscriptionId } = note
      if (!purchaseToken || typeof notificationType !== 'number') {
        console.warn('rtdn: missing purchaseToken or notificationType:', note)
        return res.status(200).json({ ok: true, ignored: 'missing_fields' })
      }

      const update = RTDN_NOTIFICATION_TYPES[notificationType]
      if (!update) {
        console.log(`rtdn: notificationType=${notificationType} not mapped, ack only`)
        return res.status(200).json({ ok: true, type: 'unmapped', notificationType })
      }

      // purchaseToken を key に subscriptions テーブルを検索。
      // billing/verify では stripe_subscription_id に `gp:<purchaseToken>` 形式で保存している。
      const tokenKey = `gp:${purchaseToken}`

      // 更新ペイロード組み立て
      const updateData: Record<string, unknown> = {
        status: update.status,
        notification_type_last: notificationType,
        notification_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // RENEWED / PURCHASED は expiryTime を Google Play API から取り直して current_period_end を更新
      if (update.updatePeriodEnd && subscriptionId) {
        const gpPrivateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY
        const gpPackageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || payload.packageName
        if (gpPrivateKey && gpPackageName) {
          try {
            const auth = new GoogleAuth({
              credentials: JSON.parse(gpPrivateKey) as Record<string, unknown>,
              scopes: ['https://www.googleapis.com/auth/androidpublisher'],
            })
            const androidpublisher = google.androidpublisher({ version: 'v3', auth })
            const result = await androidpublisher.purchases.subscriptions.get({
              packageName: gpPackageName,
              subscriptionId,
              token: purchaseToken,
            })
            const expiryTimeMillis = Number(result.data.expiryTimeMillis ?? '0')
            if (expiryTimeMillis > 0) {
              updateData.current_period_end = new Date(expiryTimeMillis).toISOString()
            }
          } catch (gpErr) {
            // Google Play API 失敗は ack 自体は通す（リトライ嵐回避）
            console.error('rtdn: Google Play API lookup failed:', gpErr)
          }
        }
      }

      if (supabase) {
        // Phase 1: stripe_subscription_id (gp:<token>) で検索して update
        const { data: rows, error: selErr } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', tokenKey)
          .limit(1)

        if (selErr) {
          console.error('rtdn: subscriptions select failed:', selErr)
        } else if (!rows || rows.length === 0) {
          // 該当 row なし。verify 前の RTDN や別環境からの通知の可能性。warn のみで ack。
          console.warn(`rtdn: no subscription row for purchaseToken=${purchaseToken.slice(0, 12)}... type=${notificationType}`)
        } else {
          const { error: updErr } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', tokenKey)
          if (updErr) {
            console.error('rtdn: subscriptions update failed:', updErr)
          } else {
            console.log(`rtdn: updated user=${rows[0].user_id} type=${notificationType} status=${update.status}`)
          }
        }
      }

      return res.status(200).json({ ok: true, notificationType, status: update.status })
    } catch (e: unknown) {
      // 想定外エラーでも 200 を返す: Pub/Sub Push は non-2xx で再配信ループに入るため、
      // ログを残しつつ ack する方が運用上安全。
      const message = e instanceof Error ? e.message : 'Unknown RTDN error'
      console.error('rtdn: unexpected error (acked anyway):', e)
      return res.status(200).json({ ok: true, error: message })
    }
  })

  return router
}
