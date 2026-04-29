const STORAGE_KEY = 'logic-subscription'
const TRIAL_DAYS = 7

import { createClient } from '@supabase/supabase-js'

export type SubscriptionPlan =
  | 'trial'
  | 'free'
  | 'monthly'
  | 'yearly'
  | 'basic_monthly'
  | 'basic_yearly'
  | 'standard_monthly'
  | 'standard_yearly'
  | 'premium_monthly'
  | 'premium_yearly'

// SCRUM-182: 新プラン価格定義（年額 = 月額×7ヶ月分）
export const PLAN_PRICES = {
  basic_monthly: 250,
  basic_yearly: 1750,      // 月額×7ヶ月分お得
  standard_monthly: 650,
  standard_yearly: 4550,   // 月額×7ヶ月分お得
  premium_monthly: 980,
  premium_yearly: 6860,    // 月額×7ヶ月分お得
  beta_campaign: 1980,
} as const

export type SubscriptionState = {
  trialStartedAt: string | null
  plan: SubscriptionPlan
  expiresAt: string | null
  stripeSessionId: string | null
}

const DEFAULT_STATE: SubscriptionState = {
  trialStartedAt: null,
  plan: 'free',
  expiresAt: null,
  stripeSessionId: null,
}

function load(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch { /* */ }
  return { ...DEFAULT_STATE }
}

function save(s: SubscriptionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function getSubscriptionState(): SubscriptionState {
  const s = load()
  if (!s.trialStartedAt && s.plan === 'free') {
    s.trialStartedAt = new Date().toISOString()
    s.plan = 'trial'
    save(s)
  }
  if (s.plan === 'trial' && s.trialStartedAt) {
    const elapsed = Date.now() - new Date(s.trialStartedAt).getTime()
    if (elapsed > TRIAL_DAYS * 86400000) {
      s.plan = 'free'
      save(s)
    }
  }
  const paidPlans: SubscriptionPlan[] = ['monthly', 'yearly', 'basic_monthly', 'basic_yearly', 'standard_monthly', 'standard_yearly', 'premium_monthly', 'premium_yearly']
  if (paidPlans.includes(s.plan) && s.expiresAt) {
    if (Date.now() > new Date(s.expiresAt).getTime()) {
      s.plan = 'free'
      save(s)
    }
  }
  return s
}

export function daysLeftInTrial(): number {
  const s = load()
  if (s.plan !== 'trial' || !s.trialStartedAt) return 0
  const elapsed = Date.now() - new Date(s.trialStartedAt).getTime()
  const remaining = TRIAL_DAYS * 86400000 - elapsed
  return Math.max(0, Math.ceil(remaining / 86400000))
}

// Beta mode: true = 全機能無料開放、課金UI非表示
// Android正式課金(Google Play Billing)導入時にfalseに戻す
export const BETA_MODE = true

export function isBasicPlan(): boolean {
  if (BETA_MODE) return true
  const s = getSubscriptionState()
  return s.plan === 'basic_monthly' || s.plan === 'basic_yearly'
}

export function isPremiumPlan(): boolean {
  if (BETA_MODE) return true
  const s = getSubscriptionState()
  return s.plan === 'premium_monthly' || s.plan === 'premium_yearly' || s.plan === 'trial'
}

export function isStandardPlan(): boolean {
  const s = getSubscriptionState()
  return s.plan === 'standard_monthly' || s.plan === 'standard_yearly' || s.plan === 'monthly' || s.plan === 'yearly'
}

export function getAIGenerationLimit(): number {
  if (BETA_MODE) return -1
  const s = getSubscriptionState()
  // SCRUM-182: 新プラン別制限
  if (s.plan === 'premium_monthly' || s.plan === 'premium_yearly') return 200 // 月200問
  if (s.plan === 'standard_monthly' || s.plan === 'standard_yearly') return 30  // 月30問
  if (s.plan === 'trial') return 30
  if (s.plan === 'monthly' || s.plan === 'yearly') return 30 // legacy
  return 0 // フリーはAI生成不可
}

export function getRoleplayLimit(): number {
  if (BETA_MODE) return -1
  const s = getSubscriptionState()
  if (s.plan === 'premium_monthly' || s.plan === 'premium_yearly') return -1 // 無制限
  if (s.plan === 'standard_monthly' || s.plan === 'standard_yearly') return 3  // 月3回
  if (s.plan === 'trial') return 3
  return 0 // フリーはロールプレイ不可
}

export function canAccessAdvancedLessons(): boolean {
  if (BETA_MODE) return true
  const s = getSubscriptionState()
  const paid: SubscriptionPlan[] = ['standard_monthly', 'standard_yearly', 'premium_monthly', 'premium_yearly', 'monthly', 'yearly', 'trial']
  return paid.includes(s.plan)
}

export async function getPremiumStatus(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || !supabaseAnonKey) return false

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // admin_overrides テーブルを確認
    const { data: override } = await supabase
      .from('admin_overrides')
      .select('plan')
      .eq('user_id', userId)
      .single()

    if (override?.plan) return true

    const { data } = await supabase
      .from('subscriptions')
      .select('status, plan, current_period_end')
      .eq('user_id', userId)
      .single()

    if (!data) return false
    if (data.plan === 'free') return false
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) return false
    return data.status === 'active'
  } catch {
    return false
  }
}

