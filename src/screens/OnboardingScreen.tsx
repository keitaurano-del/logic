import React, { useState } from 'react'
import { loginWithGoogle, loginWithEmail, signupWithEmail, isSupabaseConfigured } from '../supabase'
import { startBetaCampaignCheckout, startCheckout } from '../subscription'

interface OnboardingScreenProps {
  onComplete: () => void
  onNavigateToLogin?: () => void
}

// ── カラー ──
const C = {
  bg: '#F0F2FA',
  teal: '#6C8EF5',
  tealDark: '#4A6BD6',
  darkBg: '#0F1220',
  text: '#1A1F2E',
  text2: '#4A5578',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.18)',
  inputBg: 'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.18)',
  error: '#F87171',
  errorBg: 'rgba(248,113,113,0.10)',
}

// ── スライドデータ ──
const SLIDES = [
  {
    gradient: 'linear-gradient(160deg, #0F1220 0%, #1A2340 50%, #0F1A35 100%)',
    accentColor: '#6C8EF5',
    particleColor: '#6C8EF5',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="#6C8EF5" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4"/>
        <circle cx="40" cy="40" r="24" fill="rgba(108,142,245,0.12)" stroke="#6C8EF5" strokeWidth="1.5"/>
        <path d="M28 40h8l4-10 4 20 4-10h4" stroke="#6C8EF5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="18" r="3" fill="#6C8EF5" opacity="0.8"/>
        <circle cx="58" cy="28" r="2" fill="#8BA8FF" opacity="0.6"/>
        <circle cx="62" cy="48" r="2.5" fill="#6C8EF5" opacity="0.5"/>
        <circle cx="22" cy="56" r="2" fill="#8BA8FF" opacity="0.7"/>
      </svg>
    ),
    title: '論理思考力を\n毎日鍛えよう。',
    subtitle: 'レッスン・フェルミ推定・AIフィードバックで\nビジネス思考力が着実に伸びる。',
    btnLabel: 'つぎへ',
  },
  {
    gradient: 'linear-gradient(160deg, #120F20 0%, #1F1535 50%, #150F28 100%)',
    accentColor: '#A78BFA',
    particleColor: '#A78BFA',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
    title: 'ランキングで\n自分の実力を証明。',
    subtitle: 'ポイントを積み上げ、あなたの論理力を\n仲間と競い合おう。',
    btnLabel: 'つぎへ',
  },
  {
    gradient: 'linear-gradient(160deg, #0F1818 0%, #0F2420 50%, #0A1A18 100%)',
    accentColor: '#34D399',
    particleColor: '#34D399',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
    title: 'AIが即座に採点\nフィードバック。',
    subtitle: '回答を送るとAIがすぐに評価。\n弱点を把握して、確実に成長できる。',
    btnLabel: 'プランをみる',
  },
]

