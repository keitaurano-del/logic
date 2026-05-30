// チュートリアルオーバーレイ（スポットライト誘導型）
// Daily Fermi 画面の主要機能（問題→ヒント→電卓→提出/ランキング反映）を順に案内する
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { t } from '../i18n'

const TUTORIAL_KEY = 'logic-tutorial-done-v2'

// ── SVGアイコン（各ステップ用） ──────────────────────────
const Icons = {
  question: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  hint: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  calculator: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="11" x2="8" y2="11"/>
      <line x1="12" y1="11" x2="12" y2="11"/>
      <line x1="16" y1="11" x2="16" y2="11"/>
      <line x1="8" y1="15" x2="8" y2="15"/>
      <line x1="12" y1="15" x2="12" y2="15"/>
      <line x1="16" y1="15" x2="16" y2="15"/>
      <line x1="8" y1="19" x2="8" y2="19"/>
      <line x1="12" y1="19" x2="12" y2="19"/>
      <line x1="16" y1="19" x2="16" y2="19"/>
    </svg>
  ),
  trophy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
}

// ── ステップ定義 ─────────────────────────────────────
interface TutorialStep {
  id: string
  icon: React.ReactNode
  tag: string
  tagColor: string
  title: string
  description: string
  targetId?: string   // DOM要素をハイライト
  position: 'center' | 'bottom' | 'top'
}

function getSteps(): TutorialStep[] {
  return [
    {
      id: 'question',
      icon: Icons.question,
      tag: t('tutorial.step1.tag'),
      tagColor: 'var(--md-sys-color-primary)',
      title: t('tutorial.step1.title'),
      description: t('tutorial.step1.description'),
      targetId: 'dailyFermi-question',
      position: 'bottom',
    },
    {
      id: 'hint',
      icon: Icons.hint,
      tag: t('tutorial.step2.tag'),
      tagColor: '#F59E0B',
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.description'),
      targetId: 'dailyFermi-hint-btn',
      position: 'bottom',
    },
    {
      id: 'calculator',
      icon: Icons.calculator,
      tag: t('tutorial.step3.tag'),
      tagColor: '#34D399',
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.description'),
      targetId: 'dailyFermi-calc-btn',
      position: 'bottom',
    },
    {
      id: 'ranking',
      icon: Icons.trophy,
      tag: t('tutorial.step4.tag'),
      tagColor: '#FF6B35',
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.description'),
      targetId: 'dailyFermi-submit-btn',
      position: 'top',
    },
  ]
}

interface TutorialOverlayProps {
  onDone: () => void
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const STEPS = getSteps()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = (step + 1) / STEPS.length

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  // DOM計測: useLayoutEffect でペイント前に同期的に測定する
  // 対象要素が未マウント（lazy 読み込み中など）の場合は短いリトライを行う
  useLayoutEffect(() => {
    if (retryRef.current) {
      clearTimeout(retryRef.current)
      retryRef.current = null
    }

    let attempts = 0
    const measure = () => {
      if (!current.targetId) {
        setTargetRect(null)
        return
      }
      const el = document.getElementById(current.targetId)
      if (el) {
        // 画面内にスクロール（ターゲットが画面外なら中央付近に持ってくる）
        const rect = el.getBoundingClientRect()
        const inView = rect.top >= 0 && rect.bottom <= window.innerHeight
        if (!inView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // スクロール後に再計測
          retryRef.current = setTimeout(() => {
            const r = el.getBoundingClientRect()
            setTargetRect(r)
          }, 320)
          return
        }
        setTargetRect(rect)
        return
      }
      // 未マウントなら最大 10 回 × 100ms までリトライ（lazy load 対策）
      if (attempts < 10) {
        attempts += 1
        retryRef.current = setTimeout(measure, 100)
      } else {
        setTargetRect(null)
      }
    }
    measure()

    return () => {
      if (retryRef.current) {
        clearTimeout(retryRef.current)
        retryRef.current = null
      }
    }
  }, [step, current.targetId])

