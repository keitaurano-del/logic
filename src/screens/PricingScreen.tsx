import { useState } from 'react'
import {
  startCheckout,
  getSubscriptionState,
  isPaid,
  isAndroidNative,
  PLAN_PRICES,
} from '../subscription'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'

interface PricingScreenProps {
  onBack: () => void
}

type PaidPlanId = 'paid_monthly' | 'paid_yearly'
type BillingCycle = 'monthly' | 'yearly'

// ── 機能比較データ（2列：無料 vs 有料） ───────────────────────────────
type FeatureRow = {
  label: string
  free: string | boolean
  paid: string | boolean
}

function getFeatures(): FeatureRow[] {
  return [
    { label: t('pricing.featLessons'), free: t('pricing.featAllLessons'), paid: t('pricing.featAllLessons') },
    { label: t('pricing.featRoleplay'), free: t('pricing.featUnlimited'), paid: t('pricing.featUnlimited') },
    { label: t('pricing.featReview'), free: true, paid: true },
    { label: t('pricing.featFermi'), free: t('pricing.featDaily1'), paid: t('pricing.featDaily10') },
    { label: t('pricing.featAiGen'), free: t('pricing.featAiGenFree'), paid: t('pricing.featAiGenPaid') },
    { label: t('pricing.featTheme'), free: false, paid: true },
    { label: t('pricing.featEnglishMode'), free: false, paid: true },
    { label: t('pricing.featRecord'), free: true, paid: true },
  ]
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-bright)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function Cell({ value, dim }: { value: string | boolean; dim?: boolean }) {
  const opacity = dim ? 0.45 : 1
  if (value === true) return <span style={{ opacity }}><CheckIcon /></span>
  if (value === false) return <span style={{ opacity }}><CrossIcon /></span>
  return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', opacity }}>{value}</span>
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PaidPlanId | null>(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')

  const state = getSubscriptionState()
  const isCurrentlyPaid = isPaid()
  const isCurrentFree = !isCurrentlyPaid

  const monthlyPrice = PLAN_PRICES.monthly
  const yearlyPrice = PLAN_PRICES.yearly
  const yearlyMonthlyEquiv = Math.round(yearlyPrice / 12)
  const yearlySavingsPercent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)

  const targetPlanId: PaidPlanId = billingCycle === 'yearly' ? 'paid_yearly' : 'paid_monthly'
  const isCurrentTargetPlan = state.plan === targetPlanId

  const priceMain = billingCycle === 'yearly' ? `¥${yearlyPrice.toLocaleString()}` : `¥${monthlyPrice.toLocaleString()}`
  const priceSub = billingCycle === 'yearly'
    ? t('pricing.pricePerYearWithMonthly', { monthly: String(yearlyMonthlyEquiv) })
    : t('pricing.pricePerMonth')

  const handleUpgrade = async () => {
    setLoading(targetPlanId)
    setError('')
    try {
      if (!isAndroidNative()) {
        // Web は決済を持っていないので案内だけ
        setError(t('pricing.purchaseStarting'))
        setLoading(null)
        return
      }
      await startCheckout(targetPlanId)
    } catch (e: unknown) {
      setError((e as Error).message || t('pricing.purchaseError'))
      setLoading(null)
    }
  }

  const FEATURES = getFeatures()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('pricing.title')} onBack={onBack} />

      <div style={{ flex: 1, padding: '0 16px 100px', overflowY: 'auto' }}>
        {/* ─── Hero copy ─── */}
        <div style={{ padding: '12px 4px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            {t('pricing.heroEyebrow')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4, marginBottom: 10, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {t('pricing.heroHeadline')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('pricing.heroSub')}
          </div>
        </div>

        {/* ─── 月/年トグル ─── */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 14, padding: 4, gap: 4, marginBottom: 16 }}>
          {(['monthly', 'yearly'] as const).map(cycle => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              aria-pressed={billingCycle === cycle}
              style={{
                flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, transition: 'all .15s',
                background: billingCycle === cycle ? 'var(--brand)' : 'transparent',
                color: billingCycle === cycle ? 'var(--accent-fg)' : 'var(--text-secondary)',
              }}
            >
              {cycle === 'monthly' ? t('pricing.cycleMonthly') : (
                <span>
                  {t('pricing.cycleYearly')}
                  <span style={{
                    marginLeft: 6,
                    fontSize: 11,
                    background: billingCycle === 'yearly' ? 'rgba(255,255,255,0.22)' : `color-mix(in srgb, var(--warm) 13%, transparent)`,
                    color: billingCycle === 'yearly' ? 'var(--text-on-hero)' : 'var(--warm)',
                    borderRadius: 6, padding: '2px 6px', fontWeight: 800,
                  }}>
                    {t('pricing.yearlySavings', { percent: String(yearlySavingsPercent) })}
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── 価格カード（有料プラン1枚） ─── */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: '20px',
          marginBottom: 12,
          border: `2px solid color-mix(in srgb, var(--brand) 25%, transparent)`,
          position: 'relative',
        }}>
          {billingCycle === 'yearly' && (
            <div style={{
              position: 'absolute', top: -10, left: 16,
              background: 'var(--brand)', color: 'var(--accent-fg)',
              fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
              padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase',
            }}>
              {t('pricing.recommended')}
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {t('pricing.planPaid')}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{priceMain}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', paddingBottom: 4 }}>{priceSub}</span>
          </div>

          {isCurrentTargetPlan ? (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--brand)', fontWeight: 700, padding: '14px 0' }}>
              {t('pricing.currentPlan')}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={!!loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                border: 'none', background: 'var(--brand)', color: 'var(--accent-fg)',
                fontSize: 16, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading === targetPlanId ? t('pricing.processing') : t('pricing.startPaid')}
            </button>
          )}
        </div>

        {/* ─── 現状の無料プラン表示 ─── */}
        {isCurrentFree && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('pricing.planFree')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t('pricing.currentPlan')}</span>
          </div>
        )}

        {/* ─── 機能比較リスト（2列: 無料 / 有料） ─── */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden' }}>
          {/* ヘッダー行 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', padding: '12px 16px', borderBottom: `1px solid ${'var(--border)'}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{t('pricing.planFeatureHeader')}</div>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.06em' }}>
              {t('pricing.planFree')}
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.06em' }}>
              {t('pricing.planPaid')}
            </div>
          </div>
          {/* 機能行 */}
          {FEATURES.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 0.8fr 0.8fr',
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${'var(--border)'}`,
                background: i % 2 === 0 ? 'transparent' : `color-mix(in srgb, var(--bg-primary) 31%, transparent)`,
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{row.label}</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Cell value={row.free} dim />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Cell value={row.paid} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── 注記 ─── */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.8, marginTop: 16 }}>
          {t('pricing.note1')}<br />
          {t('pricing.note2')}
        </div>

        {error && (
          <div style={{ margin: '12px 0 0', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '12px 16px', color: 'var(--md-sys-color-error)', fontSize: 14 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