// ── ウェルカムスライド ─────────────────────────────────────────
function WelcomeSlides({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0)
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const next = () => {
    if (isLast) onDone()
    else setIdx(i => i + 1)
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

      {/* ビジュアルエリア（上55%） */}
      <div style={{
        flex: '0 0 55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
        position: 'relative',
        padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 0',
      }}>
        {/* Logic ロゴ */}
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.25em', color: `${slide.accentColor}90`, textTransform: 'uppercase' }}>Logic</div>

        {/* メインアイコン */}
        <div style={{
          animation: 'floatIcon 3.5s ease-in-out infinite',
          filter: `drop-shadow(0 0 24px ${slide.accentColor}60)`,
        }}>
          {slide.icon}
        </div>

        {/* ドットインジケーター */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === idx ? slide.accentColor : `${slide.accentColor}30`,
              transition: 'all 0.35s ease',
              cursor: 'pointer',
            }} />
          ))}
        </div>
      </div>

      {/* テキスト + ボタン（下45%） */}
      <div style={{
        flex: 1,
        padding: '32px 28px calc(env(safe-area-inset-bottom, 24px) + 32px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        {/* タグライン */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${slide.accentColor}18`,
          border: `1px solid ${slide.accentColor}40`,
          borderRadius: 99, padding: '4px 12px',
          marginBottom: 16, alignSelf: 'flex-start',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accentColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: slide.accentColor, letterSpacing: '0.08em' }}>
            {idx === 0 ? 'LEARN' : idx === 1 ? 'COMPETE' : 'AI FEEDBACK'}
          </span>
        </div>

        <h1 style={{
          fontSize: 30, fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.35,
          whiteSpace: 'pre-line',
          margin: '0 0 14px',
          letterSpacing: '-0.02em',
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.75, margin: '0 0 32px',
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
const OCCUPATION_OPTIONS = [
  { id: 'student',    label: '学生',         icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 1.5 9 1.5 12 0v-5"/></svg> },
  { id: 'newgrad',    label: '新卒〜3年目',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { id: 'mid',        label: 'ミドル（4〜10年）', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg> },
  { id: 'senior',     label: 'シニア・管理職', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'freelance',  label: 'フリーランス',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { id: 'other',      label: 'その他',        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

function OnboardingAttributeView({ onNext }: { onNext: (occupation: string) => void }) {
  const [selected, setSelected] = React.useState('')
  const ACCENT = '#6C8EF5'

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0F1220 0%, #1A2340 60%, #0F1A35 100%)', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px calc(env(safe-area-inset-bottom, 24px) + 24px)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `${ACCENT}90`, textAlign: 'center', marginBottom: 16 }}>LOGIC</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, textAlign: 'center', margin: '0 0 10px', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
          あなたについて<br />教えてください
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 32px', lineHeight: 1.6 }}>
          あなたに最適なコースを提案するよ
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OCCUPATION_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setSelected(opt.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, border: `2px solid ${selected === opt.id ? ACCENT : 'rgba(255,255,255,0.1)'}`, background: selected === opt.id ? `${ACCENT}18` : 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}>
              <div style={{ color: selected === opt.id ? ACCENT : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{opt.icon}</div>
              <span style={{ fontSize: 15, fontWeight: selected === opt.id ? 700 : 500 }}>{opt.label}</span>
              {selected === opt.id && (
                <svg style={{ marginLeft: 'auto' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => selected && onNext(selected)} disabled={!selected}
        style={{ width: '100%', padding: '17px', borderRadius: 16, border: 'none', background: selected ? ACCENT : 'rgba(255,255,255,0.1)', color: selected ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 800, cursor: selected ? 'pointer' : 'not-allowed', marginTop: 24, boxShadow: selected ? `0 8px 24px ${ACCENT}50` : 'none', transition: 'all .2s' }}>
        次へ
      </button>
    </div>
  )
}

// ── 月払い/年払い選択画面 ─────────────────────────────────────
function OnboardingBillingView({ planKey, onSelect, onBack }: { planKey: 'standard' | 'premium'; onSelect: (plan: 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly') => void; onBack: () => void }) {
  const ACCENT = '#6C8EF5'
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
      <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
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
function OnboardingPricingView({ onNext, onSelectPlan }: { onNext: () => void; onSelectPlan: (plan: 'standard' | 'premium') => void }) {
  const ACCENT = '#6C8EF5'
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

      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 16px) 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: `${ACCENT}90`, marginBottom: 12 }}>LOGIC</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          あなたに合ったプランを<br />選んでください
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 20px', lineHeight: 1.6 }}>
          いつでも変更・キャンセル可能。
        </p>
      </div>

      {/* キャンペーンバナー（タップで決済） */}
      <div onClick={handleCampaignTap} style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg,#FF6B35,#FF4D6D)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9z"/><path d="M12 14c0 0-2 1-2 3a2 2 0 0 0 4 0c0-2-2-3-2-3z"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>期間限定キャンペーン中！タップで即購入</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>スタンダード年払いが今だけ <strong style={{ fontSize: 15 }}>¥1,980</strong> <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>¥2,730</span></div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

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
function RegisterScreen({ onComplete, onSkip, onNavigateToLogin }: { onComplete: () => void; onSkip: () => void; onNavigateToLogin?: () => void }) {
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
      padding: '0 24px',
      justifyContent: 'center',
    }}>
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
          <div
            onClick={() => setTermsChecked(v => !v)}
            style={{
              width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${termsChecked ? C.teal : C.inputBorder}`,
              background: termsChecked ? C.teal : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2, cursor: 'pointer',
            }}
          >
            {termsChecked && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            <span style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/terms.html', '_blank') }}>利用規約</span>と
            <span style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/privacy.html', '_blank') }}>プライバシーポリシー</span>に同意する
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
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        {/* パスワード入力 */}
        <input
          type="password"
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
            background: loading ? 'rgba(108,142,245,0.4)' : `linear-gradient(135deg, ${C.teal}, #818CF8)`,
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
    return <WelcomeSlides onDone={() => setPhase('attribute')} />
  }

  if (phase === 'attribute') {
    return <OnboardingAttributeView onNext={() => setPhase('pricing')} />
  }

  if (phase === 'pricing') {
    return <OnboardingPricingView onNext={() => setPhase('register')} onSelectPlan={handlePlanSelect} />
  }

  if (phase === 'billing') {
    return <OnboardingBillingView planKey={selectedPlan} onSelect={handleBillingSelect} onBack={() => setPhase('pricing')} />
  }

  return (
    <RegisterScreen
      onComplete={onComplete}
      onSkip={onComplete}
      onNavigateToLogin={onNavigateToLogin}
    />
  )
}
