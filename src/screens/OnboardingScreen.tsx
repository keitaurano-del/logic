import React, { useState } from 'react'
import { loginWithGoogle, loginWithEmail, signupWithEmail, isSupabaseConfigured } from '../supabase'
import { startBetaCampaignCheckout, startCheckout } from '../subscription'
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
function FeatureChip({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '14px 8px', borderRadius: 12,
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${color}30`,
      flex: 1,
    }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}

function RankRow({ rank, name, pt, color, highlight }: { rank: number; name: string; pt: number; color: string; highlight?: boolean }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 10,
      background: highlight ? `${color}20` : 'transparent',
      border: highlight ? `1px solid ${color}50` : '1px solid transparent',
    }}>
      <div style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{medals[rank - 1] || rank}</div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: highlight ? 800 : 600, color: '#fff' }}>{name}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: highlight ? color : 'rgba(255,255,255,0.7)' }}>
        {pt.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}> pt</span>
      </div>
    </div>
  )
}

// ── スライドデータ ──
const SLIDES = [
  {
    gradient: 'linear-gradient(160deg, #0F1220 0%, #1A2340 50%, #0F1A35 100%)',
    accentColor: 'var(--md-sys-color-primary)',
    icon: (
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="var(--md-sys-color-primary)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4"/>
        <circle cx="40" cy="40" r="24" fill="rgba(168,192,255,0.12)" stroke="var(--md-sys-color-primary)" strokeWidth="1.5"/>
        <path d="M28 40h8l4-10 4 20 4-10h4" stroke="var(--md-sys-color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="18" r="3" fill="var(--md-sys-color-primary)" opacity="0.8"/>
        <circle cx="58" cy="28" r="2" fill="#8BA8FF" opacity="0.6"/>
        <circle cx="62" cy="48" r="2.5" fill="var(--md-sys-color-primary)" opacity="0.5"/>
        <circle cx="22" cy="56" r="2" fill="#8BA8FF" opacity="0.7"/>
      </svg>
    ),
    tag: 'LEARN',
    title: '頭の回転を\n鍛えるアプリ。',
    subtitle: 'フェルミ推定・論理・ケース思考を\n毎日5分でトレーニング。',
    btnLabel: 'つぎへ',
    preview: (color: string) => (
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 360 }}>
        <FeatureChip color={color} label="体系レッスン" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        } />
        <FeatureChip color={color} label="フェルミ推定" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="9" y2="14"/><line x1="12" y1="14" x2="13" y2="14"/><line x1="16" y1="14" x2="17" y2="14"/><line x1="8" y1="18" x2="9" y2="18"/><line x1="12" y1="18" x2="13" y2="18"/><line x1="16" y1="18" x2="17" y2="18"/></svg>
        } />
        <FeatureChip color={color} label="ロールプレイ" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        } />
      </div>
    ),
  },
  {
    gradient: 'linear-gradient(160deg, #120F20 0%, #1F1535 50%, #150F28 100%)',
    accentColor: '#A78BFA',
    icon: (
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="#A78BFA" strokeWidth="1.5" opacity="0.3"/>
        <rect x="20" y="46" width="12" height="20" rx="3" fill="rgba(167,139,250,0.3)" stroke="#A78BFA" strokeWidth="1.5"/>
        <rect x="34" y="34" width="12" height="32" rx="3" fill="rgba(167,139,250,0.5)" stroke="#A78BFA" strokeWidth="1.5"/>
        <rect x="48" y="22" width="12" height="44" rx="3" fill="rgba(167,139,250,0.7)" stroke="#A78BFA" strokeWidth="1.5"/>
        <path d="M22 44l14-12 14 8 14-18" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="44" r="3" fill="#A78BFA"/>
        <circle cx="36" cy="32" r="3" fill="#A78BFA"/>
        <circle cx="50" cy="40" r="3" fill="#A78BFA"/>
        <circle cx="64" cy="22" r="3" fill="#A78BFA"/>
      </svg>
    ),
    tag: 'COMPETE',
    title: 'ランキングで\n実力を証明。',
    subtitle: 'ポイントを積み上げ、あなたの論理力を\n仲間と競い合おう。',
    btnLabel: 'つぎへ',
    preview: (color: string) => (
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${color}30`,
        borderRadius: 14, padding: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '0.12em' }}>WEEKLY RANKING</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>残り 2日</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <RankRow rank={1} name="さくら" pt={1250} color={color} />
          <RankRow rank={2} name="ゆうき" pt={1180} color={color} />
          <RankRow rank={3} name="あなた" pt={1090} color={color} highlight />
        </div>
      </div>
    ),
  },
  {
    gradient: 'linear-gradient(160deg, #0F1818 0%, #0F2420 50%, #0A1A18 100%)',
    accentColor: '#34D399',
    icon: (
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="#34D399" strokeWidth="1.5" opacity="0.3"/>
        <rect x="18" y="24" width="44" height="32" rx="8" fill="rgba(52,211,153,0.1)" stroke="#34D399" strokeWidth="1.5"/>
        <circle cx="30" cy="36" r="5" fill="rgba(52,211,153,0.3)" stroke="#34D399" strokeWidth="1.5"/>
        <line x1="40" y1="34" x2="56" y2="34" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40" y1="40" x2="52" y2="40" stroke="#34D399" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M26 52l6-4 4 3 8-6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="58" cy="20" r="10" fill="#0F2420" stroke="#34D399" strokeWidth="1.5"/>
        <path d="M54 20l2.5 2.5L62 17" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    tag: 'AI FEEDBACK',
    title: 'AIが即座に\n採点・フィードバック。',
    subtitle: '回答を送るとAIがすぐに評価。\n弱点を把握して、確実に成長できる。',
    btnLabel: 'プランをみる',
    preview: (color: string) => (
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${color}30`,
        borderRadius: 14, padding: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#0A1A18' }}>AI</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.08em' }}>採点完了</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>3秒で返答</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: '-0.03em' }}>82</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>/100</span>
          </div>
        </div>
        <div style={{
          fontSize: 12, color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.65,
          background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px',
          borderLeft: `2px solid ${color}`,
        }}>
          MECEに分解できています。次は「So What」を一段深掘りしましょう。
        </div>
      </div>
    ),
  },
]

// ── ウェルカムスライド ─────────────────────────────────────────
function WelcomeSlides({ idx, setIdx, onDone }: { idx: number; setIdx: (i: number) => void; onDone: () => void }) {
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1
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
        background: `radial-gradient(ellipse at 50% 30%, ${slide.accentColor}22 0%, transparent 65%)`,
        transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, ${slide.accentColor}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 120, left: -60, width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${slide.accentColor}10 0%, transparent 70%)`,
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
          aria-label="戻る"
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
          color: `${slide.accentColor}90`, textTransform: 'uppercase',
          marginRight: 36, /* 戻るボタンの幅ぶん中央寄せを調整 */
        }}>Logic</div>
      </div>

      {/* ヒーローアイコン */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, padding: '24px 24px 0',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          animation: 'floatIcon 3.5s ease-in-out infinite',
          filter: `drop-shadow(0 0 24px ${slide.accentColor}60)`,
        }}>
          {slide.icon}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button type="button" key={i} onClick={() => setIdx(i)}
              aria-label={`スライド ${i + 1} / ${SLIDES.length}`}
              aria-current={i === idx ? 'true' : 'false'}
              style={{
                width: i === idx ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i === idx ? slide.accentColor : `${slide.accentColor}30`,
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }} />
          ))}
        </div>
      </div>

      {/* プレビュー（中央のリッチコンテンツ） */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 24px',
        position: 'relative', zIndex: 1,
      }}>
        {slide.preview(slide.accentColor)}
      </div>

      {/* テキスト + ボタン */}
      <div style={{
        padding: '0 28px calc(env(safe-area-inset-bottom, 24px) + 28px)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${slide.accentColor}18`,
          border: `1px solid ${slide.accentColor}40`,
          borderRadius: 99, padding: '4px 12px',
          marginBottom: 14, alignSelf: 'flex-start',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accentColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: slide.accentColor, letterSpacing: '0.08em' }}>
            {slide.tag}
          </span>
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          color: '#FFFFFF', lineHeight: 1.35,
          whiteSpace: 'pre-line', margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.7, margin: '0 0 24px',
          whiteSpace: 'pre-line',
        }}>
          {slide.subtitle}
        </p>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '18px',
            background: slide.accentColor,
            border: 'none', borderRadius: 16,
            fontSize: 16, fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            boxShadow: `0 8px 32px ${slide.accentColor}50`,
            letterSpacing: '0.02em',
          }}
        >
          {slide.btnLabel}
        </button>
      </div>

      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.03); }
        }
      `}</style>
    </div>
  )
}

// ── オンボーディング用料金プラン表示 ───────────────────────────
const OB_FEATURES = [
  { label: 'レッスン',     free: '初級のみ',   standard: '全レッスン', premium: '全レッスン' },
  { label: 'AI問題生成',   free: false,         standard: '日3問',      premium: '日10問' },
  { label: 'ロールプレイ', free: false,         standard: '月5回',      premium: '無制限' },
  { label: 'フェルミ問題', free: '日1問',       standard: '日5問',      premium: '日10問' },
  { label: '学習記録',     free: true,          standard: true,         premium: true },
]

function OBCell({ value }: { value: string | boolean }) {
  if (value === true) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
  if (value === false) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
        background: selected ? `${ACCENT}18` : 'rgba(255,255,255,0.04)',
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
    ? '年齢を教えてください'
    : step === 'gender'
      ? '性別を教えてください'
      : '職種を教えてください'

  const sub = step === 'age'
    ? '年代別の傾向を学習体験に反映します'
    : step === 'gender'
      ? '統計データの分析にのみ使用します'
      : 'あなたに合ったレッスンを提案します'

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
          aria-label="戻る"
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
          boxShadow: currentValue ? `0 8px 24px ${ACCENT}50` : 'none',
          transition: 'all .2s',
        }}
      >
        {isLast ? '次へ進む' : '次へ'}
      </button>
    </div>
  )
}

// ── 月払い/年払い選択画面 ─────────────────────────────────────
function OnboardingBillingView({ planKey, onSelect, onBack }: { planKey: 'standard' | 'premium'; onSelect: (plan: 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly') => void; onBack: () => void }) {
  const ACCENT = 'var(--md-sys-color-primary)'
  const WARM = '#F4A261'
  const color = planKey === 'standard' ? ACCENT : WARM
  const label = planKey === 'standard' ? 'スタンダード' : 'プレミアム'
  const monthlyPrice = planKey === 'standard' ? 390 : 760
  const yearlyPrice = planKey === 'standard' ? 2730 : 5320
  const yearlyPerMonth = Math.round(yearlyPrice / 12)
  const savedMonths = Math.round(12 - yearlyPrice / monthlyPrice)

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", padding: 'calc(env(safe-area-inset-top, 44px) + 16px) 24px calc(env(safe-area-inset-bottom, 24px) + 24px)' }}>
      {/* 戻るボタン */}
      <button type="button" onClick={onBack} aria-label="戻る" style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `${color}90`, textAlign: 'center', marginBottom: 12 }}>{label.toUpperCase()}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', margin: '0 0 8px', lineHeight: 1.35 }}>支払いサイクルを<br />選んでください</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 32px' }}>いつでもキャンセル可能</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 年払いカード（推奨） */}
        <button onClick={() => onSelect(planKey === 'standard' ? 'standard_yearly' : 'premium_yearly')}
          style={{ position: 'relative', padding: '20px 20px 20px', borderRadius: 18, border: `2px solid ${color}`, background: `${color}14`, color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
          {/* 推奨バッジ */}
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: color, borderRadius: 99, padding: '3px 12px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
            {savedMonths}ヶ月分お得
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 6 }}>年払い（おすすめ）</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>¥{yearlyPrice.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}> / 年</span></div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>月々 ¥{yearlyPerMonth} · 一括払い</div>
              {planKey === 'standard' && <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 700, marginTop: 4 }}>キャンペーン適用で ¥1,980 / 年</div>}
            </div>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </button>

        {/* 月払いカード */}
        <button onClick={() => onSelect(planKey === 'standard' ? 'standard_monthly' : 'premium_monthly')}
          style={{ padding: '18px 20px', borderRadius: 18, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>月払い</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>¥{monthlyPrice.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}> / 月</span></div>
        </button>
      </div>
    </div>
  )
}

// ── オンボーディング用料金プラン表示 ─────────────────────────────
function OnboardingPricingView({ onNext, onSelectPlan, onBack }: { onNext: () => void; onSelectPlan: (plan: 'standard' | 'premium') => void; onBack: () => void }) {
  const ACCENT = 'var(--md-sys-color-primary)'
  const WARM = '#F4A261'
  const [loading, setLoading] = React.useState(false)

  const handleCampaignTap = async () => {
    setLoading(true)
    try {
      await startBetaCampaignCheckout()
    } catch {
      // エラー無視（非ネイティブ環境）
    }
    setLoading(false)
    onSelectPlan('standard')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", overflowY: 'auto' }}>

      {/* ヘッダー（戻る + タイトル） */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 12px) 16px 0' }}>
        <button
          onClick={onBack}
          aria-label="戻る"
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
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `${ACCENT}90`, marginBottom: 12 }}>LOGIC</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          あなたに合ったプランを<br />選んでください
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 20px', lineHeight: 1.6 }}>
          いつでも変更・キャンセル可能。
        </p>
      </div>

      {/* キャンペーンバナー（タップで決済） */}
      <button type="button" onClick={handleCampaignTap}
        aria-label="期間限定キャンペーン: スタンダード年払いが¥1,980 (通常¥2,730)"
        disabled={loading}
        style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg,#FF6B35,#FF4D6D)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: loading ? 0.7 : 1, border: 'none', color: '#fff', font: 'inherit', textAlign: 'left', width: 'calc(100% - 32px)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }} aria-hidden="true">
          <path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9z"/><path d="M12 14c0 0-2 1-2 3a2 2 0 0 0 4 0c0-2-2-3-2-3z"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>期間限定キャンペーン中！タップで即購入</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>スタンダード年払いが今だけ <strong style={{ fontSize: 15 }}>¥1,980</strong> <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>¥2,730</span></div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* 機能比較テーブル */}
      <div style={{ margin: '0 16px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* ヘッダー */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 80px', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>機能</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '.08em' }}>FREE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>無料</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: '.08em' }}>STD</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 2 }}>¥390<span style={{ fontSize: 10 }}>/月</span></div>
            <div style={{ fontSize: 10, color: ACCENT, marginTop: 1 }}>年¥2,730</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 0 }}>5ヶ月お得</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: WARM, letterSpacing: '.08em' }}>PRE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>¥760<span style={{ fontSize: 10 }}>/月</span></div>
            <div style={{ fontSize: 10, color: WARM, marginTop: 1 }}>年¥5,320</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 0 }}>5ヶ月お得</div>
          </div>
        </div>
        {/* 機能行 */}
        {OB_FEATURES.map((row, i) => (
          <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 80px', padding: '13px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{row.label}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><OBCell value={row.free} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', background: `${ACCENT}10`, borderRadius: 6, padding: '4px 0' }}><OBCell value={row.standard} /></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><OBCell value={row.premium} /></div>
          </div>
        ))}
      </div>

      {/* CTAボタン */}
      <div style={{ padding: '0 16px calc(env(safe-area-inset-bottom, 24px) + 20px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => onSelectPlan('standard')} style={{ width: '100%', padding: '17px', borderRadius: 16, border: 'none', background: ACCENT, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px ${ACCENT}50` }}>
          スタンダードプランではじめる
        </button>
        <button onClick={() => onSelectPlan('premium')} style={{ width: '100%', padding: '17px', borderRadius: 16, border: `2px solid ${WARM}`, background: 'transparent', color: WARM, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          プレミアムプランではじめる
        </button>
        <button onClick={onNext} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
          無料で始める
        </button>
      </div>
    </div>
  )
}

