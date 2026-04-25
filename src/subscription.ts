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
  if (isPremiumPlan()) return -1 // unlimited
  if (isStandardPlan()) return 30
  return 10
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
    case 'basic_monthly': return 'ベーシック (¥250/月)'
    case 'basic_yearly': return 'ベーシック (¥2,500/年)'
    case 'standard_monthly': return 'スタンダード (¥500/月)'
    case 'standard_yearly': return 'スタンダード (¥3,500/年)'
    case 'premium_monthly': return 'プレミアム (¥980/月)'
    case 'premium_yearly': return 'プレミアム (¥6,980/年)'
    case 'monthly': return 'スタンダード (¥500/月)'
    case 'yearly': return 'スタンダード (¥3,500/年)'
    case 'free': return '無料プラン'
    default: return '無料プラン'
  }
}

import { API_BASE } from './apiBase'

export async function startCheckout(plan: SubscriptionPlan, guestId: string, userId?: string, trial?: boolean): Promise<void> {
  // SCRUM-121: Android native → Google Play Billingへルーティング（SCRUM-116完成待ち）
  if (isAndroidNative()) {
    throw new Error('Google Play購入は現在準備中です。')
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
  // SCRUM-121: Android native → Google Play Billing (SCRUM-116完成待ち)
  if (isAndroidNative()) {
    // Google Play Billing 導入待ちのスタブ。SCRUM-116完了後に実装済みの購入フローを呼び出す。
    throw new Error('Google Play購入は現在準備中です。ウェブ版はブラウザでお試しください。')
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
