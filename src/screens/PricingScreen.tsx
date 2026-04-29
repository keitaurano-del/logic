import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

// SCRUM-182: 新プラン特典定義
const STANDARD_FEATURES = [
  { icon: '📚', text: '全レッスン（初級〜上級）' },
  { icon: '🤖', text: 'AI問題生成 月30問' },
  { icon: '🎭', text: 'ロールプレイ 月3回' },
  { icon: '📊', text: '学習記録・進捗管理' },
  { icon: '📝', text: '提案書作成コース' },
]

const PREMIUM_FEATURES = [
  { icon: '✅', text: 'スタンダードの全機能' },
  { icon: '⚡', text: 'AI問題生成 月200問' },
  { icon: '🎭', text: 'ロールプレイ 無制限' },
  { icon: '🔍', text: 'ケース面接 深掘りモード' },
  { icon: '📈', text: '週次学習分析レポート' },
  { icon: '💬', text: '優先サポート' },
]

const FREE_FEATURES = [
  { icon: '📚', text: '初級レッスン 全件' },
  { icon: '❓', text: '1問チャレンジ（毎日）' },
  { icon: '💾', text: '学習記録 無制限保存' },
]

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()

  const handleUpgrade = async (plan: PlanId) => {
    setLoading(plan)
    setError('')
    try {
      if (isAndroidNative()) {
        setError('購入処理を開始しています...')
        setLoading(null)
        return
      }
      const guest = loadGuestUser()
      await startCheckout(plan, guest.id)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  const stdPlan: PlanId = billingCycle === 'yearly' ? 'standard_yearly' : 'standard_monthly'
  const prmPlan: PlanId = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'

  const stdPrice = billingCycle === 'yearly' ? PLAN_PRICES.standard_yearly : PLAN_PRICES.standard_monthly
  const prmPrice = billingCycle === 'yearly' ? PLAN_PRICES.premium_yearly : PLAN_PRICES.premium_monthly

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, paddingBottom: 40 }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>料金プラン</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* キャンペーンヒーロー */}
        <div style={{ background: `linear-gradient(135deg, ${v3.color.accent}22 0%, ${v3.color.warm}18 100%)`, border: `1px solid ${v3.color.accent}40`, borderRadius: v3.radius.card, padding: '20px 20px 18px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: v3.color.accentGlow, filter: 'blur(36px)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.warm, letterSpacing: '.08em', marginBottom: 6 }}>🎉 期間限定キャンペーン</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, color: v3.color.text }}>
            今なら<span style={{ color: v3.color.accent }}>フリープラン</span>で<br />ずっと無料で使える
          </div>
          <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.6 }}>
            初級レッスン全件 + 毎日の1問チャレンジ + 学習記録が無料。<br />有料プランはいつでもアップグレード可能。
          </div>
        </div>

        {state.plan === 'trial' && (
          <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: v3.radius.card, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: v3.color.accent, fontWeight: 600 }}>
            7日間トライアル中 — あと {trialDays} 日
          </div>
        )}

        {/* 月額/年額トグル */}
        <div style={{ display: 'flex', background: v3.color.card, borderRadius: 99, padding: 3, marginBottom: 20, gap: 3 }}>
          {(['monthly', 'yearly'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 99,
                border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                background: billingCycle === cycle ? v3.color.accent : 'transparent',
                color: billingCycle === cycle ? '#fff' : v3.color.text2,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {cycle === 'monthly' ? '月払い' : '年払い'}
              {cycle === 'yearly' && (
                <span style={{ fontSize: 10, fontWeight: 700, background: billingCycle === 'yearly' ? 'rgba(255,255,255,.25)' : `${v3.color.warm}28`, color: billingCycle === 'yearly' ? '#fff' : v3.color.warm, borderRadius: 99, padding: '1px 6px' }}>
                  7ヶ月分お得
                </span>
              )}
            </button>
          ))}
        </div>

        {/* フリープラン */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '18px 20px', marginBottom: 12, border: `1px solid ${v3.color.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.text3, letterSpacing: '.06em', marginBottom: 4 }}>FREE</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>
                ¥0<span style={{ fontSize: 14, fontWeight: 500, color: v3.color.text2 }}>/ずっと</span>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: `${v3.color.warm}22`, color: v3.color.warm, borderRadius: 99, padding: '4px 10px' }}>
              今なら無料
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {FREE_FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif', lineHeight: 1 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: v3.color.text2 }}>{f.text}</span>
              </div>
            ))}
          </div>
          {state.plan === 'free' && (
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: v3.color.accent, padding: '8px 0' }}>
              ✅ 現在のプラン
            </div>
          )}
        </div>

        {/* スタンダードプラン */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '20px 20px', marginBottom: 12, border: `1px solid ${v3.color.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 4 }}>STANDARD</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>
                ¥{billingCycle === 'yearly' ? '4,550' : '650'}
                <span style={{ fontSize: 14, fontWeight: 500, color: v3.color.text2 }}>/{billingCycle === 'yearly' ? '年' : '月'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>月々約¥379（7ヶ月分お得）</div>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: `${v3.color.accent}18`, color: v3.color.accent, borderRadius: 99, padding: '4px 10px' }}>
              月1.5杯のコーヒー代
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {STANDARD_FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif', lineHeight: 1 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: v3.color.text2 }}>{f.text}</span>
              </div>
            ))}
          </div>
          {isActiveStandard && !isActivePremium ? (
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: v3.color.accent, padding: '8px 0' }}>
              ✅ 現在のプラン
            </div>
          ) : (
            <button
              onClick={() => handleUpgrade(stdPlan)}
              disabled={!!loading}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: `1.5px solid ${v3.color.accent}`, background: 'transparent', color: v3.color.accent, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading === stdPlan ? '処理中…' : `スタンダードで始める — ¥${stdPrice.toLocaleString()}/${billingCycle === 'yearly' ? '年' : '月'}`}
            </button>
          )}
        </div>

        {/* プレミアムプラン */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '20px 20px', marginBottom: 20, border: `2px solid ${v3.color.accent}`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: 20, background: v3.color.accent, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', borderRadius: 99, padding: '4px 12px' }}>
            おすすめ
          </div>
          <div style={{ position: 'absolute', right: -24, top: -24, width: 120, height: 120, borderRadius: '50%', background: v3.color.accentGlow, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.accent, letterSpacing: '.06em', marginBottom: 4 }}>PREMIUM</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>
                ¥{billingCycle === 'yearly' ? '6,860' : '1,400'}
                <span style={{ fontSize: 14, fontWeight: 500, color: v3.color.text2 }}>/{billingCycle === 'yearly' ? '年' : '月'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>月々約¥572（7ヶ月分お得）</div>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: `${v3.color.accent}22`, color: v3.color.accent, borderRadius: 99, padding: '4px 10px' }}>
              コミット層向け
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif', lineHeight: 1 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: f.text.includes('スタンダード') ? v3.color.text3 : v3.color.text2 }}>{f.text}</span>
              </div>
            ))}
          </div>
          {isActivePremium ? (
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: v3.color.accent, padding: '8px 0' }}>
              ✅ 現在のプラン
            </div>
          ) : (
            <button
              onClick={() => handleUpgrade(prmPlan)}
              disabled={!!loading}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: v3.color.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading === prmPlan ? '処理中…' : `プレミアムで始める — ¥${prmPrice.toLocaleString()}/${billingCycle === 'yearly' ? '年' : '月'}`}
            </button>
          )}
        </div>

        {/* 注記 */}
        <div style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8, padding: '0 8px' }}>
          いつでもキャンセル可能 · 自動更新 · カード登録後に課金開始<br />
          年払いは一括請求です。キャンセル後は期間終了まで利用可能。
        </div>

        {error && (
          <div style={{ marginTop: 16, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
