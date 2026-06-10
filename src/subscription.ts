const STORAGE_KEY = 'logic-subscription'
// LR-2: サーバ権威のエンタイトルメント判定をセッション内にキャッシュするキー。
// サーバ応答（/api/entitlement）が取れたらこれを優先し、localStorage はオフライン時の
// フォールバックとして残す。'1'=有料 / '0'=無料 / 未設定=サーバ未確認。
const ENTITLEMENT_CACHE_KEY = 'logic-entitlement-authoritative'

import { createClient } from '@supabase/supabase-js'
import { API_BASE } from './apiBase'
import { getSupabaseClient } from './supabase'
import { purchaseProduct, verifyPurchase } from './billing'
import { PLAY_PRODUCTS, mapProductIdToPlan } from './billing/products'

// ──────────────────────────────────────────────────────────────────────────
// プラン定義（2026-05-15 単一有料プラン化）
// ──────────────────────────────────────────────────────────────────────────
// `free`: 無料プラン
// `paid_monthly`: 月額 ¥350
// `paid_yearly`: 年額 ¥2,450（約42%OFF）
// キャンペーン: 年額 ¥1,980（期間限定・CAMPAIGN_ACTIVE で制御）
//
// 旧プラン（trial / monthly / yearly / basic_* / standard_* / premium_* /
// campaign_yearly）はクライアント側では使用しない。サーバや
// localStorage から読み込んだ値は normalizeLegacyPlan() で正規化する。
export type SubscriptionPlan = 'free' | 'paid_monthly' | 'paid_yearly'

export const PLAN_PRICES = {
  monthly: 350,
  yearly: 2450,
  campaignYearly: 1980,
} as const

// キャンペーン年額プランの表示制御。true にするとプラン画面にキャンペーンカードが表示される。
export const CAMPAIGN_ACTIVE = true

export type SubscriptionState = {
  plan: SubscriptionPlan
  expiresAt: string | null
  playStoreToken: string | null // Google Play 購買トークン（RTDN 用）
}

const DEFAULT_STATE: SubscriptionState = {
  plan: 'free',
  expiresAt: null,
  playStoreToken: null,
}

// ──────────────────────────────────────────────────────────────────────────
// Legacy plan 正規化
// ──────────────────────────────────────────────────────────────────────────
// 旧クライアント・旧サーバ・旧 productId が返してくる文字列を新型に揃える。
export function normalizeLegacyPlan(raw: string | null | undefined): SubscriptionPlan {
  if (!raw) return 'free'
  switch (raw) {
    case 'paid_monthly':
    case 'monthly':
    case 'basic_monthly':
    case 'standard_monthly':
    case 'premium_monthly':
      return 'paid_monthly'
    case 'paid_yearly':
    case 'yearly':
    case 'basic_yearly':
    case 'standard_yearly':
    case 'premium_yearly':
    case 'campaign_yearly':
    case 'beta_campaign':
      return 'paid_yearly'
    case 'trial':
    case 'free':
    default:
      return 'free'
  }
}

function load(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SubscriptionState> & { plan?: string }
      return {
        ...DEFAULT_STATE,
        ...parsed,
        plan: normalizeLegacyPlan(parsed.plan as string | undefined),
      }
    }
  } catch { /* */ }
  return { ...DEFAULT_STATE }
}

