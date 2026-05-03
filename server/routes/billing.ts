/**
 * billing.ts — Stripe / Google Play 課金系ルート
 *
 * createBillingRouter(deps) を呼び出して Router を取得する。
 * 依存する stripe・supabase・PLANS はすべて引数で受け取る（server/index.ts が注入する）。
 *
 * 登録されるルート（Router マウント先は呼び出し側が決める）:
 *   POST /api/stripe/webhook        — Stripe webhook (RAW body 付き)
 *   POST /api/checkout              — Checkout セッション作成
 *   GET  /api/checkout-verify       — Checkout セッション検証
 *   POST /api/billing/verify        — Google Play 購入検証
 *   POST /api/subscription/portal   — Stripe Customer Portal
 *   POST /api/subscription/cancel   — サブスクキャンセル
 */

import express from 'express'
import Stripe from 'stripe'
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import type { SupabaseClient } from '@supabase/supabase-js'

// =============================================
// 型定義
// =============================================

type PlanKey =
  | 'monthly'
  | 'yearly'
  | 'basic_monthly'
  | 'basic_yearly'
  | 'standard_monthly'
  | 'standard_yearly'
  | 'premium_monthly'
  | 'premium_yearly'
  | 'beta_campaign'

interface PlanConfig {
  priceId: string
  amount: number
  interval: 'month' | 'year'
}

interface BillingDeps {
  stripe: Stripe | null
  supabase: SupabaseClient
  PLANS: Record<PlanKey, PlanConfig>
}

// =============================================
// Router ファクトリ
// =============================================

