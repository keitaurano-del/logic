import React, { useState } from 'react'
import { sendMagicLink, isSupabaseConfigured } from '../supabase'
import { startCheckout, PLAN_PRICES } from '../subscription'
import { t, localizedHtmlPath } from '../i18n'
import {
  saveUserProfile,
  AGE_LABELS,
  GENDER_LABELS,
  OCCUPATION_LABELS,
  type AgeGroup,
  type Gender,
  type Occupation,
} from '../userProfile'

interface OnboardingScreenProps {
  onComplete: () => void
  onNavigateToLogin?: () => void
}

// ── カラー ──
const C = {
  bg: '#F0F2FA',
  teal: 'var(--md-sys-color-primary)',
  tealDark: '#4A6BD6',
  darkBg: '#0F1220',
  text: '#1A1F2E',
  text2: '#4A5578',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.18)',
  inputBg: 'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.18)',
  error: 'var(--md-sys-color-error)',
  errorBg: 'rgba(248,113,113,0.10)',
}


// ── オンボーディング用料金プラン表示（2026-05-15 単一有料プラン化） ──
type OBFeature = { label: string; free: string | boolean; paid: string | boolean }

function getOBFeatures(): OBFeature[] {
  return [
    { label: t('pricing.featLessons'),    free: t('pricing.featAllLessons'), paid: t('pricing.featAllLessons') },
    { label: t('pricing.featRoleplay'),   free: t('pricing.featUnlimited'),  paid: t('pricing.featUnlimited') },
    { label: t('pricing.featReview'),     free: true,                         paid: true },
    { label: t('pricing.featFermi'),      free: t('pricing.featDaily1'),     paid: t('pricing.featDaily10') },
    { label: t('pricing.featAiGen'),      free: t('pricing.featAiGenFree'),  paid: t('pricing.featAiGenPaid') },
    { label: t('pricing.featRecord'),     free: true,                         paid: true },
  ]
}

function OBCell({ value }: { value: string | boolean }) {
  if (value === true) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
  if (value === false) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  return <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{value}</span>
}

// ── 属性質問ステップ ─────────────────────────────────────────
const ACCENT = 'var(--md-sys-color-primary)'

const AGE_ORDER: AgeGroup[] = ['teens', '20s', '30s', '40s', '50plus']
const GENDER_ORDER: Gender[] = ['male', 'female', 'other', 'na']
const OCCUPATION_ORDER: Occupation[] = [
  'executive',
  'consultant',
  'strategy',
  'sales_marketing',
  'engineering',
  'admin',
  'professional',
  'student',
  'other',
]

type AttrStep = 'age' | 'gender' | 'occupation'
const STEP_ORDER: AttrStep[] = ['age', 'gender', 'occupation']

function AttrOption<T extends string>({
  value,
  label,
  selected,
  onSelect,
}: { value: T; label: string; selected: boolean; onSelect: (v: T) => void }) {
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', borderRadius: 14,
        border: `2px solid ${selected ? ACCENT : 'rgba(255,255,255,0.1)'}`,
        background: selected ? `color-mix(in srgb, ${ACCENT} 9%, transparent)` : 'rgba(255,255,255,0.04)',
        color: '#fff', cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 15, fontWeight: selected ? 700 : 500, flex: 1 }}>{label}</span>
      {selected && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      )}
    </button>
  )
}