// ── 登録画面（スクショ参考） ──────────────────────────────────
function RegisterScreen({ onComplete, onSkip, onBack, onNavigateToLogin }: { onComplete: () => void; onSkip: () => void; onBack: () => void; onNavigateToLogin?: () => void }) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  async function handleGoogle() {
    if (!termsChecked) { setError('利用規約に同意してください'); return }
    setError(''); setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onComplete(); return }
    setError('Googleログインに失敗しました。もう一度お試しください。')
  }

  async function handleEmailSignup() {
    if (!termsChecked) { setError('利用規約に同意してください'); return }
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return }
    if (password.length < 6) { setError('パスワードは6文字以上にしてください'); return }
    setError(''); setLoading(true)
    // まずログイン試行、失敗したら新規登録
    const loginResult = await loginWithEmail(email, password)
    if (loginResult.user) { setLoading(false); onComplete(); return }
    const signupResult = await signupWithEmail(email, password)
    setLoading(false)
    if (signupResult.user) { onComplete(); return }
    setError('登録に失敗しました。既に登録済みの場合はログインをお試しください。')
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
        aria-label="戻る"
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
        新規アカウント登録
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            <button type="button" style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, font: 'inherit' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/terms.html', '_blank') }}>利用規約</button>と
            <button type="button" style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, font: 'inherit' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/privacy.html', '_blank') }}>プライバシーポリシー</button>に同意する
          </span>
        </label>

        {/* エラー */}
        {error && (
          <div style={{ fontSize: 14, color: C.error, padding: '10px 14px', background: C.errorBg, borderRadius: 10 }}>
            {error}
          </div>
        )}

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
          Googleで登録
        </button>

        {/* OR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
        </div>

        {/* メール入力 */}
        <input
          type="email"
          aria-label="メールアドレス"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        {/* パスワード入力 */}
        <input
          type="password"
          aria-label="パスワード"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="new-password"
          onKeyDown={e => { if (e.key === 'Enter') handleEmailSignup() }}
        />

        {/* 登録ボタン */}
        <button
          onClick={handleEmailSignup}
          disabled={loading || !ready}
          style={{
            width: '100%', padding: '17px',
            background: loading ? 'rgba(168,192,255,0.4)' : `linear-gradient(135deg, ${C.teal}, #818CF8)`,
            border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700, color: C.white,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '処理中...' : 'Logicをはじめる'}
        </button>

        {/* ログインリンク */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            お持ちのアカウントをお持ちの方は
          </span>
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none', border: 'none',
              color: C.teal, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'block', margin: '4px auto 0',
            }}
          >
            ログイン
          </button>
        </div>

        {/* 登録せずに始める */}
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 13,
            cursor: 'pointer', padding: '8px 0', textAlign: 'center',
          }}
        >
          登録せずにはじめる
        </button>
      </div>
      </div>
    </div>
  )
}

// ── GoogleIcon ────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
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
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard')
  const [slideIdx, setSlideIdx] = useState(0)

  const handlePlanSelect = (plan: 'standard' | 'premium') => {
    setSelectedPlan(plan)
    setPhase('billing')
  }

  const handleBillingSelect = async (planId: 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly') => {
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
          setSlideIdx(SLIDES.length - 1)
          setPhase('slides')
        }}
      />
    )
  }

  if (phase === 'pricing') {
    return (
      <OnboardingPricingView
        onNext={() => setPhase('register')}
        onSelectPlan={handlePlanSelect}
        onBack={() => setPhase('attribute')}
      />
    )
  }

  if (phase === 'billing') {
    return <OnboardingBillingView planKey={selectedPlan} onSelect={handleBillingSelect} onBack={() => setPhase('pricing')} />
  }

  return (
    <RegisterScreen
      onComplete={onComplete}
      onSkip={onComplete}
      onBack={() => setPhase('pricing')}
      onNavigateToLogin={onNavigateToLogin}
    />
  )
}
