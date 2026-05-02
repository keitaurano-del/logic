import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan, isAndroidNative, PLAN_PRICES } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

// ── 機能比較テーブル定義 ──────────────────────────────
type FeatureRow = {
  label: string
  free: string | boolean
  standard: string | boolean
  premium: string | boolean
}

const FEATURES: FeatureRow[] = [
  { label: 'レッスン',        free: '初級のみ',    standard: '全レッスン',  premium: '全レッスン' },
  { label: 'AI問題生成',      free: false,          standard: '日3問',       premium: '日10問' },
  { label: 'ロールプレイ',    free: false,          standard: '月5回',       premium: '無制限' },
  { label: 'フェルミ問題',    free: '日1問',        standard: '日5問',       premium: '日10問' },
  { label: '学習記録',        free: true,           standard: true,          premium: true },
]

// ── チェック / クロス / テキスト表示 ─────────────────
function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (value === false) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
  return <span style={{ fontSize: 11, fontWeight: 600, color: v3.color.text, lineHeight: 1.2 }}>{value}</span>
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  // 選択中プラン（月払い/年払い切替）
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()

  const stdPrice = billingCycle === 'yearly' ? PLAN_PRICES.standard_yearly : PLAN_PRICES.standard_monthly
  const prePrice = billingCycle === 'yearly' ? PLAN_PRICES.premium_yearly : PLAN_PRICES.premium_monthly
  const stdMonthly = Math.round(PLAN_PRICES.standard_yearly / 12)
  const preMonthly = Math.round(PLAN_PRICES.premium_yearly / 12)

  const stdPlanId: PlanId = billingCycle === 'yearly' ? 'standard_yearly' : 'standard_monthly'
  const prePlanId: PlanId = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'

  const isCurrentFree = state.plan === 'free'
  const isCurrentStd = isActiveStandard && !isActivePremium
  const isCurrentPre = isActivePremium

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

  // カラム幅比率（スマホ最適化）
  const COL = { feature: '38%', free: '18%', std: '22%', pre: '22%' }

  const headerStyle = (active: boolean, color: string): React.CSSProperties => ({
    padding: '10px 4px 8px',
    textAlign: 'center' as const,
    background: active ? `${color}18` : 'transparent',
    borderBottom: active ? `2px solid ${color}` : `1px solid ${v3.color.line}`,
  })

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>料金プラン</div>
      </div>

      <div style={{ padding: '0 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* キャンペーンバナー（スタンダード年払い限定） */}
        <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4D6D 100%)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9z"/><path d="M12 14c0 0-2 1-2 3a2 2 0 0 0 4 0c0-2-2-3-2-3z"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>期間限定キャンペーン中！</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 1 }}>
              スタンダード年払いが今だけ <span style={{ fontWeight: 800, fontSize: 13 }}>¥1,980</span>
              <span style={{ marginLeft: 4, textDecoration: 'line-through', opacity: 0.7 }}>¥{PLAN_PRICES.standard_yearly.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* トライアルバナー */}
        {state.plan === 'trial' && (
          <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: 10, padding: '8px 14px', fontSize: 13, color: v3.color.accent, fontWeight: 600 }}>
            7日間トライアル中 — あと {trialDays} 日
          </div>
        )}

        {/* 月払い / 年払い トグル */}
        <div style={{ display: 'flex', background: v3.color.card, borderRadius: 12, padding: 4, gap: 4 }}>
          {(['monthly', 'yearly'] as const).map(cycle => (
            <button key={cycle} onClick={() => setBillingCycle(cycle)}
              style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all .15s', background: billingCycle === cycle ? v3.color.accent : 'transparent', color: billingCycle === cycle ? v3.color.bg : v3.color.text2 }}>
              {cycle === 'monthly' ? '月払い' : (
                <span>年払い <span style={{ fontSize: 10, background: billingCycle === 'yearly' ? 'rgba(255,255,255,0.25)' : `${v3.color.warm}22`, color: billingCycle === 'yearly' ? '#fff' : v3.color.warm, borderRadius: 6, padding: '1px 5px', fontWeight: 800 }}>5ヶ月お得</span></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 機能比較テーブル */}
      <div style={{ flex: 1, padding: '14px 16px 100px', overflowY: 'auto' }}>
        <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: COL.feature }} />
              <col style={{ width: COL.free }} />
              <col style={{ width: COL.std }} />
              <col style={{ width: COL.pre }} />
            </colgroup>

            {/* プランヘッダー */}
            <thead>
              <tr>
                <th style={{ padding: '12px 8px 8px 14px', textAlign: 'left', borderBottom: `1px solid ${v3.color.line}` }}>
                  <div style={{ fontSize: 10, color: v3.color.text3, fontWeight: 600 }}>機能</div>
                </th>
                {/* FREE */}
                <th style={headerStyle(isCurrentFree, v3.color.text3)}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: v3.color.text3, letterSpacing: '.06em' }}>FREE</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: v3.color.text, marginTop: 2 }}>無料</div>
                  {isCurrentFree && <div style={{ fontSize: 9, color: v3.color.text3, marginTop: 1 }}>現在</div>}
                </th>
                {/* STANDARD */}
                <th style={headerStyle(isCurrentStd, v3.color.accent)}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: v3.color.accent, letterSpacing: '.06em' }}>STD</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: v3.color.text, marginTop: 2 }}>
                    ¥{stdPrice.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 9, color: v3.color.text3, marginTop: 1 }}>
                    {billingCycle === 'yearly' ? `/年 (月々¥${stdMonthly})` : '/月'}
                  </div>
                  {isCurrentStd && <div style={{ fontSize: 9, color: v3.color.accent, marginTop: 1 }}>現在</div>}
                </th>
                {/* PREMIUM */}
                <th style={headerStyle(isCurrentPre, v3.color.warm)}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: v3.color.warm, letterSpacing: '.06em' }}>PRE</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: v3.color.text, marginTop: 2 }}>
                    ¥{prePrice.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 9, color: v3.color.text3, marginTop: 1 }}>
                    {billingCycle === 'yearly' ? `/年 (月々¥${preMonthly})` : '/月'}
                  </div>
                  {isCurrentPre && <div style={{ fontSize: 9, color: v3.color.warm, marginTop: 1 }}>現在</div>}
                </th>
              </tr>
            </thead>

            {/* 機能行 */}
            <tbody>
              {FEATURES.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? 'transparent' : `${v3.color.bg}60` }}>
                  <td style={{ padding: '11px 6px 11px 14px', fontSize: 12, fontWeight: 600, color: v3.color.text2, borderTop: `1px solid ${v3.color.line}` }}>
                    {row.label}
                  </td>
                  <td style={{ textAlign: 'center', borderTop: `1px solid ${v3.color.line}`, padding: '11px 4px' }}>
                    <Cell value={row.free} />
                  </td>
                  <td style={{ textAlign: 'center', borderTop: `1px solid ${v3.color.line}`, padding: '11px 4px', background: `${v3.color.accent}06` }}>
                    <Cell value={row.standard} />
                  </td>
                  <td style={{ textAlign: 'center', borderTop: `1px solid ${v3.color.line}`, padding: '11px 4px', background: `${v3.color.warm}06` }}>
                    <Cell value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CTAボタン行 */}
          <div style={{ display: 'grid', gridTemplateColumns: `${COL.feature} ${COL.free} ${COL.std} ${COL.pre}`, padding: '12px 8px 16px 8px', gap: 6, borderTop: `1px solid ${v3.color.line}` }}>
            <div /> {/* 機能列は空 */}
            {/* FREE */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isCurrentFree
                ? <div style={{ fontSize: 10, fontWeight: 700, color: v3.color.text3, textAlign: 'center' }}>利用中</div>
                : <div style={{ fontSize: 10, color: v3.color.text3, textAlign: 'center' }}>無料</div>
              }
            </div>
            {/* STANDARD */}
            <div>
              {isCurrentStd
                ? <div style={{ fontSize: 10, fontWeight: 700, color: v3.color.accent, textAlign: 'center' }}>利用中</div>
                : <button onClick={() => handleUpgrade(stdPlanId)} disabled={!!loading}
                    style={{ width: '100%', padding: '8px 4px', borderRadius: 9, border: `1.5px solid ${v3.color.accent}`, background: 'transparent', color: v3.color.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                    {loading === stdPlanId ? '…' : '始める'}
                  </button>
              }
            </div>
            {/* PREMIUM */}
            <div>
              {isCurrentPre
                ? <div style={{ fontSize: 10, fontWeight: 700, color: v3.color.warm, textAlign: 'center' }}>利用中</div>
                : <button onClick={() => handleUpgrade(prePlanId)} disabled={!!loading}
                    style={{ width: '100%', padding: '8px 4px', borderRadius: 9, border: 'none', background: v3.color.warm, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                    {loading === prePlanId ? '…' : '始める'}
                  </button>
              }
            </div>
          </div>
        </div>

        {/* 注記 */}
        <div style={{ fontSize: 11, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8, marginTop: 16 }}>
          Google Playで管理 · 自動更新<br />
          年払いは一括請求。キャンセル後は期間終了まで利用可能。
        </div>

        {error && (
          <div style={{ margin: '12px 0 0', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
