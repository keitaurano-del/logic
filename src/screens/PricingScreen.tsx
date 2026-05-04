import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'
type PlanKey = 'free' | 'standard' | 'premium'

// ── 機能比較データ ──────────────────────────────────
type FeatureRow = {
  label: string
  free: string | boolean
  standard: string | boolean
  premium: string | boolean
}

const FEATURES: FeatureRow[] = [
  { label: 'レッスン',     free: '初級のみ',   standard: '全レッスン', premium: '全レッスン' },
  { label: 'AI問題生成',   free: false,         standard: '日3問',      premium: '日10問' },
  { label: 'ロールプレイ', free: false,         standard: '月5回',      premium: '無制限' },
  { label: 'フェルミ問題', free: '日1問',       standard: '日5問',      premium: '日10問' },
  { label: '学習記録',     free: true,          standard: true,         premium: true },
]

const PLAN_META: Record<PlanKey, { label: string; en: string; color: string }> = {
  free:     { label: '無料',        en: 'FREE',    color: v3.color.text3 },
  standard: { label: 'スタンダード', en: 'STD',     color: v3.color.accent },
  premium:  { label: 'プレミアム',   en: 'PRE',     color: v3.color.warm },
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <CheckIcon />
  if (value === false) return <CrossIcon />
  return <span style={{ fontSize: 13, fontWeight: 600, color: v3.color.text }}>{value}</span>
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [activePlan, setActivePlan] = useState<PlanKey>('standard')

  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()
  const isCurrentFree = state.plan === 'free'
  const isCurrentStd = isActiveStandard && !isActivePremium
  const isCurrentPre = isActivePremium

  const stdPrice = billingCycle === 'yearly' ? PLAN_PRICES.standard_yearly : PLAN_PRICES.standard_monthly
  const prePrice = billingCycle === 'yearly' ? PLAN_PRICES.premium_yearly : PLAN_PRICES.premium_monthly
  const stdMonthly = Math.round(PLAN_PRICES.standard_yearly / 12)
  const preMonthly = Math.round(PLAN_PRICES.premium_yearly / 12)
  const stdPlanId: PlanId = billingCycle === 'yearly' ? 'standard_yearly' : 'standard_monthly'
  const prePlanId: PlanId = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'

  const handleUpgrade = async (plan: PlanId) => {
    setLoading(plan)
    setError('')
    try {
      if (isAndroidNative()) { setError('購入処理を開始しています...'); setLoading(null); return }
      await startCheckout(plan)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  const accentColor = PLAN_META[activePlan].color

  // プランごとの価格テキスト
  function planPrice(plan: PlanKey) {
    if (plan === 'free') return { main: '無料', sub: '' }
    if (plan === 'standard') return billingCycle === 'yearly'
      ? { main: `¥${stdPrice.toLocaleString()}`, sub: `/年  月々¥${stdMonthly}` }
      : { main: `¥${stdPrice.toLocaleString()}`, sub: '/月' }
    return billingCycle === 'yearly'
      ? { main: `¥${prePrice.toLocaleString()}`, sub: `/年  月々¥${preMonthly}` }
      : { main: `¥${prePrice.toLocaleString()}`, sub: '/月' }
  }

  // CTAボタン
  function PlanCTA({ plan }: { plan: PlanKey }) {
    if (plan === 'free') {
      return isCurrentFree
        ? <div style={{ textAlign: 'center', fontSize: 13, color: v3.color.text3, fontWeight: 700, padding: '14px 0' }}>現在のプラン</div>
        : null
    }
    if (plan === 'standard') {
      if (isCurrentStd) return <div style={{ textAlign: 'center', fontSize: 13, color: v3.color.accent, fontWeight: 700, padding: '14px 0' }}>現在のプラン</div>
      return (
        <button onClick={() => handleUpgrade(stdPlanId)} disabled={!!loading}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: `2px solid ${v3.color.accent}`, background: 'transparent', color: v3.color.accent, fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading === stdPlanId ? '処理中...' : 'スタンダードを始める'}
        </button>
      )
    }
    if (isCurrentPre) return <div style={{ textAlign: 'center', fontSize: 13, color: v3.color.warm, fontWeight: 700, padding: '14px 0' }}>現在のプラン</div>
    return (
      <button onClick={() => handleUpgrade(prePlanId)} disabled={!!loading}
        style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: v3.color.warm, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading === prePlanId ? '処理中...' : 'プレミアムを始める'}
      </button>
    )
  }

  const plans: PlanKey[] = ['free', 'standard', 'premium']

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button type="button" onClick={onBack} aria-label="戻る" style={{ width: 44, height: 44, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontSize: 18, fontWeight: 800 }}>料金プラン</div>
      </div>

      <div style={{ padding: '0 16px 12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* キャンペーンバナー */}
        <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4D6D 100%)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9z"/><path d="M12 14c0 0-2 1-2 3a2 2 0 0 0 4 0c0-2-2-3-2-3z"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>期間限定キャンペーン中！</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
              スタンダード年払いが今だけ <span style={{ fontWeight: 800, fontSize: 15 }}>¥1,980</span>
              <span style={{ marginLeft: 6, textDecoration: 'line-through', opacity: 0.7, fontSize: 12 }}>¥{PLAN_PRICES.standard_yearly.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* トライアルバナー */}
        {state.plan === 'trial' && (
          <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: 12, padding: '10px 16px', fontSize: 14, color: v3.color.accent, fontWeight: 600 }}>
            7日間トライアル中 — あと {trialDays} 日
          </div>
        )}

        {/* 月払い / 年払い トグル */}
        <div style={{ display: 'flex', background: v3.color.card, borderRadius: 14, padding: 4, gap: 4 }}>
          {(['monthly', 'yearly'] as const).map(cycle => (
            <button key={cycle} onClick={() => setBillingCycle(cycle)}
              style={{ flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all .15s', background: billingCycle === cycle ? v3.color.accent : 'transparent', color: billingCycle === cycle ? '#fff' : v3.color.text2 }}>
              {cycle === 'monthly' ? '月払い' : (
                <span>年払い <span style={{ fontSize: 11, background: billingCycle === 'yearly' ? 'rgba(255,255,255,0.22)' : `${v3.color.warm}22`, color: billingCycle === 'yearly' ? '#fff' : v3.color.warm, borderRadius: 6, padding: '2px 6px', fontWeight: 800 }}>5ヶ月お得</span></span>
              )}
            </button>
          ))}
        </div>

        {/* プランタブ */}
        <div style={{ display: 'flex', gap: 8 }}>
          {plans.map(plan => {
            const meta = PLAN_META[plan]
            const isActive = activePlan === plan
            return (
              <button key={plan} onClick={() => setActivePlan(plan)}
                style={{ flex: 1, padding: '10px 4px', borderRadius: 12, border: `2px solid ${isActive ? meta.color : v3.color.line}`, background: isActive ? `${meta.color}14` : v3.color.card, cursor: 'pointer', transition: 'all .15s' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: meta.color, letterSpacing: '.08em' }}>{meta.en}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? meta.color : v3.color.text2, marginTop: 2 }}>{meta.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 機能リスト + 価格 + CTA */}
      <div style={{ flex: 1, padding: '0 16px 100px', overflowY: 'auto' }}>
        {/* 価格カード */}
        <div style={{ background: v3.color.card, borderRadius: 16, padding: '20px 20px 8px', marginBottom: 12, border: `2px solid ${accentColor}30` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: v3.color.text, letterSpacing: '-0.03em' }}>{planPrice(activePlan).main}</span>
            {planPrice(activePlan).sub && (
              <span style={{ fontSize: 13, color: v3.color.text3, marginBottom: 6 }}>{planPrice(activePlan).sub}</span>
            )}
          </div>
          {activePlan === 'standard' && billingCycle === 'yearly' && (
            <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 700, marginBottom: 8 }}>キャンペーン適用で ¥1,980 / 年</div>
          )}
          <div style={{ marginTop: 16 }}>
            <PlanCTA plan={activePlan} />
          </div>
        </div>

        {/* 機能比較リスト */}
        <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden' }}>
          {/* ヘッダー行 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '12px 16px', borderBottom: `1px solid ${v3.color.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.text3 }}>機能</div>
            {plans.map(plan => (
              <div key={plan} onClick={() => setActivePlan(plan)}
                style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: activePlan === plan ? PLAN_META[plan].color : v3.color.text3, cursor: 'pointer', letterSpacing: '.06em' }}>
                {PLAN_META[plan].en}
              </div>
            ))}
          </div>
          {/* 機能行 */}
          {FEATURES.map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '14px 16px', borderTop: i === 0 ? 'none' : `1px solid ${v3.color.line}`, background: i % 2 === 0 ? 'transparent' : `${v3.color.bg}50`, alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: v3.color.text }}>{row.label}</div>
              {/* FREE */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: activePlan === 'free' ? 1 : 0.45 }}>
                <Cell value={row.free} />
              </div>
              {/* STD */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: activePlan === 'standard' ? 1 : 0.45 }}>
                <Cell value={row.standard} />
              </div>
              {/* PRE */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: activePlan === 'premium' ? 1 : 0.45 }}>
                <Cell value={row.premium} />
              </div>
            </div>
          ))}
        </div>

        {/* 注記 */}
        <div style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8, marginTop: 16 }}>
          Google Playで管理 · 自動更新<br />
          年払いは一括請求。キャンセル後は期間終了まで利用可能。
        </div>

        {error && (
          <div style={{ margin: '12px 0 0', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 14 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
