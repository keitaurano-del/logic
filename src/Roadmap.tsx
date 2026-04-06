import { getRoadmap } from './roadmapData'
import { loadRoadmapState, getProgress, isStepComplete, getCurrentStep } from './roadmapStore'
import './Roadmap.css'

type Props = {
  onBack: () => void
  onStartLesson: (lessonId: number) => void
}

export default function Roadmap({ onBack, onStartLesson }: Props) {
  const state = loadRoadmapState()
  const roadmap = state.goalId ? getRoadmap(state.goalId) : null
  const progress = getProgress()
  const currentStepId = getCurrentStep()

  if (!roadmap) {
    return (
      <div className="roadmap-screen">
        <div className="roadmap-empty">
          <p>ロードマップが選択されていません</p>
          <button className="roadmap-back-btn" onClick={onBack}>戻る</button>
        </div>
      </div>
    )
  }

  return (
    <div className="roadmap-screen">
      {/* Header */}
      <div className="roadmap-header">
        <button className="roadmap-back-btn" onClick={onBack}>← 戻る</button>
        <div className="roadmap-header-info">
          <h2 className="roadmap-title">
            <span className="roadmap-emoji">{roadmap.emoji}</span>
            {roadmap.title}
          </h2>
          <p className="roadmap-subtitle">{roadmap.subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="roadmap-progress-section">
        <div className="roadmap-progress-header">
          <span className="roadmap-progress-label">進捗</span>
          <span className="roadmap-progress-stat">
            {progress.completed}/{progress.total} ({progress.percent}%)
          </span>
        </div>
        <div className="roadmap-progress-track">
          <div
            className="roadmap-progress-fill"
            style={{
              width: `${progress.percent}%`,
              background: `linear-gradient(90deg, ${roadmap.color}, ${roadmap.color}88)`,
            }}
          />
        </div>
        {state.targetDate && (
          <span className="roadmap-target-date">
            目標: {state.targetDate} / {state.dailyMinutes}分/日
          </span>
        )}
      </div>

      {/* Step list - vertical flow */}
      <div className="roadmap-steps">
        {roadmap.steps.map((step, idx) => {
          const done = isStepComplete(step.lessonId)
          const isCurrent = step.lessonId === currentStepId
          const isLocked = !done && !isCurrent

          return (
            <div
              key={step.lessonId}
              className={`roadmap-step ${done ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
              style={{ '--step-color': roadmap.color } as React.CSSProperties}
            >
              {/* Connector line */}
              {idx < roadmap.steps.length - 1 && (
                <div className={`roadmap-connector ${done ? 'done' : ''}`} />
              )}

              {/* Step node */}
              <div className="roadmap-step-node">
                {done ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="roadmap-step-number">{idx + 1}</span>
                )}
              </div>

              {/* Step content */}
              <div className="roadmap-step-content">
                <h4 className="roadmap-step-title">{step.title}</h4>
                <p className="roadmap-step-desc">{step.description}</p>
                {isCurrent && (
                  <button
                    className="roadmap-step-start"
                    style={{ background: roadmap.color }}
                    onClick={() => onStartLesson(step.lessonId)}
                  >
                    学習を始める
                  </button>
                )}
                {done && <span className="roadmap-step-badge">完了</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion message */}
      {progress.completed === progress.total && progress.total > 0 && (
        <div className="roadmap-complete-banner">
          <span className="roadmap-complete-emoji">🎉</span>
          <strong>おめでとうございます！</strong>
          <p>全ステップを完了しました</p>
        </div>
      )}
    </div>
  )
}
