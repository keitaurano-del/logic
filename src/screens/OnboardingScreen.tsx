import React, { useState, useEffect, useRef } from 'react'
import { loginWithGoogle, sendEmailOtp, verifyEmailOtp, isSupabaseConfigured } from '../supabase'
import { startCheckout, PLAN_PRICES } from '../subscription'
import { MedalIcon } from '../icons'
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

// ── スライド用ミニ部品 ────────────────────────────────────────
function PhoneFrame({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 280,
      perspective: '1400px',
      animation: 'floatFrame 5s ease-in-out infinite',
    }}>
      <div style={{
        position: 'relative',
        transform: 'rotateY(-8deg) rotateX(5deg)',
        transformStyle: 'preserve-3d',
        borderRadius: 28,
        padding: 3,
        background: 'linear-gradient(150deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.10) 100%)',
        boxShadow: `0 50px 90px -25px color-mix(in srgb, ${color} 33%, transparent), 0 25px 50px -15px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.25)`,
      }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(15,18,32,0.92) 0%, rgba(20,24,42,0.96) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 26,
          padding: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          {/* 内側のソフトグロー */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 220, height: 90, borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, ${color} 19%, transparent) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function OptionRow({ color, text, selected }: { color: string; text: string; selected?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', borderRadius: 10,
      background: selected ? `color-mix(in srgb, ${color} 13%, transparent)` : 'rgba(255,255,255,0.03)',
      border: selected ? `1px solid color-mix(in srgb, ${color} 50%, transparent)` : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: selected ? color : 'transparent',
        border: selected ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <div style={{
        fontSize: 11, fontWeight: selected ? 700 : 600,
        color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
      }}>
        {text}
      </div>
    </div>
  )
}

function RankRow({ rank, name, pt, color, highlight }: { rank: number; name: string; pt: number; color: string; highlight?: boolean }) {
  const medalColor = rank === 1 ? '#F4B86A' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 10,
      background: highlight ? `color-mix(in srgb, ${color} 13%, transparent)` : 'transparent',
      border: highlight ? `1px solid color-mix(in srgb, ${color} 31%, transparent)` : '1px solid transparent',
    }}>
      <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: medalColor ?? 'rgba(255,255,255,0.6)' }}>
        {medalColor ? <MedalIcon width={18} height={18} aria-label={t('onboarding.slidesRankUnit', { n: rank })} /> : <span style={{ fontSize: 13, fontWeight: 700 }}>{rank}</span>}
      </div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: highlight ? 800 : 600, color: '#fff' }}>{name}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: highlight ? color : 'rgba(255,255,255,0.7)' }}>
        {pt.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}> pt</span>
      </div>
    </div>
  )
}

// ── スライドデータ ──
type Slide = {
  gradient: string
  accentColor: string
  tag: string
  title: string
  subtitle: string
  btnLabel: string
  preview: (color: string) => React.ReactNode
}

