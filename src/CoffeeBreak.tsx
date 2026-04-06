import { useState } from 'react'
import { COFFEE_BREAK_SCENARIOS, getScenario, type CoffeeBreakScenario } from './coffeeBreakScenarios'
import { logSceneStarted, logScenarioCompleted, logShareTapped } from './coffeeBreakAnalytics'
import './CoffeeBreak.css'

type View =
  | { mode: 'selector' }
  | { mode: 'playing'; sceneId: string; stepIdx: number }
  | { mode: 'closing'; sceneId: string }

type Props = { onBack: () => void }

export default function CoffeeBreak({ onBack }: Props) {
  const [view, setView] = useState<View>({ mode: 'selector' })
  const [showHint, setShowHint] = useState(false)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const startScenario = (s: CoffeeBreakScenario) => {
    logSceneStarted(s.id)
    setShowHint(false)
    setView({ mode: 'playing', sceneId: s.id, stepIdx: 0 })
  }

  const next = () => {
    if (view.mode !== 'playing') return
    const s = getScenario(view.sceneId)
    if (!s) return
    if (view.stepIdx + 1 >= s.steps.length) {
      logScenarioCompleted(s.id)
      setView({ mode: 'closing', sceneId: s.id })
    } else {
      setShowHint(false)
      setView({ ...view, stepIdx: view.stepIdx + 1 })
    }
  }

  const share = async (s: CoffeeBreakScenario) => {
    logShareTapped(s.id)
    const text = `${s.shareText}\n\n— Logic`
    if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ text, title: s.title })
        return
      } catch { /* canceled */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareMsg('クリップボードにコピーしました')
      setTimeout(() => setShareMsg(null), 2000)
    } catch {
      setShareMsg('シェアできませんでした')
      setTimeout(() => setShareMsg(null), 2000)
    }
  }

  // Selector view
  if (view.mode === 'selector') {
    return (
      <div className="cb-screen">
        <header className="cb-header">
          <button className="cb-back" onClick={onBack}>‹</button>
          <span>コーヒーブレイク</span>
          <span className="cb-header-spacer" />
        </header>
        <div className="cb-content">
          <div className="cb-intro">
            <div className="cb-intro-emoji">☕</div>
            <h2>今日の悩み、何?</h2>
            <p>3分で読めて、ちょっと前向きになれる話。</p>
          </div>
          <div className="cb-list">
            {COFFEE_BREAK_SCENARIOS.map((s) => (
              <button key={s.id} className="cb-card" onClick={() => startScenario(s)}>
                <span className="cb-card-emoji">{s.emoji}</span>
                <span className="cb-card-label">「{s.selectorLabel}」</span>
                <span className="cb-card-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Playing view
  if (view.mode === 'playing') {
    const s = getScenario(view.sceneId)
    if (!s) return null
    const step = s.steps[view.stepIdx]
    const isLast = view.stepIdx + 1 >= s.steps.length
    return (
      <div className="cb-screen">
        <header className="cb-header">
          <button className="cb-back" onClick={() => setView({ mode: 'selector' })}>‹</button>
          <span>{s.emoji} {s.selectorLabel}</span>
          <span className="cb-header-spacer" />
        </header>
        <div className="cb-content">
          {view.stepIdx === 0 && <p className="cb-hook">{s.hook}</p>}
          <div className="cb-progress">
            {s.steps.map((_, i) => (
              <span key={i} className={`cb-dot ${i <= view.stepIdx ? 'on' : ''}`} />
            ))}
          </div>
          <div className="cb-step-card">
            <div className="cb-step-num">STEP {step.step}</div>
            <h3 className="cb-step-q">{step.question}</h3>
            {step.choices && (
              <div className="cb-choices">
                {step.choices.map((c) => (
                  <div key={c} className="cb-choice">{c}</div>
                ))}
              </div>
            )}
            <button className="cb-hint-toggle" onClick={() => setShowHint(!showHint)}>
              {showHint ? '▲ ヒントを閉じる' : '▼ ヒントを見る'}
            </button>
            {showHint && <p className="cb-hint">{step.hint}</p>}
          </div>
          <button className="cb-next-btn" onClick={next}>{isLast ? '読み終える' : '次へ'}</button>
        </div>
      </div>
    )
  }

  // Closing view
  const s = getScenario(view.sceneId)
  if (!s) return null
  return (
    <div className="cb-screen">
      <header className="cb-header">
        <button className="cb-back" onClick={() => setView({ mode: 'selector' })}>‹</button>
        <span>読了</span>
        <span className="cb-header-spacer" />
      </header>
      <div className="cb-content">
        <div className="cb-closing">
          <div className="cb-closing-emoji">{s.emoji}</div>
          <h2 className="cb-closing-title">{s.title}</h2>
          <p className="cb-closing-copy">{s.closing}</p>
          <p className="cb-closing-framework">使った考え方: {s.framework}</p>
        </div>
        <button className="cb-share-btn" onClick={() => share(s)}>
          💌 友達にシェア
        </button>
        {shareMsg && <p className="cb-share-msg">{shareMsg}</p>}
        <button className="cb-another-btn" onClick={() => setView({ mode: 'selector' })}>
          別のシーンを読む
        </button>
      </div>
    </div>
  )
}
