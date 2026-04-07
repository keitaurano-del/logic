const STORAGE_KEY = 'logic-subscription'
const TRIAL_DAYS = 7

export type SubscriptionPlan = 'trial' | 'free' | 'monthly' | 'yearly'

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
  if ((s.plan === 'monthly' || s.plan === 'yearly') && s.expiresAt) {
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

// Beta mode: all users get premium features for free during the beta period.
// Set to false when going GA and re-enabling Stripe.
export const BETA_MODE = true

export function isPremium(): boolean {
  if (BETA_MODE) return true
  const s = getSubscriptionState()
  return s.plan === 'trial' || s.plan === 'monthly' || s.plan === 'yearly'
}

export function setPaidPlan(plan: 'monthly' | 'yearly', sessionId: string, expiresAt: string) {
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
    case 'monthly': return '月額プラン (¥500/月)'
    case 'yearly': return '年額プラン (¥3,500/年)'
    case 'free': return '無料プラン'
    default: return '無料プラン'
  }
}

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

export async function startCheckout(plan: 'monthly' | 'yearly', guestId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, guestId }),
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
    setPaidPlan(data.plan, sessionId, data.expiresAt)
    return true
  }
  return false
}
