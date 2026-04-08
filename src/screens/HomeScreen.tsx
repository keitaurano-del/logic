import { useMemo } from 'react'
import { getStreak, getCompletedCount, getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementTest'
import { ArrowRightIcon } from '../icons'
import { Button } from '../components/Button'
import {
  deviationToTopPercent,
  getPoints,
  getStreakState,
  hoursUntilMidnight,
  timeBasedGreeting,
} from './homeHelpers'

interface HomeScreenProps {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory: (category: 'fermi' | 'logic' | 'case' | 'pm') => void
}

type Category = {
  id: 'fermi' | 'logic' | 'case' | 'pm'
  icon: string
  name: string
  lessonIds: number[]
}

const CATEGORIES: Category[] = [
  { id: 'fermi', icon: '📊', name: 'フェルミ推定', lessonIds: [22, 23, 24, 25] },
  { id: 'logic', icon: '🧠', name: '論理思考', lessonIds: [20, 21, 26, 27] },
  { id: 'case', icon: '💼', name: 'ケース面接', lessonIds: [28, 29] },
  { id: 'pm', icon: '📚', name: 'PM 入門', lessonIds: [30, 31, 32, 33, 34] },
]

export function HomeScreen({ userName, onOpenLesson, onOpenCategory }: HomeScreenProps) {
  const streak = getStreak()
  const streakState = getStreakState()
  const completed = getCompletedCount()
  const completedSet = useMemo(() => new Set(getCompletedLessons()), [])
  const placement = loadPlacementResult()
  const points = getPoints()
  const deviation = placement?.deviation ?? null
  const topPct = deviation != null ? deviationToTopPercent(deviation) : null
  const rankFill = deviation != null ? Math.min(100, Math.max(10, 100 - topPct!)) : 0
  const { eyebrow, greeting } = timeBasedGreeting()
  const recovery = hoursUntilMidnight()

  // Weekly progress: count study days in last 7 days from streak (approximation)
  const weekProgress = Math.min(7, streak)
  const weekPct = (weekProgress / 7) * 100

  // XP: 100 per completed lesson, level = floor(xp/1000) + 1
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1
  const levelXp = xp % 1000
  const levelPct = (levelXp / 1000) * 100

  return (
    <div className="stack-lg">
      <header>
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: 32, marginTop: 6 }}>
          {greeting}、{userName}
        </h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>
          今日も一歩ずつ。
        </p>
      </header>

      <section className="streak-hero">
        <div className="streak-hero-top">
          <div className="streak-hero-icon">🔥</div>
          <div>
            <div className="streak-hero-num">{streak}</div>
            <div className="streak-hero-label">DAY STREAK</div>
          </div>
        </div>
        <div className="streak-hero-bar">
          <div className="streak-hero-bar-fill" style={{ width: `${weekPct}%` }} />
        </div>
        <div className="streak-hero-meta">
          <span>This week</span>
          <span>
            {weekProgress} / 7 days
          </span>
        </div>
        {streakState === 'at-risk' && (
          <div className="recovery-banner">
            <div className="recovery-icon">⚡</div>
            <div className="recovery-text">
              <b>Streak protection active</b> · 今日中にレッスンを完了すれば連続日数を維持できます（残り {recovery.hours} 時間 {recovery.minutes} 分）
            </div>
          </div>
        )}
      </section>

      <section className="points-row">
        <div className="points-pill">
          <div className="points-pill-icon">⭐</div>
          <div>
            <div className="points-pill-label">Points</div>
            <div className="points-pill-value">{points.toLocaleString()}</div>
          </div>
        </div>
        {deviation != null ? (
          <div className="points-pill">
            <div className="points-pill-icon">📈</div>
            <div>
              <div className="points-pill-label">偏差値</div>
              <div className="points-pill-value">{deviation.toFixed(1)}</div>
            </div>
          </div>
        ) : (
          <div className="points-pill">
            <div className="points-pill-icon">📊</div>
            <div>
              <div className="points-pill-label">XP</div>
              <div className="points-pill-value">{xp.toLocaleString()}</div>
            </div>
          </div>
        )}
      </section>

      {topPct != null && (
        <section className="rank-card">
          <div className="rank-eyebrow">NATIONAL RANKING</div>
          <div className="rank-row">
            <div className="rank-num">
              {topPct}
              <span className="rank-num-unit">%</span>
            </div>
            <div>
              <div className="rank-meta-top">上位 {topPct}%</div>
              <div className="rank-meta-sub">偏差値 {deviation!.toFixed(1)}</div>
            </div>
          </div>
          <div className="rank-bar">
            <div className="rank-bar-fill" style={{ width: `${rankFill}%` }} />
          </div>
        </section>
      )}

      <section>
        <div className="row-between" style={{ marginBottom: 'var(--s-3)' }}>
          <h3 style={{ fontSize: 17 }}>
            Lv.{level} · 見習い探偵
          </h3>
          <span className="mono muted" style={{ fontSize: 12 }}>
            {levelXp} / 1,000 XP
          </span>
        </div>
        <div className="progress progress-lg">
          <div className="progress-fill" style={{ width: `${levelPct}%` }} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>今日のおすすめ</h2>
        </div>
        <div className="featured">
          <span className="featured-tag">FERMI · 5 MIN</span>
          <div className="featured-q">日本にある電柱の本数はどれくらい?</div>
          <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
            Start lesson
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Categories</h2>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => {
            const done = c.lessonIds.filter((id) => completedSet.has(`lesson-${id}`)).length
            const total = c.lessonIds.length
            const pct = total > 0 ? (done / total) * 100 : 0
            return (
              <button
                key={c.id}
                className="cat-tile"
                onClick={() => {
                  if (c.lessonIds.length > 0) onOpenLesson(c.lessonIds[0])
                  else onOpenCategory(c.id)
                }}
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
              >
                <div className="cat-tile-icon">{c.icon}</div>
                <div className="cat-tile-name">{c.name}</div>
                <div className="cat-tile-meta">
                  {done} / {total}
                </div>
                <div className="progress" style={{ height: 4 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
