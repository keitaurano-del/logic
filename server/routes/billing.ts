/**
 * billing.ts — Google Play 課金検証ルート
 *
 * createBillingRouter(deps) を呼び出して Router を取得する。
 * 依存する supabase は引数で受け取る（server/index.ts が注入する）。
 *
 * 登録されるルート:
 *   POST /api/billing/verify  — Google Play 購入検証
 *
 * 履歴: 2026-05-04 Web版廃止に伴い Stripe 関連ルート（webhook/checkout/portal/cancel）を削除。
 */

import express from 'express'
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import type { SupabaseClient } from '@supabase/supabase-js'

interface BillingDeps {
  supabase: SupabaseClient
}

export function createBillingRouter(deps: BillingDeps): express.Router {
  const { supabase } = deps
  const router = express.Router()

  // ------------------------------------------
  // Google Play Billing 購入検証 (SCRUM-116)
  // ------------------------------------------
  router.post('/api/billing/verify', async (req, res) => {
    try {
      const { purchaseToken, productId, userId } = req.body as {
        purchaseToken: string
        productId: string
        userId?: string
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
      }

      // productId からプランを特定
      type PlanType =
        | 'basic_monthly'
        | 'basic_yearly'
        | 'standard_monthly'
        | 'standard_yearly'
        | 'premium_monthly'
        | 'premium_yearly'
      const productToPlan: Record<string, PlanType> = {
        logic_basic_monthly: 'basic_monthly',
        logic_basic_yearly: 'basic_yearly',
        logic_standard_monthly: 'standard_monthly',
        logic_standard_yearly: 'standard_yearly',
        logic_premium_monthly: 'premium_monthly',
        logic_premium_yearly: 'premium_yearly',
        logic_campaign_yearly: 'standard_yearly',
      }
      const plan = productToPlan[productId]
      if (!plan) {
        return res.status(400).json({ error: `Unknown productId: ${productId}` })
      }

      // 有効期限算出: APIレスポンスの expiryTimeMillis を優先、なければ固定計算
      const isYearly = plan.endsWith('_yearly')
      const currentPeriodEnd = gpExpiryTimeMillis
        ? new Date(gpExpiryTimeMillis).toISOString()
        : new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()

      // Supabase に upsert
      if (supabase && userId) {
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

  return router
}
