// チュートリアルオーバーレイ（スポットライト誘導型）
import { useState, useEffect } from 'react'

const TUTORIAL_KEY = 'logic-tutorial-done-v2'

// ── SVGアイコン ──────────────────────────────────────
const Icons = {
  fermi: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C8EF5" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  ),
  training: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <rect x="2" y="5" width="3" height="14" rx="1" fill="#A78BFA"/>
      <rect x="5" y="8" width="2" height="8" rx="0.5" fill="#A78BFA"/>
      <rect x="17" y="8" width="2" height="8" rx="0.5" fill="#A78BFA"/>
      <rect x="19" y="5" width="3" height="14" rx="1" fill="#A78BFA"/>
      <rect x="7" y="11" width="10" height="2" rx="1" fill="#A78BFA"/>
    </svg>
  ),
  ranking: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 21H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3v6zM14 21h-4v-8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v8zM21 21h-3v-10a2 2 0 0 0-2-2h-1"/>
      <polyline points="7 8 12 3 17 8"/>
    </svg>
  ),
  xp: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  start: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8" fill="#FF6B35" stroke="none"/>
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

const STEPS: TutorialStep[] = [
  {
    id: 'fermi',
    icon: Icons.fermi,
    tag: '今日の1問',
    tagColor: '#6C8EF5',
    title: '毎日フェルミ問題に挑戦',
    description: 'ホーム画面の「今日のフェルミ問題」で、1日1問チャレンジできるよ。数字の感覚を毎日少しずつ鍛えよう。',
    targetId: 'home-fermi-card',
    position: 'bottom',
  },
  {
    id: 'training',
    icon: Icons.training,
    tag: 'トレーニング',
    tagColor: '#A78BFA',
    title: 'コースでスキルを体系的に学ぶ',
    description: '下メニューの「トレーニング」から14カテゴリのコースにアクセスできるよ。ロジカルシンキング・仮説思考など、実践で使えるスキルが揃ってる。',
    targetId: 'bottom-tab-lessons',
    position: 'top',
  },
  {
    id: 'ranking',
    icon: Icons.ranking,
    tag: 'ランキング',
    tagColor: '#F59E0B',
    title: '実力をランキングで証明する',
    description: '問題を解くたびにポイントが貯まって、ランキングに反映されるよ。仲間との競争がモチベーションになる。',
    targetId: 'bottom-tab-ranking',
    position: 'top',
  },
  {
    id: 'xp',
    icon: Icons.xp,
    tag: 'ポイント',
    tagColor: '#34D399',
    title: 'XPを貯めてレベルアップ',
    description: 'レッスン完了・フェルミ回答・AI問題生成などでXP（経験値）が貯まるよ。プロフィール画面でいつでも確認できる。',
    targetId: 'bottom-tab-profile',
    position: 'top',
  },
  {
    id: 'start',
    icon: Icons.start,
    tag: 'スタート',
    tagColor: '#FF6B35',
    title: 'さっそくやってみよう！',
    description: '最初の1問、フェルミ問題にチャレンジしてみよう。答えは何でもOK — まず考えることが大事だよ。',
    position: 'center',
  },
]

interface TutorialOverlayProps {
  onDone: () => void
  onGoFermi?: () => void
}

export function TutorialOverlay({ onDone, onGoFermi }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = (step + 1) / STEPS.length

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  useEffect(() => {
    if (current.targetId) {
      const el = document.getElementById(current.targetId)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
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
    setTimeout(() => {
      onDone()
      if (onGoFermi) onGoFermi()
    }, 300)
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

  // カードの表示位置
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
      <div
        onClick={handleSkip}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          clipPath: spotlight,
          transition: 'clip-path 0.4s ease',
        }}
      />
      {/* スポットライト枠（ハイライト枠線） */}
      {targetRect && (
        <div style={{
          position: 'absolute',
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          borderRadius: 14,
          border: `2px solid ${current.tagColor}`,
          boxShadow: `0 0 20px ${current.tagColor}60`,
          pointerEvents: 'none',
          transition: 'all 0.4s ease',
        }} />
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
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          background: 'linear-gradient(160deg, #1A1F35 0%, #141828 100%)',
          borderRadius: 24,
          padding: '24px 24px 20px',
          border: `1px solid ${current.tagColor}30`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}>
          {/* プログレスバー */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: `linear-gradient(90deg, ${current.tagColor}, ${current.tagColor}aa)`,
              width: `${progress * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* タグ + アイコン */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `${current.tagColor}18`,
              border: `1px solid ${current.tagColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {current.icon}
            </div>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${current.tagColor}18`, border: `1px solid ${current.tagColor}40`,
                borderRadius: 99, padding: '3px 10px', marginBottom: 4,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: current.tagColor }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: current.tagColor, letterSpacing: '0.08em' }}>{current.tag}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                {current.title}
              </div>
            </div>
          </div>

          {/* 説明文 */}
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.65)',
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
                color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0,
              }}>
                スキップ
              </button>
            )}
            <button onClick={handleNext} style={{
              flex: 1, padding: '14px', borderRadius: 12, border: 'none',
              background: current.tagColor,
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${current.tagColor}50`,
              letterSpacing: '0.01em',
            }}>
              {isLast ? 'さっそくやってみよう' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// チュートリアルを表示すべきか判定
export function shouldShowTutorial(): boolean {
  return false  // デフォルトでは自動表示しない
}

// チュートリアルボタン（右下に常駐）
export function TutorialFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 'calc(env(safe-area-inset-bottom, 16px) + 80px)',
        zIndex: 500,
        width: 44, height: 44,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6C8EF5, #8B6EF5)',
        border: 'none',
        boxShadow: '0 4px 16px rgba(108,142,245,0.45)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </button>
  )
}