function OnboardingAttributeView({ onNext }: { onNext: () => void; onBackToSlides: () => void }) {
  const [step, setStep] = React.useState<AttrStep>('age')
  const [age, setAge] = React.useState<AgeGroup | ''>('')
  const [gender, setGender] = React.useState<Gender | ''>('')
  const [occupation, setOccupation] = React.useState<Occupation | ''>('')

  const stepIdx = STEP_ORDER.indexOf(step)
  const currentValue = step === 'age' ? age : step === 'gender' ? gender : occupation
  const isLast = stepIdx === STEP_ORDER.length - 1
  const isFirstStep = stepIdx === 0

  const goNext = () => {
    if (!currentValue) return
    if (isLast) {
      saveUserProfile({
        age: age || undefined,
        gender: gender || undefined,
        occupation: occupation || undefined,
        completedAt: new Date().toISOString(),
      })
      onNext()
      return
    }
    setStep(STEP_ORDER[stepIdx + 1])
  }

  const goBack = () => {
    if (stepIdx === 0) return
    setStep(STEP_ORDER[stepIdx - 1])
  }

  const heading = step === 'age'
    ? t('onboarding.attrAgeHeading')
    : step === 'gender'
      ? t('onboarding.attrGenderHeading')
      : t('onboarding.attrOccupationHeading')

  const sub = step === 'age'
    ? t('onboarding.attrAgeSub')
    : step === 'gender'
      ? t('onboarding.attrGenderSub')
      : t('onboarding.attrOccupationSub')

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans JP', sans-serif",
      padding: 'calc(env(safe-area-inset-top, 44px) + 16px) 24px calc(env(safe-area-inset-bottom, 24px) + 24px)',
    }}>
      {/* ヘッダー: 戻る + 進捗（最初の質問では戻るボタン非表示） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={goBack}
          aria-label={t('common.back')}
          disabled={isFirstStep}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isFirstStep ? 'default' : 'pointer',
            opacity: isFirstStep ? 0 : 1,
            pointerEvents: isFirstStep ? 'none' : 'auto',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {STEP_ORDER.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= stepIdx ? ACCENT : 'rgba(255,255,255,0.12)',
              transition: 'background .25s',
            }} />
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', minWidth: 28, textAlign: 'right' }}>
          {stepIdx + 1}/{STEP_ORDER.length}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
          {heading}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
          {sub}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step === 'age' && AGE_ORDER.map(v => (
            <AttrOption key={v} value={v} label={AGE_LABELS[v]} selected={age === v} onSelect={setAge} />
          ))}
          {step === 'gender' && GENDER_ORDER.map(v => (
            <AttrOption key={v} value={v} label={GENDER_LABELS[v]} selected={gender === v} onSelect={setGender} />
          ))}
          {step === 'occupation' && OCCUPATION_ORDER.map(v => (
            <AttrOption key={v} value={v} label={OCCUPATION_LABELS[v]} selected={occupation === v} onSelect={setOccupation} />
          ))}
        </div>
      </div>

      <button
        onClick={goNext}
        disabled={!currentValue}
        style={{
          width: '100%', padding: '17px', borderRadius: 16, border: 'none',
          background: currentValue ? ACCENT : 'rgba(255,255,255,0.1)',
          color: currentValue ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: 16, fontWeight: 800,
          cursor: currentValue ? 'pointer' : 'not-allowed',
          marginTop: 24,
          boxShadow: currentValue ? `0 8px 24px color-mix(in srgb, ${ACCENT} 31%, transparent)` : 'none',
          transition: 'all .2s',
        }}
      >
        {isLast ? t('onboarding.attrNextLast') : t('onboarding.attrNext')}
      </button>
    </div>
  )
}

// ── オンボーディング用 月払い/年払い選択画面（2026-05-15 単一有料プラン化） ──
function OnboardingBillingView({ onSelect, onBack }: {
  onSelect: (plan: 'paid_monthly' | 'paid_yearly') => void
  onBack: () => void
}) {
  const ACCENT = 'var(--md-sys-color-primary)'
  const monthlyPrice = PLAN_PRICES.monthly
  const yearlyPrice = PLAN_PRICES.yearly
  const yearlyPerMonth = Math.round(yearlyPrice / 12)
  const savedMonths = Math.round(12 - yearlyPrice / monthlyPrice)

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", padding: 'calc(env(safe-area-inset-top, 44px) + 16px) 24px calc(env(safe-area-inset-bottom, 24px) + 24px)' }}>
      {/* 戻るボタン */}
      <button type="button" onClick={onBack} aria-label={t('common.back')} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `color-mix(in srgb, ${ACCENT} 56%, transparent)`, textAlign: 'center', marginBottom: 12 }}>{t('pricing.planPaid').toUpperCase()}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', margin: '0 0 8px', lineHeight: 1.35, whiteSpace: 'pre-line' }}>{t('onboarding.billingTitle')}</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 32px' }}>{t('onboarding.billingSubtitle')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 年払いカード（推奨） */}
        <button onClick={() => onSelect('paid_yearly')}
          style={{ position: 'relative', padding: '20px 20px 20px', borderRadius: 18, border: `2px solid ${ACCENT}`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)`, color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
          {/* 推奨バッジ */}
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: ACCENT, borderRadius: 99, padding: '3px 12px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
            {t('onboarding.billingSavedMonths', { n: savedMonths })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>{t('onboarding.billingYearlyTitle')}</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>¥{yearlyPrice.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}> {t('onboarding.billingYearlyUnit')}</span></div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{t('onboarding.billingMonthlyEquiv', { n: yearlyPerMonth })}</div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </button>

        {/* 月払いカード */}
        <button onClick={() => onSelect('paid_monthly')}
          style={{ padding: '18px 20px', borderRadius: 18, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{t('onboarding.billingMonthlyTitle')}</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>¥{monthlyPrice.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}> {t('onboarding.billingMonthlyUnit')}</span></div>
        </button>
      </div>
    </div>
  )
}

// ── オンボーディング用料金プラン表示（2026-05-15 単一有料プラン化） ─────
function OnboardingPricingView({ onNext, onSelectPaid, onBack }: {
  onNext: () => void
  onSelectPaid: () => void
  onBack: () => void
}) {
  const ACCENT = 'var(--md-sys-color-primary)'

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", overflowY: 'auto' }}>

      {/* ヘッダー（戻る + タイトル） */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 12px) 16px 0' }}>
        <button
          onClick={onBack}
          aria-label={t('common.back')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 12,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
      <div style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `color-mix(in srgb, ${ACCENT} 56%, transparent)`, marginBottom: 12 }}>LOGIC</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
          {t('pricing.heroHeadline')}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 20px', lineHeight: 1.6 }}>
          {t('pricing.heroSub')}
        </p>
      </div>

      {/* 機能比較テーブル（2列: 無料 / 有料） */}
      <div style={{ margin: '0 16px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{t('pricing.planFeatureHeader')}</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '.08em' }}>{t('pricing.planFree').toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '.08em' }}>{t('pricing.planPaid').toUpperCase()}</div>
          </div>
        </div>
        {getOBFeatures().map((row, i) => (
          <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', padding: '13px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{row.label}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><OBCell value={row.free} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', background: `color-mix(in srgb, ${ACCENT} 8%, transparent)`, borderRadius: 6, padding: '4px 0' }}><OBCell value={row.paid} /></div>
          </div>
        ))}
      </div>

      {/* CTAボタン */}
      <div style={{ padding: '0 16px calc(env(safe-area-inset-bottom, 24px) + 20px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onSelectPaid} style={{ width: '100%', padding: '17px', borderRadius: 16, border: 'none', background: ACCENT, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px color-mix(in srgb, ${ACCENT} 31%, transparent)` }}>
          {t('pricing.startPaid')}
        </button>
        <button onClick={onNext} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
          {t('onboarding.pricingStartFree')}
        </button>
      </div>
    </div>
  )
}

