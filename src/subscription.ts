const STORAGE_KEY = 'logic-subscription'
const TRIAL_DAYS = 7

import { createClient } from '@supabase/supabase-js'
import { purchaseProduct, verifyPurchase } from './billing'
import { PLAY_PRODUCTS } from './billing/products'

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

// SCRUM-182: 新プラン価格定義（消費税込み、Android Play Store決済対応）
export const PLAN_PRICES = {
  basic_monthly: 250,
  basic_yearly: 1750,
  standard_monthly: 390,      // 消費税込み
  standard_yearly: 2730,      // 消費税込み
  premium_monthly: 760,       // 消費税込み
  premium_yearly: 5320,       // 消費税込み
  beta_campaign: 1980,
} as const

export type SubscriptionState = {
  trialStartedAt: string | null
  plan: SubscriptionPlan
  expiresAt: string | null
  playStoreToken: string | null // Google Play 購買トークン（RTDN用）
}

const DEFAULT_STATE: SubscriptionState = {
  trialStartedAt: null,
  plan: 'free',
  expiresAt: null,
  playStoreToken: null,
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

export function setPaidPlan(plan: SubscriptionPlan, expiresAt: string, playStoreToken?: string) {
  const s = load()
  s.plan = plan
  s.expiresAt = expiresAt
  if (playStoreToken) s.playStoreToken = playStoreToken
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

// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Google Play Billing (2026-05-01: App版のみリリース、Play Store決済一本化)
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export function planToPlayProductId(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'standard_monthly': return PLAY_PRODUCTS.standard_monthly
    case 'standard_yearly':  return PLAY_PRODUCTS.standard_yearly
    // Legacy plan names → map to closest equivalent
    case 'basic_monthly':
    case 'monthly':          return PLAY_PRODUCTS.standard_monthly
    case 'basic_yearly':
    case 'yearly':           return PLAY_PRODUCTS.standard_yearly
    case 'premium_monthly':
    case 'premium_yearly':   return PLAY_PRODUCTS.campaign_yearly
    // Non-purchasable plans
    default:                 return PLAY_PRODUCTS.standard_monthly
  }
}

/**
 * App版リリース後: Play Store Billing のみ使用
 * Web版は廃止済み（2026-05-01）
 */
export async function startCheckout(plan: SubscriptionPlan): Promise<void> {
  const productId = planToPlayProductId(plan)
  try {
    const purchase = await purchaseProduct(productId)
    // Purchase successful - verify with server
    await verifyPurchase({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
    })
    // Update local subscription state
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // TODO: calculate from receipt
    setPaidPlan(plan, expiresAt, purchase.purchaseToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : '購入に失敗しました'
    throw new Error(message)
  }
}

export const BETA_CAMPAIGN_PLAN: SubscriptionPlan = 'standard_yearly'

export async function startBetaCampaignCheckout(): Promise<void> {
  const productId = PLAY_PRODUCTS.campaign_yearly
  try {
    const purchase = await purchaseProduct(productId)
    await verifyPurchase({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
    })
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    setPaidPlan(BETA_CAMPAIGN_PLAN, expiresAt, purchase.purchaseToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'キャンペーン購入に失敗しました'
    throw new Error(message)
  }
}

// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Platform detection
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// AI問題生成 日次制限（Keita-san指定: フリー0/スタンダード3/プレミアム10）
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const AI_GEN_DAILY_KEY = 'logic-ai-gen-daily'
const TODAY_STR = () => new Date().toISOString().slice(0, 10)

export function getAIGenDailyLimit(): number {
  if (isPremiumPlan()) return 10
  if (isStandardPlan()) return 3
  return 0
}

export function getAIGenDailyCount(): number {
  try {
    const s = JSON.parse(localStorage.getItem(AI_GEN_DAILY_KEY) || '{}')
    return s.date === TODAY_STR() ? (s.count ?? 0) : 0
  } catch { return 0 }
}

export function incrementAIGenDailyCount() {
  try {
    const c = getAIGenDailyCount()
    localStorage.setItem(AI_GEN_DAILY_KEY, JSON.stringify({ date: TODAY_STR(), count: c + 1 }))
  } catch { /* */ }
}
