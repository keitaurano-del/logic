import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

// SVGアイコン定義
const IconBook = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconAI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
const IconRoleplay = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconStats = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconDoc = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconTrophy = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V5a1 1 0 0 0-1-1h-3"/><rect x="7" y="2" width="10" height="6" rx="1"/></svg>
const IconReport = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
const IconSupport = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
const IconQuestion = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconSave = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>

// プラン特典定義
const STANDARD_FEATURES = [
  { icon: <IconBook />, text: '全レッスン' },
  { icon: <IconAI />, text: 'AI問題 日3問' },
  { icon: <IconRoleplay />, text: 'ロールプレイ 月5回' },
  { icon: <IconStats />, text: '学習記録・進捗' },
  { icon: <IconDoc />, text: '提案書作成コース' },
]

const PREMIUM_FEATURES = [
  { icon: <IconBook />, text: '全レッスン' },
  { icon: <IconAI />, text: 'AI問題 日10問' },
  { icon: <IconRoleplay />, text: 'ロールプレイ 無制限' },
  { icon: <IconTrophy />, text: 'フェルミランキング' },
  { icon: <IconReport />, text: '月次学習レポート' },
  { icon: <IconSupport />, text: '優先サポート' },
]

const FREE_FEATURES = [
  { icon: <IconBook />, text: '初級レッスン全件' },
  { icon: <IconQuestion />, text: '1問チャレンジ（毎日）' },
  { icon: <IconSave />, text: '学習記録 無制限' },
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
      await startCheckout(plan)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  const stdPlan: PlanId = billingCycle === 'yearly' ? 'standard_yearly' : 'standard_monthly'
  const prmPlan: PlanId = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'

  const stdPrice = billingCycle === 'yearly' ? PLAN_PRICES.standard_yearly : PLAN_PRICES.standard_monthly
  const prmPrice = billingCycle === 'yearly' ? PLAN_PRICES.premium_yearly : PLAN_PRICES.premium_monthly
  // 年額の月換算
  const stdMonthly = Math.round(PLAN_PRICES.standard_yearly / 12)
  const prmMonthly = Math.round(PLAN_PRICES.premium_yearly / 12)

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
        {/* プランヘッダー */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, color: v3.color.text, marginBottom: 6 }}>プランを選んでください</div>
          <div style={{ fontSize: 13, color: v3.color.text2 }}>いつでもキャンセル・変更可能です</div>
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
                  年払いがお得
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
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{f.icon}</span>
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
                ¥{stdPrice.toLocaleString()}
                <span style={{ fontSize: 14, fontWeight: 500, color: v3.color.text2 }}>/{billingCycle === 'yearly' ? '年' : '月'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>月々約¥{stdMonthly}（年払いでお得）</div>
              )}
            </div>
  
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {STANDARD_FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{f.icon}</span>
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
                ¥{prmPrice.toLocaleString()}
                <span style={{ fontSize: 14, fontWeight: 500, color: v3.color.text2 }}>/{billingCycle === 'yearly' ? '年' : '月'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>月々約¥{prmMonthly}（年払いでお得）</div>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: `${v3.color.accent}22`, color: v3.color.accent, borderRadius: 99, padding: '4px 10px' }}>
              最強プラン
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{f.icon}</span>
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
          Google Playで管理 · 自動更新 · 買切り後に課金開始<br />
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