function getSlides(): Slide[] {
  return [
    {
      gradient: 'linear-gradient(160deg, #0F1220 0%, #1A2340 50%, #0F1A35 100%)',
      accentColor: '#6C8EF5',
      tag: t('onboarding.slidesTag1'),
      title: t('onboarding.slidesTitle1'),
      subtitle: t('onboarding.slidesSubtitle1'),
      btnLabel: t('onboarding.slidesBtn1'),
      preview: (color: string) => (
        <PhoneFrame color={color}>
          {/* ヘッダー: 戻る + 進捗バー + 進行度 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: `linear-gradient(90deg, ${color}, #9BB3FA)`, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 800, letterSpacing: '0.05em' }}>3/5</div>
          </div>

          {/* カテゴリーバッジ */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 99,
            background: `color-mix(in srgb, ${color} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            marginBottom: 10,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color,
          }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: color }} />
            MECE
          </div>

          {/* 質問カード */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '10px 12px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{t('onboarding.slidesQuestionLabel')}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
              {t('onboarding.slidesQuestion1')}
            </div>
          </div>

          {/* 選択肢 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <OptionRow color={color} text="Mutually Exclusive" selected />
            <OptionRow color={color} text="Multi-Element" />
            <OptionRow color={color} text="Most Effective" />
          </div>
        </PhoneFrame>
      ),
    },
    {
      gradient: 'linear-gradient(160deg, #120F20 0%, #1F1535 50%, #150F28 100%)',
      accentColor: '#A78BFA',
      tag: t('onboarding.slidesTag2'),
      title: t('onboarding.slidesTitle2'),
      subtitle: t('onboarding.slidesSubtitle2'),
      btnLabel: t('onboarding.slidesBtn2'),
      preview: (color: string) => (
        <PhoneFrame color={color}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '0.12em' }}>{t('onboarding.slidesWeeklyRanking')}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t('onboarding.slidesDaysLeft', { n: 2 })}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <RankRow rank={1} name={t('onboarding.slidesRankName1')} pt={1250} color={color} />
            <RankRow rank={2} name={t('onboarding.slidesRankName2')} pt={1180} color={color} />
            <RankRow rank={3} name={t('onboarding.slidesRankNameYou')} pt={1090} color={color} highlight />
            <RankRow rank={4} name={t('onboarding.slidesRankName4')} pt={980} color={color} />
          </div>
          <div style={{
            marginTop: 10, padding: '6px 10px',
            background: `color-mix(in srgb, ${color} 8%, transparent)`, borderRadius: 8,
            border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 10, color: 'rgba(255,255,255,0.85)',
          }}>
            <span style={{ fontWeight: 700 }}>{t('onboarding.slidesPointsToRank', { n: 110, rank: 2 })}</span>
            <span style={{ color, fontWeight: 800 }}>↑</span>
          </div>
        </PhoneFrame>
      ),
    },
    {
      gradient: 'linear-gradient(160deg, #0F1818 0%, #0F2420 50%, #0A1A18 100%)',
      accentColor: '#34D399',
      tag: t('onboarding.slidesTag3'),
      title: t('onboarding.slidesTitle3'),
      subtitle: t('onboarding.slidesSubtitle3'),
      btnLabel: t('onboarding.slidesBtn3'),
      preview: (color: string) => (
        <PhoneFrame color={color}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#0A1A18' }}>AI</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.08em' }}>{t('onboarding.slidesScoreDone')}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t('onboarding.slidesScoreReply')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.03em' }}>82</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>/100</span>
            </div>
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.6,
            background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '9px 11px',
            borderLeft: `2px solid ${color}`,
            marginBottom: 8,
          }}>
            {t('onboarding.slidesAiComment')}
          </div>
          {/* スコア内訳 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { label: t('onboarding.slidesScoreStructure'), score: 90 },
              { label: t('onboarding.slidesScoreLogic'), score: 85 },
              { label: t('onboarding.slidesScoreConcrete'), score: 70 },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700, width: 38 }}>{item.label}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 700, width: 18, textAlign: 'right' }}>{item.score}</span>
              </div>
            ))}
          </div>
        </PhoneFrame>
      ),
    },
  ]
}

// ── ウェルカムスライド ─────────────────────────────────────────
function WelcomeSlides({ idx, setIdx, onDone }: { idx: number; setIdx: (i: number) => void; onDone: () => void }) {
  const slides = getSlides()
  const slide = slides[idx]
  const isLast = idx === slides.length - 1
  const isFirst = idx === 0

  const next = () => {
    if (isLast) onDone()
    else setIdx(idx + 1)
  }
  const back = () => {
    if (!isFirst) setIdx(idx - 1)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: slide.gradient,
      fontFamily: "'Noto Sans JP', sans-serif",
      transition: 'background 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景グロー */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, ${slide.accentColor} 13%, transparent) 0%, transparent 65%)`,
        transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, color-mix(in srgb, ${slide.accentColor} 9%, transparent) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 120, left: -60, width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, color-mix(in srgb, ${slide.accentColor} 6%, transparent) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* 上部: 戻るボタン + LOGIC */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: 'calc(env(safe-area-inset-top, 44px) + 12px) 20px 0',
        position: 'relative', zIndex: 2,
      }}>
        <button
          onClick={back}
          aria-label={t('common.back')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isFirst ? 'default' : 'pointer',
            opacity: isFirst ? 0 : 1,
            pointerEvents: isFirst ? 'none' : 'auto',
            transition: 'opacity .2s',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{
          flex: 1, textAlign: 'center',
          fontSize: 13, fontWeight: 800, letterSpacing: '0.25em',
          color: `color-mix(in srgb, ${slide.accentColor} 56%, transparent)`, textTransform: 'uppercase',
          marginRight: 36, /* 戻るボタンの幅ぶん中央寄せを調整 */
        }}>Logic</div>
      </div>

      {/* プロダクトプレビュー（ヒーロー） */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px 8px',
        position: 'relative', zIndex: 1,
        minHeight: 0,
      }}>
        {slide.preview(slide.accentColor)}
      </div>

      {/* テキスト + ボタン */}
      <div style={{
        padding: '0 28px calc(env(safe-area-inset-bottom, 24px) + 24px)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
      }}>
        {/* ページドット */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, alignSelf: 'flex-start' }}>
          {slides.map((_, i) => (
            <button type="button" key={i} onClick={() => setIdx(i)}
              aria-label={t('onboarding.slidesAriaSlide', { n: i + 1, total: slides.length })}
              aria-current={i === idx ? 'true' : 'false'}
              style={{
                width: i === idx ? 22 : 6,
                height: 6, borderRadius: 3,
                background: i === idx ? slide.accentColor : `color-mix(in srgb, ${slide.accentColor} 19%, transparent)`,
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }} />
          ))}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `color-mix(in srgb, ${slide.accentColor} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${slide.accentColor} 25%, transparent)`,
          borderRadius: 99, padding: '4px 12px',
          marginBottom: 14, alignSelf: 'flex-start',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accentColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: slide.accentColor, letterSpacing: '0.08em' }}>
            {slide.tag}
          </span>
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800,
          color: '#FFFFFF', lineHeight: 1.3,
          whiteSpace: 'pre-line', margin: '0 0 12px',
          letterSpacing: '-0.025em',
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.7, margin: '0 0 22px',
          whiteSpace: 'pre-line',
        }}>
          {slide.subtitle}
        </p>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '18px',
            background: `linear-gradient(180deg, ${slide.accentColor} 0%, color-mix(in srgb, ${slide.accentColor} 87%, transparent) 100%)`,
            border: 'none', borderRadius: 16,
            fontSize: 16, fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            boxShadow: `0 12px 32px color-mix(in srgb, ${slide.accentColor} 33%, transparent), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.15)`,
            letterSpacing: '0.02em',
          }}
        >
          {slide.btnLabel}
        </button>
      </div>

      <style>{`
        @keyframes floatFrame {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}

// ── オンボーディング用料金プラン表示（2026-05-15 単一有料プラン化） ──
type OBFeature = { label: string; free: string | boolean; paid: string | boolean }

function getOBFeatures(): OBFeature[] {
  return [
    { label: t('pricing.featLessons'),    free: t('pricing.featAllLessons'), paid: t('pricing.featAllLessons') },
    { label: t('pricing.featRoleplay'),   free: t('pricing.featUnlimited'),  paid: t('pricing.featUnlimited') },
    { label: t('pricing.featReview'),     free: true,                         paid: true },
    { label: t('pricing.featFermi'),      free: t('pricing.featDaily1'),     paid: t('pricing.featUnlimited') },
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

function OnboardingAttributeView({ onNext, onBackToSlides }: { onNext: () => void; onBackToSlides: () => void }) {
  const [step, setStep] = React.useState<AttrStep>('age')
  const [age, setAge] = React.useState<AgeGroup | ''>('')
  const [gender, setGender] = React.useState<Gender | ''>('')
  const [occupation, setOccupation] = React.useState<Occupation | ''>('')

  const stepIdx = STEP_ORDER.indexOf(step)
  const currentValue = step === 'age' ? age : step === 'gender' ? gender : occupation
  const isLast = stepIdx === STEP_ORDER.length - 1

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
    if (stepIdx === 0) {
      onBackToSlides()
      return
    }
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
      {/* ヘッダー: 戻る + 進捗 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={goBack}
          aria-label={t('common.back')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
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
const REGISTER_RESEND_COOLDOWN_SEC = 30

function RegisterScreen({ onComplete, onBack, onNavigateToLogin }: { onComplete: () => void; onBack: () => void; onNavigateToLogin?: () => void }) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const ready = isSupabaseConfigured()

  useEffect(() => {
    if (step === 'verify') codeInputRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setTimeout(() => setResendCooldown(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCooldown])

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

  async function handleGoogle() {
    if (!termsChecked) { setError(t('onboarding.registerErrTerms')); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onComplete(); return }
    setError(t('auth.errGoogleFailed'))
  }

  async function handleSendCode() {
    if (!termsChecked) { setError(t('onboarding.registerErrTerms')); return }
    if (!email) { setError(t('auth.errEmailRequired')); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendEmailOtp(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/invalid-email') setError(t('auth.invalidEmail'))
      else if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else if (result.error === 'auth/not-configured') setError(t('auth.errNotConfigured'))
      else setError(t('auth.errSendCodeFailed'))
      return
    }
    setStep('verify')
    setCode('')
    setResendCooldown(REGISTER_RESEND_COOLDOWN_SEC)
  }

  async function handleVerify(submittedCode?: string) {
    if (!termsChecked) { setError(t('onboarding.registerErrTerms')); return }
    const c = submittedCode ?? code
    if (c.length !== 6 && c.length !== 8) return
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await verifyEmailOtp(email, c)
    setLoading(false)
    if (result.user) { onComplete(); return }
    if (result.error === 'auth/invalid-code') setError(t('auth.errInvalidCode'))
    else if (result.error === 'auth/code-expired') setError(t('auth.errCodeExpired'))
    else setError(t('auth.errSendCodeFailed'))
    codeInputRef.current?.focus()
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendEmailOtp(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else setError(t('auth.errSendCodeFailed'))
      return
    }
    setSuccessMsg(t('auth.codeResent'))
    setResendCooldown(REGISTER_RESEND_COOLDOWN_SEC)
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
            {/* Googleボタン */}
            <button
              onClick={handleGoogle}
              disabled={loading || !ready}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', padding: '16px',
                background: '#4285F4', border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <GoogleIcon />
              {t('onboarding.registerGoogleBtn')}
            </button>

            {/* OR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{t('auth.orDivider')}</span>
              <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
            </div>

            {/* メール入力 */}
            <input
              type="email"
              aria-label={t('auth.emailLabel')}
              placeholder={t('onboarding.registerEmailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              onKeyDown={e => { if (e.key === 'Enter') handleSendCode() }}
            />

            {/* コード送信ボタン */}
            <button
              onClick={handleSendCode}
              disabled={loading || !ready}
              style={{
                width: '100%', padding: '17px',
                background: loading ? 'rgba(108,142,245,0.4)' : `linear-gradient(135deg, ${C.teal}, #9BB3FA)`,
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: C.white,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('auth.processing') : t('auth.sendCodeBtn')}
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
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', textAlign: 'center', lineHeight: 1.6 }}>
              {t('auth.codeSentTo', { email })}
            </p>
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              aria-label={t('auth.codeLabel')}
              placeholder="––––––––"
              value={code}
              disabled={loading}
              onChange={e => {
                const next = e.target.value.replace(/\D/g, '').slice(0, 8)
                setCode(next)
                if (next.length === 8) handleVerify(next)
              }}
              style={{ ...inputStyle, letterSpacing: '0.32em', textAlign: 'center', fontSize: 22, opacity: loading ? 0.6 : 1 }}
              autoComplete="one-time-code"
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading || (code.length !== 6 && code.length !== 8)}
              style={{
                width: '100%', padding: '17px',
                background: loading || (code.length !== 6 && code.length !== 8) ? 'rgba(108,142,245,0.4)' : `linear-gradient(135deg, ${C.teal}, #9BB3FA)`,
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: C.white,
                cursor: loading || (code.length !== 6 && code.length !== 8) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('auth.processing') : t('auth.verifyBtn')}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 4 }}>
              <button
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: (loading || resendCooldown > 0) ? 'not-allowed' : 'pointer', padding: '4px 0', opacity: resendCooldown > 0 ? 0.5 : 1 }}
              >
                {resendCooldown > 0 ? t('auth.codeResendIn', { sec: resendCooldown }) : t('auth.codeResend')}
              </button>
              <button
                onClick={() => { setStep('email'); setError(''); setSuccessMsg(''); setCode('') }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
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

// ── GoogleIcon ────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 2.9-2.3 5.4-4.8 7v5.8h7.7c4.5-4.2 7.4-10.3 7.4-17.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-5.8c-2.2 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6C6.5 42.8 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.5 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6H2.6C1 17.4 0 20.6 0 24s1 6.6 2.6 9.5l7.9-4.7z"/>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 12.8l7.9 4.7C12.4 13.7 17.7 9.5 24 9.5z"/>
    </svg>
  )
}

// ── メインエクスポート ────────────────────────────────────────────
export function OnboardingScreen({ onComplete, onNavigateToLogin }: OnboardingScreenProps) {
  const [phase, setPhase] = useState<'slides' | 'attribute' | 'pricing' | 'billing' | 'register'>('slides')
  const [slideIdx, setSlideIdx] = useState(0)

  const handlePaidSelect = () => {
    setPhase('billing')
  }

  const handleBillingSelect = async (planId: 'paid_monthly' | 'paid_yearly') => {
    try {
      await startCheckout(planId)
    } catch { /* ignore on web */ }
    setPhase('register')
  }

  if (phase === 'slides') {
    return (
      <WelcomeSlides
        idx={slideIdx}
        setIdx={setSlideIdx}
        onDone={() => setPhase('attribute')}
      />
    )
  }

  if (phase === 'attribute') {
    return (
      <OnboardingAttributeView
        onNext={() => setPhase('pricing')}
        onBackToSlides={() => {
          setSlideIdx(getSlides().length - 1)
          setPhase('slides')
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
