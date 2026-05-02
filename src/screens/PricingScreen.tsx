import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

// 特典アイコン（小サイズ）
const Dot = ({ color }: { color: string }) => (
  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
)

const FREE_FEATURES = ['初級レッスン全件', '1問チャレンジ/日', '学習記録']
const STD_FEATURES = ['全レッスン', 'AI問題 日3問', 'ロールプレイ 月5回', '進捗管理']
const PRE_FEATURES = ['全レッスン', 'AI問題 日10問', 'ロールプレイ 無制限', 'ランキング', '月次レポート']

type PlanCard = {
  id: PlanId | 'free'
  tier: 'free' | 'standard' | 'premium'
  label: string
  billing: string
  price: number
  unit: string
  monthlyEquiv?: number
  badge?: string
  recommended?: boolean
  savings?: string
  features: string[]
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()

  const stdMonthly = Math.round(PLAN_PRICES.standard_yearly / 12)
  const prmMonthly = Math.round(PLAN_PRICES.premium_yearly / 12)

  const PLANS: PlanCard[] = [
    {
      id: 'free', tier: 'free', label: 'FREE', billing: 'ずっと無料',
      price: 0, unit: '',
      features: FREE_FEATURES,
    },
    {
      id: 'standard_monthly', tier: 'standard', label: 'STANDARD', billing: '月払い',
      price: PLAN_PRICES.standard_monthly, unit: '/月',
      features: STD_FEATURES,
    },
    {
      id: 'standard_yearly', tier: 'standard', label: 'STANDARD', billing: '年払い',
      price: PLAN_PRICES.standard_yearly, unit: '/年',
      monthlyEquiv: stdMonthly,
      badge: 'お得',
      savings: '5ヶ月分お得',
      features: STD_FEATURES,
    },
    {
      id: 'premium_monthly', tier: 'premium', label: 'PREMIUM', billing: '月払い',
      price: PLAN_PRICES.premium_monthly, unit: '/月',
      features: PRE_FEATURES,
    },
    {
      id: 'premium_yearly', tier: 'premium', label: 'PREMIUM', billing: '年払い',
      price: PLAN_PRICES.premium_yearly, unit: '/年',
      monthlyEquiv: prmMonthly,
      badge: 'おすすめ',
      recommended: true,
      savings: '5ヶ月分お得',
      features: PRE_FEATURES,
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

  const tierColor: Record<string, string> = {
    free: v3.color.text3,
    standard: v3.color.accent,
    premium: v3.color.warm,
  }

  const isCurrent = (p: PlanCard) => {
    if (p.id === 'free') return state.plan === 'free'
    if (p.tier === 'premium') return isActivePremium
    return isActiveStandard && !isActivePremium
  }

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>料金プラン</div>
      </div>

      <div style={{ padding: '0 12px', flexShrink: 0 }}>
        {/* キャンペーンバナー */}
        <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4D6D 100%)', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '.02em' }}>期間限定キャンペーン中！</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 1 }}>
              年払いプランが今だけ <span style={{ fontWeight: 800, fontSize: 13 }}>¥1,980</span>（通常¥{PLAN_PRICES.standard_yearly.toLocaleString()}〜）
            </div>
          </div>
        </div>

        {state.plan === 'trial' && (
          <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 13, color: v3.color.accent, fontWeight: 600 }}>
            7日間トライアル中 — あと {trialDays} 日
          </div>
        )}

        <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 12 }}>
          いつでもキャンセル・変更可能です
        </div>
      </div>

      {/* 2列グリッド — 全プラン一覧 */}
      <div style={{ padding: '0 12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {PLANS.map((plan) => {
          const color = tierColor[plan.tier]
          const current = isCurrent(plan)

          return (
            <div key={plan.id}
              style={{
                background: v3.color.card,
                borderRadius: 14,
                padding: '12px 12px 14px',
                border: plan.recommended ? `2px solid ${color}` : current ? `1.5px solid ${color}60` : `1px solid ${v3.color.line}`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>

              {/* バッジ */}
              {plan.badge && (
                <div style={{ position: 'absolute', top: -1, right: -1, background: plan.recommended ? color : v3.color.warm, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '0 13px 0 8px', padding: '3px 8px', letterSpacing: '.04em' }}>
                  {plan.badge}
                </div>
              )}

              {/* プラン名・支払い */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: '.08em', marginBottom: 1 }}>{plan.label}</div>
                <div style={{ fontSize: 11, color: v3.color.text3, fontWeight: 500 }}>{plan.billing}</div>
              </div>

              {/* 価格 */}
              <div>
                <div style={{ fontSize: plan.price === 0 ? 22 : 20, fontWeight: 800, color: v3.color.text, lineHeight: 1, letterSpacing: '-.02em' }}>
                  {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
                  {plan.unit && <span style={{ fontSize: 11, fontWeight: 500, color: v3.color.text2 }}>{plan.unit}</span>}
                </div>
                {plan.monthlyEquiv && (
                  <div style={{ fontSize: 10, color: v3.color.text3, marginTop: 2 }}>
                    月々¥{plan.monthlyEquiv}
                  </div>
                )}
                {plan.savings && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: v3.color.warm, marginTop: 2 }}>
                    🎉 {plan.savings}
                  </div>
                )}
              </div>

              {/* 特典 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Dot color={color} />
                    <span style={{ fontSize: 11, color: v3.color.text2, lineHeight: 1.3 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTAボタン */}
              <div style={{ marginTop: 4 }}>
                {current ? (
                  <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color, padding: '6px 0' }}>✅ 現在のプラン</div>
                ) : plan.id === 'free' ? (
                  <div style={{ textAlign: 'center', fontSize: 11, color: v3.color.text3, padding: '6px 0' }}>登録不要</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as PlanId)}
                    disabled={!!loading}
                    style={{
                      width: '100%', padding: '9px 0', borderRadius: 10,
                      border: plan.tier === 'premium' ? 'none' : `1.5px solid ${color}`,
                      background: plan.tier === 'premium' ? color : 'transparent',
                      color: plan.tier === 'premium' ? '#fff' : color,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}>
                    {loading === plan.id ? '処理中…' : '始める'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 注記 */}
      <div style={{ fontSize: 11, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8, padding: '0 16px 32px' }}>
        Google Playで管理 · 自動更新<br />
        年払いは一括請求。キャンセル後は期間終了まで利用可能。
      </div>

      {error && (
        <div style={{ margin: '0 16px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  )
}