// ── 登録画面（スクショ参考） ──────────────────────────────────

function RegisterScreen({ onComplete: _onComplete, onBack, onNavigateToLogin }: { onComplete: () => void; onBack: () => void; onNavigateToLogin?: () => void }) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const ready = isSupabaseConfigured()

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    background: C.inputBg,
    color: C.white,
    fontSize: 16,
    fontFamily: "'Noto Sans JP', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  async function handleSendLink() {
    if (!termsChecked) { setError(t('onboarding.registerErrTerms')); return }
    if (!email) { setError(t('auth.errEmailRequired')); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendMagicLink(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/invalid-email') setError(t('auth.invalidEmail'))
      else if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else if (result.error === 'auth/not-configured') setError(t('auth.errNotConfigured'))
      else setError(t('auth.errSendLinkFailed'))
      return
    }
    setStep('sent')
  }

  async function handleResend() {
    if (loading) return
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendMagicLink(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else setError(t('auth.errSendLinkFailed'))
      return
    }
    setSuccessMsg(t('auth.linkResent'))
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: C.darkBg,
      fontFamily: "'Noto Sans JP', sans-serif",
      padding: 'calc(env(safe-area-inset-top, 44px) + 12px) 24px calc(env(safe-area-inset-bottom, 24px) + 24px)',
    }}>
      <button
        onClick={onBack}
        aria-label={t('common.back')}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-start',
          marginBottom: 24,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{
        fontSize: 24, fontWeight: 700,
        color: C.white, textAlign: 'center',
        margin: '0 0 28px',
      }}>
        {t('onboarding.registerTitle')}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400, width: '100%', margin: '0 auto' }}>

        {/* 利用規約チェックボックス */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={() => setTermsChecked(v => !v)}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          />
          <span
            aria-hidden="true"
            style={{
              width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${termsChecked ? C.teal : C.inputBorder}`,
              background: termsChecked ? C.teal : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {termsChecked && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            <button type="button" style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, font: 'inherit' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(localizedHtmlPath('terms'), '_blank') }}>{t('profile.terms')}</button>{t('onboarding.registerTermsPrefix')}
            <button type="button" style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, font: 'inherit' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(localizedHtmlPath('privacy'), '_blank') }}>{t('profile.privacy')}</button>{t('onboarding.registerTermsSuffix')}
          </span>
        </label>

        {/* エラー / 成功 */}
        {error && (
          <div role="alert" aria-live="polite" style={{ fontSize: 14, color: C.error, padding: '10px 14px', background: C.errorBg, borderRadius: 10 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div role="status" aria-live="polite" style={{ fontSize: 14, color: '#a7f3d0', padding: '10px 14px', background: 'rgba(34,197,94,0.12)', borderRadius: 10 }}>
            {successMsg}
          </div>
        )}

        {step === 'email' ? (
          <>
            {/* メール入力 */}
            <input
              type="email"
              aria-label={t('auth.emailLabel')}
              placeholder={t('onboarding.registerEmailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              onKeyDown={e => { if (e.key === 'Enter') handleSendLink() }}
            />

            {/* リンク送信ボタン */}
            <button
              onClick={handleSendLink}
              disabled={loading || !ready}
              style={{
                width: '100%', padding: '17px',
                background: loading ? 'rgba(108,142,245,0.4)' : `linear-gradient(135deg, ${C.teal}, #9BB3FA)`,
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: C.white,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('auth.processing') : t('auth.sendLinkBtn')}
            </button>

            {/* ログインリンク */}
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {t('onboarding.registerHaveAccount')}
              </span>
              <button
                onClick={onNavigateToLogin}
                style={{
                  background: 'none', border: 'none',
                  color: C.teal, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'block', margin: '4px auto 0',
                }}
              >
                {t('onboarding.registerLoginLink')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.white, textAlign: 'center', margin: '0 0 8px' }}>
              {t('auth.linkSentTitle')}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', textAlign: 'center', lineHeight: 1.6 }}>
              {t('auth.linkSentTo', { email })}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 16 }}>
              <button
                onClick={handleResend}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: C.teal, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', padding: '10px 0', opacity: loading ? 0.5 : 1 }}
              >
                {t('auth.linkResend')}
              </button>
              <button
                onClick={() => { setStep('email'); setError(''); setSuccessMsg('') }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}
              >
                {t('auth.backToLogin')}
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}