function save(s: SubscriptionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function getSubscriptionState(): SubscriptionState {
  const s = load()
  // 期限切れチェック
  if ((s.plan === 'paid_monthly' || s.plan === 'paid_yearly') && s.expiresAt) {
    if (Date.now() > new Date(s.expiresAt).getTime()) {
      s.plan = 'free'
      save(s)
    }
  }
  return s
}

export const BETA_MODE = false

// ──────────────────────────────────────────────────────────────────────────
// ジャーナル無料お試し（7日間）
// ──────────────────────────────────────────────────────────────────────────
// 初回起動時のインストール ID（`install-<ts>-<rand>`）からタイムスタンプを
// 取り出し、そこから 7 日間は無料利用可とする。BETA_MODE / isPaid() の場合は
// trial 判定を行わずに true。
const JOURNAL_TRIAL_DAYS = 7

function getInstallTimestamp(): number | null {
  try {
    const raw = localStorage.getItem('logic-install-id') || ''
    const m = raw.match(/^install-(\d+)-/)
    if (!m) return null
    const ts = Number(m[1])
    return Number.isFinite(ts) && ts > 0 ? ts : null
  } catch {
    return null
  }
}

export function getJournalTrialDaysLeft(): number {
  const ts = getInstallTimestamp()
  if (ts === null) return JOURNAL_TRIAL_DAYS
  const elapsedMs = Date.now() - ts
  const remainingMs = JOURNAL_TRIAL_DAYS * 86400000 - elapsedMs
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / 86400000)
}

export function canUseJournal(): boolean {
  if (isPaid()) return true
  return getJournalTrialDaysLeft() > 0
}

/**
 * 無料トライアル中かどうかの共通判定。
 * 「有料ではない」かつ「トライアル残日数 > 0」のときのみ true。
 * 残日数の算出は getJournalTrialDaysLeft()（install タイムスタンプ基準）に
 * 一本化し、二重ロジックを避ける。
 *
 * 注意: トライアルはログイン有無に関わらず install 時刻から計算されるが、
 * ジャーナルは保存にログインが必須なため、UI 側で「ログイン済み」を
 * 併せて条件にすること（未ログインには出さない）。
 */
export function isTrialActive(): boolean {
  if (isPaid()) return false
  return getJournalTrialDaysLeft() > 0
}

// ──────────────────────────────────────────────────────────────────────────
// サーバ権威のエンタイトルメント（LR-2）
// ──────────────────────────────────────────────────────────────────────────
// サーバ /api/entitlement の結果を sessionStorage にキャッシュし、isPaid() の判定で
// localStorage より優先する。サーバ応答が一度でも取れれば authoritative。取れない間
// （未ログイン / オフライン / 起動直後）は従来の localStorage 判定にフォールバックする。

// サーバ権威キャッシュの読み取り。'1'→true / '0'→false / 未設定→null（未確認）。
function readEntitlementCache(): boolean | null {
  try {
    const v = sessionStorage.getItem(ENTITLEMENT_CACHE_KEY)
    if (v === '1') return true
    if (v === '0') return false
  } catch { /* sessionStorage 不可環境では未確認扱い */ }
  return null
}

function writeEntitlementCache(isPaidValue: boolean) {
  try {
    sessionStorage.setItem(ENTITLEMENT_CACHE_KEY, isPaidValue ? '1' : '0')
  } catch { /* 保存できなくても致命的ではない */ }
}

/**
 * サーバ権威のエンタイトルメントをクリアする（ログアウト時など）。
 */
export function clearEntitlementCache() {
  try { sessionStorage.removeItem(ENTITLEMENT_CACHE_KEY) } catch { /* noop */ }
}

/**
 * サーバ /api/entitlement を Authorization: Bearer 付きで叩き、課金状態を取得して
 * sessionStorage にキャッシュする（authoritative）。
 * - 未ログイン / トークン無し / サーバ未到達 → キャッシュは更新せず null を返す
 *   （既存の localStorage フォールバックがそのまま効く）。
 * - 取得できた場合は true/false を返しキャッシュも更新する。
 * 起動時・ログイン時に呼ぶことを想定。失敗しても例外は投げない。
 */
