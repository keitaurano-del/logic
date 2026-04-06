import { useState } from 'react'
import { roadmaps } from './roadmapData'
import { selectGoal, setTargetDate, setDailyMinutes, completeSetup } from './roadmapStore'

type Props = {
  onComplete: () => void
}

type InternalScreen = 'goals' | 'schedule'

export default function GoalSelect({ onComplete }: Props) {
  const [screen, setScreen] = useState<InternalScreen>('goals')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [minutes, setMinutes] = useState(15)

  const handleGoalPick = (goalId: string) => {
    setSelectedGoalId(goalId)
    selectGoal(goalId)
    setScreen('schedule')
  }

  const handleFinish = () => {
    if (date) setTargetDate(date)
    setDailyMinutes(minutes)
    completeSetup()
    onComplete()
  }

  // ---- Screen A: Goal cards ----
  if (screen === 'goals') {
    return (
      <div className="goal-select">
        <div className="goal-select-header">
          <h2 className="goal-select-title">目標を選ぼう</h2>
          <p className="goal-select-subtitle">どのスキルを伸ばしたいですか？</p>
        </div>
        <div className="goal-cards">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              className="goal-card"
              style={{ '--goal-color': r.color } as React.CSSProperties}
              onClick={() => handleGoalPick(r.id)}
            >
              <span className="goal-card-emoji">{r.emoji}</span>
              <div className="goal-card-text">
                <strong>{r.title}</strong>
                <span>{r.subtitle}</span>
              </div>
              <span className="goal-card-steps">{r.steps.length}ステップ</span>
              <span className="goal-card-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---- Screen B: Date + Pace ----
  const selectedRoadmap = roadmaps.find((r) => r.id === selectedGoalId)

  return (
    <div className="goal-select">
      <div className="goal-select-header">
        <h2 className="goal-select-title">学習ペースを決めよう</h2>
        <p className="goal-select-subtitle">
          {selectedRoadmap ? `${selectedRoadmap.emoji} ${selectedRoadmap.title}` : ''}
        </p>
      </div>

      <div className="schedule-form">
        <label className="schedule-label">
          <span className="schedule-label-text">目標達成日（任意）</span>
          <input
            type="date"
            className="schedule-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>

        <label className="schedule-label">
          <span className="schedule-label-text">1日の学習時間</span>
          <div className="pace-options">
            {[10, 15, 20, 30, 45, 60].map((m) => (
              <button
                key={m}
                className={`pace-btn ${minutes === m ? 'active' : ''}`}
                onClick={() => setMinutes(m)}
              >
                {m}分
              </button>
            ))}
          </div>
        </label>

        {date && selectedRoadmap && (
          <div className="schedule-summary">
            <span className="schedule-summary-icon">📅</span>
            <span>
              {selectedRoadmap.steps.length}ステップを{' '}
              {Math.ceil(
                (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )}
              日で完了
            </span>
          </div>
        )}

        <div className="schedule-actions">
          <button className="schedule-back" onClick={() => setScreen('goals')}>
            ← 戻る
          </button>
          <button className="schedule-start" onClick={handleFinish}>
            学習を始める 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