export function createBillingRouter(deps: BillingDeps): express.Router {
  const { stripe, supabase, PLANS } = deps
  const router = express.Router()

  // ------------------------------------------
  // Stripe Webhook
  // RAW ボディが必要なので express.raw() を先に適用する
  // ------------------------------------------
  router.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      let event: Stripe.Event

      if (!webhookSecret) {
        if (process.env.NODE_ENV === 'development') {
          // 開発環境のみ署名検証をスキップ
          try {
            event = JSON.parse(req.body.toString()) as Stripe.Event
          } catch {
            return res.status(400).json({ error: 'Invalid JSON' })
          }
        } else {
          return res.status(400).json({ error: 'Webhook secret not configured' })
        }
      } else {
        const sig = req.headers['stripe-signature'] as string
        try {
          if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          console.error('[webhook] Signature verification failed:', message)
          return res.status(400).json({ error: `Webhook error: ${message}` })
        }
      }

      try {
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = sub.customer as string
            // Price ID からプランを特定
            const priceId = sub.items.data[0]?.price?.id || ''
            const interval = sub.items.data[0]?.price?.recurring?.interval
            let plan = interval === 'year' ? 'yearly' : 'monthly'
            if (priceId === process.env.STRIPE_PRICE_BASIC_MONTHLY) plan = 'basic_monthly'
            else if (priceId === process.env.STRIPE_PRICE_BASIC_YEARLY) plan = 'basic_yearly'
            else if (priceId === process.env.STRIPE_PRICE_STANDARD_MONTHLY) plan = 'standard_monthly'
            else if (priceId === process.env.STRIPE_PRICE_STANDARD_YEARLY) plan = 'standard_yearly'
            else if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) plan = 'premium_monthly'
            else if (priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY) plan = 'premium_yearly'
            else if (priceId === process.env.STRIPE_PRICE_BETA_CAMPAIGN) plan = 'premium_yearly'
            const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

            // customer_id → user_id を profiles テーブルから取得
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profile?.id) {
              await supabase.from('subscriptions').upsert(
                {
                  user_id: profile.id,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: sub.id,
                  plan,
                  status: sub.status === 'active' ? 'active' : sub.status,
                  current_period_end: periodEnd,
                },
                { onConflict: 'user_id' }
              )
            }
            break
          }

          case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = sub.customer as string

            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profile?.id) {
              await supabase
                .from('subscriptions')
                .update({ plan: 'free', status: 'inactive' })
                .eq('user_id', profile.id)
            }
            break
          }

          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const customerId = session.customer as string
            const userId = session.metadata?.userId || session.client_reference_id

            if (userId && customerId) {
              await supabase
                .from('profiles')
                .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
            }
            break
          }

          default:
            console.log(`[webhook] Unhandled event type: ${event.type}`)
        }

        res.json({ received: true })
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        console.error('[webhook] Handler error:', e)
        res.status(500).json({ error: message })
      }
    }
  )

  // ------------------------------------------
  // Stripe Checkout セッション作成
  // ------------------------------------------
  router.post('/api/checkout', async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
    try {
      const { plan: rawPlan, guestId, userId, trial, betaCampaign } = req.body as {
        plan: PlanKey
        guestId?: string
        userId?: string
        trial?: boolean
        betaCampaign?: boolean
      }
      const plan: PlanKey = betaCampaign ? 'beta_campaign' : rawPlan
      if (!PLANS[plan]) return res.status(400).json({ error: 'invalid plan' })
      const planConfig = PLANS[plan]
      if (!planConfig.priceId) return res.status(503).json({ error: 'price not configured' })

      // 認証済みユーザーの場合、既存の stripe_customer_id を確認して再利用
      let customerId: string | undefined
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single()

        if (profile?.stripe_customer_id) {
          customerId = profile.stripe_customer_id
        } else {
          // 新規 Stripe Customer 作成
          const customer = await stripe.customers.create({
            metadata: { userId },
          })
          customerId = customer.id
          // profiles に保存
          await supabase
            .from('profiles')
            .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
        }
      }

      const origin = (req.headers.origin as string) || `http://${req.headers.host}`
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        payment_method_collection: 'if_required',
        line_items: [{ price: planConfig.priceId, quantity: 1 }],
        ...(trial !== false ? { subscription_data: { trial_period_days: 7 } } : {}),
        success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?checkout=cancel`,
        metadata: { guestId: guestId || '', plan, userId: userId || '' },
        client_reference_id: userId || guestId || undefined,
        ...(customerId ? { customer: customerId } : {}),
      })
      res.json({ url: session.url })
    } catch (e: unknown) {
      console.error('checkout error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // ------------------------------------------
  // Stripe Checkout セッション検証
  // ------------------------------------------
  router.get('/api/checkout-verify', async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
    try {
      const sessionId = req.query.session_id as string
      if (!sessionId) return res.status(400).json({ error: 'session_id required' })
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      const plan = (session.metadata?.plan as PlanKey) || 'monthly'
      const expiresAt = new Date()
      if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      else expiresAt.setMonth(expiresAt.getMonth() + 1)
      res.json({
        paid: session.payment_status === 'paid',
        plan,
        expiresAt: expiresAt.toISOString(),
      })
    } catch (e: unknown) {
      console.error('checkout-verify error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

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
              // 購入トークンを将来の検証用に保存
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
  // Stripe Customer Portal
  // ------------------------------------------
  router.post('/api/subscription/portal', async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
    try {
      const { userId } = req.body as { userId?: string }
      if (!userId) return res.status(400).json({ error: 'userId required' })

      // profiles から stripe_customer_id を取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (!profile?.stripe_customer_id) {
        return res.status(404).json({ error: 'Stripe customer not found' })
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: process.env.APP_URL || 'https://logic-taupe.vercel.app',
      })

      res.json({ url: portalSession.url })
    } catch (e: unknown) {
      console.error('portal error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // ------------------------------------------
  // Stripe サブスクキャンセル
  // ------------------------------------------
  router.post('/api/subscription/cancel', async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
    try {
      const { userId } = req.body as { userId?: string }
      if (!userId) return res.status(400).json({ error: 'userId required' })

      // subscriptions テーブルから stripe_subscription_id を取得
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single()

      if (!sub?.stripe_subscription_id) {
        return res.status(404).json({ error: 'Subscription not found' })
      }

      // Stripe でサブスクをキャンセル
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)

      // Supabase を更新
      await supabase
        .from('subscriptions')
        .update({ plan: 'free', status: 'inactive' })
        .eq('user_id', userId)

      res.json({ success: true })
    } catch (e: unknown) {
      console.error('cancel error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