export async function refreshEntitlement(): Promise<boolean | null> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return null

    const res = await fetch(`${API_BASE}/api/entitlement`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const body = (await res.json()) as { isPaid?: boolean }
    const isPaidValue = body.isPaid === true
    writeEntitlementCache(isPaidValue)
    window.dispatchEvent(new CustomEvent('subscription:updated'))
    return isPaidValue
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────────────────────────────────
// プラン判定（単一有料プランに統合）
// ──────────────────────────────────────────────────────────────────────────
export function isPaid(): boolean {
  if (BETA_MODE) return true
  // サーバ権威キャッシュが存在すればそれを優先（LR-2）。
  const authoritative = readEntitlementCache()
  if (authoritative !== null) return authoritative
  // 未確認（未ログイン / オフライン / 起動直後）は localStorage にフォールバック。
  const s = getSubscriptionState()
  return s.plan === 'paid_monthly' || s.plan === 'paid_yearly'
}

/**
 * 後方互換用エイリアス。新規コードは isPaid() を使うこと。
 */
export function isPremium(): boolean {
  return isPaid()
}

/**
 * AI 問題生成の月次キャップ。
 * 有料は内部的には無制限（-1 を返す）。無料は不可（0）。
 * 後日キャップを再導入する場合はここを書き換える。
 */
export function getAIGenerationLimit(): number {
  if (BETA_MODE) return -1
  return isPaid() ? -1 : 0
}

/**
 * AI 問題生成の日次キャップ。
 * 仕様: 有料無制限（-1）/ 無料 0。
 */
export function getAIGenDailyLimit(): number {
  if (BETA_MODE) return -1
  return isPaid() ? -1 : 0
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
    const normalized = normalizeLegacyPlan(data.plan)
    if (normalized === 'free') return false
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) return false
    return data.status === 'active'
  } catch {
    return false
  }
}

export function setPaidPlan(plan: SubscriptionPlan, expiresAt: string, playStoreToken?: string) {
  const s = load()
  s.plan = plan
  s.expiresAt = expiresAt
  if (playStoreToken) s.playStoreToken = playStoreToken
  save(s)
  window.dispatchEvent(new CustomEvent('subscription:updated'))
}

export function getPlanLabel(): string {
  const s = getSubscriptionState()
  switch (s.plan) {
    case 'paid_monthly': return `有料 (月額 ¥${PLAN_PRICES.monthly.toLocaleString()})`
    case 'paid_yearly':  return `有料 (年額 ¥${PLAN_PRICES.yearly.toLocaleString()})`
    case 'free':
    default:             return '無料'
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Google Play Billing
// ──────────────────────────────────────────────────────────────────────────

export function planToPlayProductId(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'paid_monthly': return PLAY_PRODUCTS.monthly
    case 'paid_yearly':  return PLAY_PRODUCTS.yearly
    default:             return PLAY_PRODUCTS.monthly
  }
}

/**
 * Play Store Billing のみ使用（Web 課金は廃止済み）。
 */
export async function startCheckout(plan: SubscriptionPlan): Promise<void> {
  const productId = planToPlayProductId(plan)
  try {
    const purchase = await purchaseProduct(productId)
    const { currentPeriodEnd, plan: verifiedPlan } = await verifyPurchase({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
    })
    const finalPlan = normalizeLegacyPlan(verifiedPlan) || plan
    setPaidPlan(finalPlan, currentPeriodEnd, purchase.purchaseToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : '購入に失敗しました'
    throw new Error(message)
  }
}

/**
 * キャンペーン年額プランを購入する（product ID: logic_campaign_yearly）。
 * 購入後は通常の paid_yearly として扱われる。
 */
export async function startCampaignCheckout(): Promise<void> {
  try {
    const purchase = await purchaseProduct(PLAY_PRODUCTS.campaignYearly)
    const { currentPeriodEnd } = await verifyPurchase({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
    })
    setPaidPlan('paid_yearly', currentPeriodEnd, purchase.purchaseToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : '購入に失敗しました'
    throw new Error(message)
  }
}

// productId → SubscriptionPlan のマッピング（旧 ID も含む）
export { mapProductIdToPlan }

// ──────────────────────────────────────────────────────────────────────────
// Platform detection
// ──────────────────────────────────────────────────────────────────────────

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
