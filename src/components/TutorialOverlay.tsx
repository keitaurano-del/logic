// SCRUM-195: オンボーディング後チュートリアル
import { useState } from 'react'

const TUTORIAL_KEY = 'logic-tutorial-done'

interface TutorialStep {
  title: string
  description: string
  emoji: string
}

const STEPS: TutorialStep[] = [
  {
    emoji: '📚',
    title: 'レッスンで思考力を鍛えよう',
    description: 'ロジカルシンキングや仮説思考など、ビジネスで使える思考スキルを体系的に学べるよ。',
  },
  {
    emoji: '🎭',
    title: 'ロールプレイで実践練習',
    description: 'AIを相手にケース面接や議論の実践練習ができるよ。スキルを本番で使える力に変えよう。',
  },
  {
    emoji: '🤖',
    title: 'AI問題生成で弱点を克服',
    description: '自分の弱点分野に合わせてAIがオリジナル問題を生成してくれるよ。',
  },
  {
    emoji: '📊',
    title: '学習記録でモチベ維持',
    description: '連続学習日数やXP、レベルアップを確認しながら学習を続けよう！',
  },
]

interface TutorialOverlayProps {
  onDone: () => void
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      handleDone()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleDone = () => {
    setExiting(true)
    setTimeout(() => {
      localStorage.setItem(TUTORIAL_KEY, 'true')
      onDone()
    }, 300)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #1a2035)',
          borderRadius: '20px',
          padding: '32px 24px 24px',
          maxWidth: '340px',
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          textAlign: 'center',
        }}
      >
        {/* ステップインジケーター */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === step
                  ? 'var(--v3-color-primary, #4C6EF5)'
                  : 'var(--border, rgba(255,255,255,0.15))',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* 絵文字 */}
        <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>
          {current.emoji}
        </div>

        {/* タイトル */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary, #fff)',
            margin: '0 0 12px',
            lineHeight: 1.3,
            fontFamily: '"Inter Tight", sans-serif',
          }}
        >
          {current.title}
        </h2>

        {/* 説明 */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #8899bb)',
            lineHeight: 1.7,
            margin: '0 0 28px',
          }}
        >
          {current.description}
        </p>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDone}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border, rgba(255,255,255,0.12))',
              background: 'transparent',
              color: 'var(--text-secondary, #8899bb)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            スキップ
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--v3-color-primary, #4C6EF5)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isLast ? 'はじめる 🚀' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  )
}

// チュートリアルを表示すべきか判定
export function shouldShowTutorial(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) !== 'true'
}
