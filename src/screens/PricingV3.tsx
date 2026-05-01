import { useState } from 'react'
import { v3 } from '../styles/tokensV3'

type Props = { onBack: () => void }

type Plan = {
  id: string
  name: string
  price: number
  priceLabel: string
  features: string[]
  cta: string
  badge?: string
  badgeColor?: string
  highlighted?: boolean
  priceHint?: string
}

export default function PricingV3({ onBack }: Props) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const plans: Record<'monthly' | 'yearly', Plan[]> = {
    monthly: [
      {
        id: 'standard_monthly',
        name: 'スタンダード',
        price: 390,
        priceLabel: '390円/月',
        features: [
          'AI問題生成 月300問まで',
          '全レッスン 40コース',
          'ランキング機能',
          '広告なし',
        ],
        cta: '月額プランを始める',
      },
    ],
    yearly: [
      {
        id: 'campaign_yearly',
        name: 'キャンペーン',
        price: 1980,
        priceLabel: '1,980円/年',
        badge: '期間限定',
        badgeColor: '#ff6b6b',
        features: [
          'AI問題生成 月300問まで',
          '全レッスン 40コース',
          'ランキング機能',
          '広告なし',
        ],
        cta: 'キャンペーンプランを始める',
        highlighted: true,
      },
      {
        id: 'standard_yearly',
        name: 'スタンダード',
        price: 2730,
        priceLabel: '2,730円/年',
        priceHint: '月々 228円相当',
        badge: '41% OFF',
        badgeColor: '#4caf50',
        features: [
          'AI問題生成 月300問まで',
          '全レッスン 40コース',
          'ランキング機能',
          '広告なし',
        ],
        cta: '年額プランを始める',
      },
    ],
  }

  const handleUpgrade = async (planId: string) => {
    setLoading(planId)
    setError('')
    try {
      // await startCheckout(planId)
      console.log('Starting checkout for:', planId)
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: v3.color.bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Noto Sans JP', 'Inter Tight', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${v3.color.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: v3.color.text2,
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: v3.color.text,
          }}
        >
          プランを選ぶ
        </h2>
      </header>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {/* Intro */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: v3.color.text,
              margin: '0 0 8px 0',
            }}
          >
            論理的思考を、もっと深く鍛える
          </h3>
          <p
            style={{
              fontSize: 14,
              color: v3.color.text2,
              margin: '0',
            }}
          >
            プレミアムプランで全機能解放
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 32,
            background: v3.color.card,
            borderRadius: v3.radius.pill,
            padding: 4,
          }}
        >
          {(['monthly', 'yearly'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: v3.radius.pill,
                background:
                  billingCycle === cycle ? v3.color.accent : 'transparent',
                color:
                  billingCycle === cycle
                    ? '#082121'
                    : v3.color.text2,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: v3.motion.tap,
              }}
            >
              {cycle === 'monthly' ? '月払い' : '年払い'}
            </button>
          ))}
        </div>

        {/* Plans */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {plans[billingCycle].map((plan) => (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                background: v3.color.card,
                borderRadius: v3.radius.card,
                border: `2px solid ${
                  plan.highlighted ? v3.color.accent : v3.color.line
                }`,
                padding: 24,
                transition: 'transform 150ms',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: plan.badgeColor,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: v3.color.text,
                  margin: '0 0 8px 0',
                }}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: plan.highlighted ? v3.color.accent : v3.color.text,
                  margin: '8px 0 4px 0',
                }}
              >
                {plan.priceLabel}
              </div>

              {/* Price Hint */}
              {plan.priceHint && (
                <p
                  style={{
                    fontSize: 13,
                    color: v3.color.text2,
                    margin: '0 0 16px 0',
                  }}
                >
                  {plan.priceHint}
                </p>
              )}

              {/* Features */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '16px 0',
                }}
              >
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 14,
                      color: v3.color.text,
                      margin: '8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: v3.color.accentSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: v3.color.accent,
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Trial Note */}
              <p
                style={{
                  fontSize: 12,
                  color: v3.color.text2,
                  margin: '16px 0',
                  padding: '12px',
                  background: v3.color.bg,
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                7日間の無料トライアル付き
              </p>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  border: 'none',
                  borderRadius: v3.radius.pill,
                  background: plan.highlighted
                    ? v3.color.accent
                    : v3.color.card2,
                  color: plan.highlighted ? '#082121' : v3.color.text,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: v3.motion.tap,
                }}
              >
                {loading === plan.id ? '処理中...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#F87171',
              color: '#ffffff',
              borderRadius: 8,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Footer Note */}
        <p
          style={{
            fontSize: 12,
            color: v3.color.text2,
            textAlign: 'center',
            marginTop: 32,
            marginBottom: 0,
          }}
        >
          すべてのプランに7日間の無料トライアルが付属しています。
          <br />
          いつでもキャンセルできます。
        </p>
      </div>
    </div>
  )
}
