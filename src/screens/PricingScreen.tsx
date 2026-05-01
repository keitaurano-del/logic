import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

// SVGアイコン
const IconBook = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconAI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
const IconRoleplay = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconStats = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconTrophy = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V5a1 1 0 0 0-1-1h-3"/><rect x="7" y="2" width="10" height="6" rx="1"/></svg>
const IconReport = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconQuestion = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconSave = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>

type PlanDef = {
  id: PlanId | 'free'
  label: string
  tier: 'free' | 'standard' | 'premium'
  billing: 'free' | 'monthly' | 'yearly'
  price: number
  unit: string
  monthlyEquiv?: number
  badge?: string
  features: { icon: React.ReactNode; text: string }[]
  recommended?: boolean
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState(3) // デフォルト: PREMIUM年払い
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()

  const stdMonthly = Math.round(PLAN_PRICES.standard_yearly / 12)
  const prmMonthly = Math.round(PLAN_PRICES.premium_yearly / 12)

  const PLANS: PlanDef[] = [
    {
      id: 'free', label: 'FREE', tier: 'free', billing: 'free',
      price: 0, unit: '無料',
      features: [
        { icon: <IconBook />, text: '初級レッスン全件' },
        { icon: <IconQuestion />, text: '1問チャレンジ（毎日）' },
        { icon: <IconSave />, text: '学習記録 無制限' },
      ],
    },
    {
      id: 'standard_monthly', label: 'STANDARD', tier: 'standard', billing: 'monthly',
      price: PLAN_PRICES.standard_monthly, unit: '/月',
      features: [
        { icon: <IconBook />, text: '全レッスン' },
        { icon: <IconAI />, text: 'AI問題 日3問' },
        { icon: <IconRoleplay />, text: 'ロールプレイ 月5回' },
        { icon: <IconStats />, text: '学習記録・進捗' },
      ],
    },
    {
      id: 'standard_yearly', label: 'STANDARD', tier: 'standard', billing: 'yearly',
      price: PLAN_PRICES.standard_yearly, unit: '/年',
      monthlyEquiv: stdMonthly,
      badge: '年払いお得',
      features: [
        { icon: <IconBook />, text: '全レッスン' },
        { icon: <IconAI />, text: 'AI問題 日3問' },
        { icon: <IconRoleplay />, text: 'ロールプレイ 月5回' },
        { icon: <IconStats />, text: '学習記録・進捗' },
      ],
    },
    {
      id: 'premium_yearly', label: 'PREMIUM', tier: 'premium', billing: 'yearly',
      price: PLAN_PRICES.premium_yearly, unit: '/年',
      monthlyEquiv: prmMonthly,
      badge: 'おすすめ',
      recommended: true,
      features: [
        { icon: <IconBook />, text: '全レッスン' },
        { icon: <IconAI />, text: 'AI問題 日10問' },
        { icon: <IconRoleplay />, text: 'ロールプレイ 無制限' },
        { icon: <IconTrophy />, text: 'フェルミランキング' },
        { icon: <IconReport />, text: '月次学習レポート' },
      ],
    },
    {
      id: 'premium_monthly', label: 'PREMIUM', tier: 'premium', billing: 'monthly',
      price: PLAN_PRICES.premium_monthly, unit: '/月',
      features: [
        { icon: <IconBook />, text: '全レッスン' },
        { icon: <IconAI />, text: 'AI問題 日10問' },
        { icon: <IconRoleplay />, text: 'ロールプレイ 無制限' },
        { icon: <IconTrophy />, text: 'フェルミランキング' },
        { icon: <IconReport />, text: '月次学習レポート' },
      ],
    },
  ]

  const handleUpgrade = async (plan: PlanId) => {
    setLoading(plan)
    setError('')
    try {
      if (isAndroidNative()) {
        setError('購入処理を開始しています...')
        setLoading(null)
        return
      }
      await startCheckout(plan)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  const plan = PLANS[activeIdx]
  const isCurrent =
    plan.id === 'free' ? state.plan === 'free' :
    plan.id === 'premium_monthly' || plan.id === 'premium_yearly' ? isActivePremium :
    isActiveStandard && !isActivePremium

  const tierColor: Record<string, string> = {
    free: v3.color.text3,
    standard: v3.color.accent,
    premium: v3.color.warm,
  }

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>料金プラン</div>
      </div>

      <div style={{ padding: '0 20px', flexShrink: 0 }}>
        {state.plan === 'trial' && (
          <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: v3.radius.card, padding: '10px 16px', marginBottom: 16, fontSize: 14, color: v3.color.accent, fontWeight: 600 }}>
            7日間トライアル中 — あと {trialDays} 日
          </div>
        )}

        {/* プランタブ — 横スクロール */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
          {PLANS.map((p, i) => {
            const isActive = i === activeIdx
            const color = tierColor[p.tier]
            return (
              <button key={i} onClick={() => setActiveIdx(i)}
                style={{
                  flexShrink: 0,
                  padding: '8px 14px',
                  borderRadius: 99,
                  border: isActive ? `2px solid ${color}` : `1.5px solid ${v3.color.line}`,
                  background: isActive ? `${color}18` : v3.color.card,
                  color: isActive ? color : v3.color.text2,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}>
                {p.label}
                <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 4, opacity: 0.8 }}>
                  {p.billing === 'free' ? '無料' : p.billing === 'monthly' ? '月払い' : '年払い'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* プランカード — 選択中のみ表示 */}
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: v3.color.card,
          borderRadius: v3.radius.card,
          padding: '24px 22px',
          border: plan.recommended ? `2px solid ${v3.color.accent}` : `1px solid ${v3.color.line}`,
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {plan.recommended && (
            <div style={{ position: 'absolute', right: -28, top: -28, width: 110, height: 110, borderRadius: '50%', background: v3.color.accentGlow, filter: 'blur(36px)', pointerEvents: 'none' }} />
          )}
          {plan.badge && (
            <div style={{ position: 'absolute', top: -12, left: 20, background: plan.recommended ? v3.color.accent : v3.color.warm, color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '4px 12px' }}>
              {plan.badge}
            </div>
          )}

          {/* プラン名・価格 */}
          <div style={{ marginTop: plan.badge ? 8 : 0, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: tierColor[plan.tier], letterSpacing: '.08em', marginBottom: 6 }}>
              {plan.label} · {plan.billing === 'free' ? '無料' : plan.billing === 'monthly' ? '月払い' : '年払い'}
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: v3.color.text }}>
              {plan.price === 0 ? '¥0' : `¥${plan.price.toLocaleString()}`}
              <span style={{ fontSize: 16, fontWeight: 500, color: v3.color.text2, marginLeft: 4 }}>{plan.unit}</span>
            </div>
            {plan.monthlyEquiv && (
              <div style={{ fontSize: 13, color: v3.color.text3, marginTop: 6 }}>
                月々約 <span style={{ fontWeight: 700, color: v3.color.text2 }}>¥{plan.monthlyEquiv}</span> · 年払い一括
              </div>
            )}
          </div>

          {/* 特典リスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {plan.features.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${v3.color.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 15, color: v3.color.text, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTAボタン */}
          <div style={{ marginTop: 24 }}>
            {isCurrent ? (
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: v3.color.accent, padding: '12px 0' }}>✅ 現在のプラン</div>
            ) : plan.id === 'free' ? (
              <div style={{ textAlign: 'center', fontSize: 13, color: v3.color.text2, padding: '8px 0' }}>登録不要ですぐ使えます</div>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id as PlanId)}
                disabled={!!loading}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 14,
                  border: plan.tier === 'premium' ? 'none' : `1.5px solid ${v3.color.accent}`,
                  background: plan.tier === 'premium' ? v3.color.accent : 'transparent',
                  color: plan.tier === 'premium' ? '#fff' : v3.color.accent,
                  fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1,
                }}>
                {loading === plan.id ? '処理中…' : `このプランで始める`}
              </button>
            )}
          </div>
        </div>

        {/* 注記 */}
        <div style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8, padding: '16px 8px 32px' }}>
          Google Playで管理 · 自動更新<br />
          年払いは一括請求。キャンセル後は期間終了まで利用可能。
        </div>

        {error && (
          <div style={{ marginBottom: 16, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