export function isPremium(): boolean {
  if (BETA_MODE) return true
  // 認証済みユーザーの場合は非同期の getPremiumStatus() を使用してください。
  // ここでは localStorage フォールバックを返します。
  const s = getSubscriptionState()
  return s.plan === 'trial'
    || s.plan === 'monthly'
    || s.plan === 'yearly'
    || s.plan === 'basic_monthly'
    || s.plan === 'basic_yearly'
    || s.plan === 'standard_monthly'
    || s.plan === 'standard_yearly'
    || s.plan === 'premium_monthly'
    || s.plan === 'premium_yearly'
}

export function setPaidPlan(plan: SubscriptionPlan, sessionId: string, expiresAt: string) {
  const s = load()
  s.plan = plan
  s.stripeSessionId = sessionId
  s.expiresAt = expiresAt
  save(s)
}

export function getPlanLabel(): string {
  const s = getSubscriptionState()
  switch (s.plan) {
    case 'trial': return `7日間トライアル (残り${daysLeftInTrial()}日)`
    case 'basic_monthly': return 'スタンダード (¥650/月)' // legacy basic → standard稱号
    case 'basic_yearly': return 'スタンダード (¥4,500/年)'
    case 'standard_monthly': return 'スタンダード (¥650/月)'
    case 'standard_yearly': return 'スタンダード (¥4,500/年)'
    case 'premium_monthly': return 'プレミアム (¥1,400/月)'
    case 'premium_yearly': return 'プレミアム (¥9,800/年)'
    case 'monthly': return 'スタンダード (¥650/月)'
    case 'yearly': return 'スタンダード (¥4,500/年)'
    case 'free': return '無料 (キャンペーン中)'
    default: return '無料 (キャンペーン中)'
  }
}

import { API_BASE } from './apiBase'
import { purchaseProduct } from './billing'
import { PLAY_PRODUCTS } from './billing/products'

// ── Google Play product ID mapping (SCRUM-116) ─────────────────────
export function planToPlayProductId(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'basic_monthly':    return PLAY_PRODUCTS.basic_monthly
    case 'basic_yearly':     return PLAY_PRODUCTS.basic_yearly
    case 'standard_monthly': return PLAY_PRODUCTS.standard_monthly
    case 'standard_yearly':  return PLAY_PRODUCTS.standard_yearly
    case 'premium_monthly':  return PLAY_PRODUCTS.premium_monthly
    case 'premium_yearly':   return PLAY_PRODUCTS.premium_yearly
    // Legacy plan names → map to closest equivalent
    case 'monthly':          return PLAY_PRODUCTS.standard_monthly
    case 'yearly':           return PLAY_PRODUCTS.standard_yearly
    // Non-purchasable plans
    default:                 return PLAY_PRODUCTS.standard_monthly
  }
}

export async function startCheckout(plan: SubscriptionPlan, guestId: string, userId?: string, trial?: boolean): Promise<void> {
  // SCRUM-116/121: Android native → Google Play Billing
  if (isAndroidNative()) {
    const productId = planToPlayProductId(plan)
    await purchaseProduct(productId)
    return
  }
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, guestId, userId, trial }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'チェックアウトに失敗しました')
  }
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else throw new Error('チェックアウトURLが取得できませんでした')
}

export async function verifyCheckout(sessionId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/checkout-verify?session_id=${sessionId}`)
  if (!res.ok) return false
  const data = await res.json()
  if (data.paid && data.plan && data.expiresAt) {
    setPaidPlan(data.plan as SubscriptionPlan, sessionId, data.expiresAt)
    return true
  }
  return false
}

// ── Platform detection (SCRUM-121) ─────────────────────────────
// Web/iOS → Stripe checkout
// Android native (Capacitor) → Google Play Billing (SCRUM-116)
export type Platform = 'android-native' | 'web'

export function detectPlatform(): Platform {
  try {
    // Capacitor.getPlatform() はネイティブで 'android'|'ios'|'web' を返す
    const cap = (window as unknown as Record<string, unknown>).Capacitor as { getPlatform?: () => string } | undefined
    if (cap?.getPlatform) {
      return cap.getPlatform() === 'android' ? 'android-native' : 'web'
    }
  } catch { /* ignore */ }
  return 'web'
}

export function isAndroidNative(): boolean {
  return detectPlatform() === 'android-native'
}

// ── Beta Campaign ────────────────────────────────────────────────
// ¥1,980/year plan with 7-day free trial
// On Android: will use Google Play Billing (SCRUM-116)
// On Web/iOS: falls through to Stripe checkout

export const BETA_CAMPAIGN_PLAN: SubscriptionPlan = 'premium_yearly'

export async function startBetaCampaignCheckout(guestId: string, userId?: string): Promise<void> {
  // SCRUM-116/121: Android native → Google Play Billing
  if (isAndroidNative()) {
    const productId = planToPlayProductId(BETA_CAMPAIGN_PLAN)
    await purchaseProduct(productId)
    return
  }
  // Web / iOS: Stripe checkout with beta_campaign flag
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: BETA_CAMPAIGN_PLAN,
      guestId,
      userId,
      trial: true,
      betaCampaign: true,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'チェックアウトに失敗しました')
  }
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else throw new Error('チェックアウトURLが取得できませんでした')
}