// ── メインエクスポート ────────────────────────────────────────────
// 2026-05-16: ウェルカムスライドは廃止し、属性質問画面から始める。
export function OnboardingScreen({ onComplete, onNavigateToLogin }: OnboardingScreenProps) {
  const [phase, setPhase] = useState<'attribute' | 'pricing' | 'billing' | 'register'>('attribute')

  const handlePaidSelect = () => {
    setPhase('billing')
  }

  const handleBillingSelect = async (planId: 'paid_monthly' | 'paid_yearly') => {
    try {
      await startCheckout(planId)
    } catch { /* ignore on web */ }
    setPhase('register')
  }

  if (phase === 'attribute') {
    return (
      <OnboardingAttributeView
        onNext={() => setPhase('pricing')}
        onBackToSlides={() => {
          // スライド廃止のため、何もしない（属性が最初の画面）
        }}
      />
    )
  }

  if (phase === 'pricing') {
    return (
      <OnboardingPricingView
        onNext={() => setPhase('register')}
        onSelectPaid={handlePaidSelect}
        onBack={() => setPhase('attribute')}
      />
    )
  }

  if (phase === 'billing') {
    return <OnboardingBillingView onSelect={handleBillingSelect} onBack={() => setPhase('pricing')} />
  }

  return (
    <RegisterScreen
      onComplete={onComplete}
      onBack={() => setPhase('pricing')}
      onNavigateToLogin={onNavigateToLogin}
    />
  )
}