  const handleNext = () => {
    if (isLast) {
      handleFinish()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleFinish = () => {
    setVisible(false)
    localStorage.setItem(TUTORIAL_KEY, 'true')
    setTimeout(onDone, 300)
  }

  const handleSkip = () => {
    setVisible(false)
    localStorage.setItem(TUTORIAL_KEY, 'true')
    setTimeout(onDone, 300)
  }

  // スポットライトのclip-path計算
  const spotlight = targetRect
    ? `polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%,
        0% ${targetRect.top - 8}px,
        ${targetRect.left - 8}px ${targetRect.top - 8}px,
        ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
        ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
        ${targetRect.right + 8}px ${targetRect.top - 8}px,
        0% ${targetRect.top - 8}px
      )`
    : undefined

  // カードの表示位置（ターゲットに対して上 or 下）
  const cardBottom = current.position === 'top' && targetRect
    ? `calc(100dvh - ${targetRect.top - 16}px)`
    : undefined
  const cardTop = current.position === 'bottom' && targetRect
    ? `${targetRect.bottom + 16}px`
    : undefined

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* ダークオーバーレイ（スポットライト付き） */}
      <button
        type="button"
        aria-label={t('tutorial.skipAria')}
        onClick={handleSkip}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          clipPath: spotlight,
          transition: 'clip-path 0.4s ease',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      />
      {/* スポットライト枠（ハイライト枠線 + 脈動アニメ） */}
      {targetRect && (
        <>
          <div style={{
            position: 'absolute',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 14,
            border: `2px solid ${current.tagColor}`,
            boxShadow: `0 0 20px color-mix(in srgb, ${current.tagColor} 38%, transparent)`,
            pointerEvents: 'none',
            transition: 'all 0.4s ease',
            animation: 'tut-spotlight-pulse 2.2s ease-in-out infinite',
          }} />
          <style>{`
            @keyframes tut-spotlight-pulse {
              0%, 100% { box-shadow: 0 0 20px color-mix(in srgb, ${current.tagColor} 38%, transparent); }
              50%      { box-shadow: 0 0 32px color-mix(in srgb, ${current.tagColor} 60%, transparent); }
            }
          `}</style>
        </>
      )}

      {/* カード本体 */}
      <div
        style={{
          position: 'absolute',
          left: 16, right: 16,
          bottom: cardBottom,
          top: cardTop,
          ...(current.position === 'center' && !cardBottom && !cardTop ? {
            top: '50%', transform: 'translateY(-50%)',
          } : {}),
          ...(!targetRect ? {
            top: '50%', transform: 'translateY(-50%)',
          } : {}),
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          background: 'linear-gradient(160deg, #1A1F35 0%, #141828 100%)',
          borderRadius: 24,
          padding: '24px 24px 20px',
          border: `1px solid color-mix(in srgb, ${current.tagColor} 19%, transparent)`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}>
          {/* プログレスバー */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: `linear-gradient(90deg, ${current.tagColor}, color-mix(in srgb, ${current.tagColor} 67%, transparent))`,
              width: `${progress * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* タグ + アイコン */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `color-mix(in srgb, ${current.tagColor} 9%, transparent)`,
              border: `1px solid color-mix(in srgb, ${current.tagColor} 19%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {current.icon}
            </div>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `color-mix(in srgb, ${current.tagColor} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${current.tagColor} 25%, transparent)`,
                borderRadius: 99, padding: '3px 10px', marginBottom: 4,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: current.tagColor }} />
                <span style={{ fontSize: '0.7333rem', fontWeight: 800, color: current.tagColor, letterSpacing: '0.08em' }}>{current.tag}</span>
              </div>
              <div style={{ fontSize: '1.1333rem', fontWeight: 800, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                {current.title}
              </div>
            </div>
          </div>

          {/* 説明文 */}
          <p style={{
            fontSize: '0.9333rem', color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75, margin: '0 0 20px',
          }}>
            {current.description}
          </p>

          {/* ステップドット */}
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 18 : 5, height: 5, borderRadius: 3,
                background: i === step ? current.tagColor : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* ボタン */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isLast && (
              <button onClick={handleSkip} style={{
                padding: '12px 16px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
                color: 'rgba(255,255,255,0.45)', fontSize: '0.9333rem', fontWeight: 600,
                cursor: 'pointer', flexShrink: 0,
              }}>
                {t('tutorial.skip')}
              </button>
            )}
            <button onClick={handleNext} style={{
              flex: 1, padding: '14px', borderRadius: 12, border: 'none',
              background: current.tagColor,
              color: '#fff', fontSize: '1rem', fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 8px 24px color-mix(in srgb, ${current.tagColor} 31%, transparent)`,
              letterSpacing: '0.01em',
            }}>
              {isLast ? t('tutorial.start') : t('tutorial.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// チュートリアルボタン（右下に常駐）
export function TutorialFAB({ onClick, onHide }: { onClick: () => void; onHide: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 'calc(env(safe-area-inset-bottom, 16px) + 80px)',
        zIndex: 500,
      }}
    >
      {/* 閉じるボタン（右上） */}
      <button
        onClick={onHide}
        aria-label={t('tutorial.closeAria')}
        style={{
          position: 'absolute',
          top: -10,
          right: -10,
          zIndex: 501,
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'rgba(30,32,48,0.95)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
          <line x1="2" y1="2" x2="8" y2="8"/>
          <line x1="8" y1="2" x2="2" y2="8"/>
        </svg>
      </button>
      {/* メインの?ボタン */}
      <button
        onClick={onClick}
        aria-label={t('tutorial.openAria')}
        style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--md-sys-color-primary), #9BB3FA)',
          border: 'none',
          boxShadow: '0 6px 20px rgba(108,142,245,0.5)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>
    </div>
  )
}
