import { useMemo, type ReactElement } from 'react'
import {
  getCompletedCount,
  getCompletedLessons,
  getStreak,
  getStudyDates,
  getStudyHours,
} from '../stats'
import { loadPlacementResult } from '../placementTest'
import { SettingsIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { buildActivityGrid, deviationToTopPercent, getPoints } from './homeHelpers'

interface ProfileScreenProps {
  userName: string
  onOpenSettings: () => void
}

const CAT_ROWS: { name: string; lessonIds: number[] }[] = [
  { name: 'Fermi', lessonIds: [22, 23, 24, 25] },
  { name: 'Logic', lessonIds: [20, 21, 26, 27] },
  { name: 'Case', lessonIds: [28, 29] },
  { name: 'PM', lessonIds: [30, 31, 32, 33, 34] },
]

export function ProfileScreen({ userName, onOpenSettings }: ProfileScreenProps) {
  const streak = getStreak()
  const completed = getCompletedCount()
  const studyHours = getStudyHours()
  const points = getPoints()
  const placement = loadPlacementResult()
  const deviation = placement?.deviation ?? null
  const topPct = deviation != null ? deviationToTopPercent(deviation) : null
  const rankFill = topPct != null ? Math.min(100, Math.max(10, 100 - topPct)) : 0

  const completedSet = useMemo(() => new Set(getCompletedLessons()), [])
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1
  const levelXp = xp % 1000
  const levelPct = (levelXp / 1000) * 100

  const activityGrid = useMemo(() => buildActivityGrid(getStudyDates()), [])

  return (
    <div className="stack-lg">
      <div className="row-between">
        <h1 style={{ fontSize: 28 }}>Profile</h1>
        <IconButton aria-label="Settings" onClick={onOpenSettings}>
          <SettingsIcon />
        </IconButton>
      </div>

      <section className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar">👤</div>
          <div>
            <div className="profile-hero-name">{userName}</div>
            <div className="profile-hero-level">Lv.{level} · 見習い探偵</div>
          </div>
        </div>
        <div className="row-between" style={{ position: 'relative' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
            LEVEL PROGRESS
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {levelXp} / 1,000 XP
          </span>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            height: 8,
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginTop: 8,
            position: 'relative',
          }}
        >
          <div
            style={{
              background: 'var(--brand-light)',
              height: '100%',
              width: `${levelPct}%`,
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>
      </section>

      {topPct != null && (
        <section className="rank-card">
          <div className="rank-eyebrow">NATIONAL RANKING · 偏差値 {deviation!.toFixed(1)}</div>
          <div className="rank-row">
            <div className="rank-num">
              {topPct}
              <span className="rank-num-unit">%</span>
            </div>
            <div>
              <div className="rank-meta-top">上位 {topPct}%</div>
              <div className="rank-meta-sub">全国ランキング</div>
            </div>
          </div>
          <div className="rank-bar">
            <div className="rank-bar-fill" style={{ width: `${rankFill}%` }} />
          </div>
        </section>
      )}

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="stat">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{points.toLocaleString()}</div>
          <div className="stat-label">Points</div>
        </div>
        <div className="stat">
          <div className="stat-icon">⏱</div>
          <div className="stat-value">{studyHours}</div>
          <div className="stat-label">Study</div>
        </div>
      </div>

      <section className="section">
        <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>Activity</h2>
        <div className="calendar-card">
          <div className="cal-grid">
            {(() => {
              // Render 7 rows × 12 cols = 84 cells, column-major
              const cells: ReactElement[] = []
              for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 12; c++) {
                  const idx = c * 7 + r
                  const lv = activityGrid[idx] || 0
                  cells.push(<div key={`${r}-${c}`} className={`cal-day${lv ? ' l' + lv : ''}`} />)
                }
              }
              return cells
            })()}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 6, marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Less
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-secondary)' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#DDE4F7' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#B6C3E8' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand-mid)' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand)' }} />
            </div>
            More
          </div>
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>Category progress</h2>
        <div className="card">
          {CAT_ROWS.map((c) => {
            const done = c.lessonIds.filter((id) => completedSet.has(`lesson-${id}`)).length
            const pct = c.lessonIds.length > 0 ? Math.round((done / c.lessonIds.length) * 100) : 0
            return (
              <div key={c.name} className="cat-row">
                <div className="cat-row-name">{c.name}</div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="cat-row-val">{pct}%</div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
