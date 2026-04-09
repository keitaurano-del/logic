import { useMemo, type ReactElement } from 'react'
import {
  getCompletedCount,
  getCompletedLessons,
  getStreak,
  getStudyDates,
  getStudyHours,
} from '../stats'
import { loadPlacementResult } from '../placementTest'
import { UserIcon, FlameIcon, StarIcon, CheckIcon, ClockIcon } from '../icons'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { buildActivityGrid, deviationToTopPercent, getPoints } from './homeHelpers'

interface ProfileScreenProps {
  userName: string
}

const CAT_ROWS: { name: string; lessonIds: number[] }[] = [
  { name: 'Fermi', lessonIds: [22, 23, 24, 25] },
  { name: 'Logic', lessonIds: [20, 21, 26, 27] },
  { name: 'Case', lessonIds: [28, 29] },
  { name: 'PM', lessonIds: [30, 31, 32, 33, 34] },
]

interface DerivedData {
  streak: number
  completed: number
  studyHours: string
  points: number
  deviation: number | null
  topPct: number | null
  rankFill: number
  completedSet: Set<string>
  xp: number
  level: number
  levelXp: number
  levelPct: number
  activityGrid: number[]
}

function useProfileData(): DerivedData {
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
  return { streak, completed, studyHours, points, deviation, topPct, rankFill, completedSet, xp, level, levelXp, levelPct, activityGrid }
}

const DOW_LABELS = ['月', '火', '水', '木', '金', '土', '日']

function ActivityCalendar({ grid }: { grid: number[] }) {
  // Build month labels for column headers (12 weeks = 12 columns)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIdx = 83 // today is the last cell

  // Compute which month each column starts with (show label on first col of a new month)
  const monthLabels: (string | null)[] = []
  for (let c = 0; c < 12; c++) {
    const daysAgo = (11 - c) * 7 + 6 // oldest day in this column
    const d = new Date(today)
    d.setDate(d.getDate() - daysAgo)
    const prevD = new Date(d)
    prevD.setDate(prevD.getDate() - 7)
    monthLabels.push(d.getMonth() !== prevD.getMonth() || c === 0
      ? (d.getMonth() + 1) + '月'
      : null)
  }

  const dayRows: ReactElement[][] = Array.from({ length: 7 }, () => [])
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 12; c++) {
      const idx = c * 7 + r
      const lv = grid[idx] || 0
      const isToday = idx === todayIdx
      dayRows[r].push(
        <div
          key={`${r}-${c}`}
          className={`cal-day${lv ? ' l' + lv : ''}${isToday ? ' today' : ''}`}
          title={lv ? `学習済み` : '未学習'}
        />
      )
    }
  }

  return (
    <div className="cal-wrap">
      {/* Month labels row */}
      <div className="cal-month-row">
        <div className="cal-dow-spacer" />
        {monthLabels.map((label, i) => (
          <div key={i} className="cal-month-label">{label ?? ''}</div>
        ))}
      </div>
      {/* Day rows with dow labels */}
      {dayRows.map((row, r) => (
        <div key={r} className="cal-row">
          <div className="cal-dow-label">{DOW_LABELS[r]}</div>
          {row}
        </div>
      ))}
      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-text">学習なし</span>
        <div className="cal-legend-swatch" style={{ background: 'var(--bg-secondary)' }} />
        <div className="cal-legend-swatch" style={{ background: '#DDE4F7' }} />
        <div className="cal-legend-swatch" style={{ background: '#B6C3E8' }} />
        <div className="cal-legend-swatch" style={{ background: 'var(--brand-mid)' }} />
        <div className="cal-legend-swatch" style={{ background: 'var(--brand)' }} />
        <span className="cal-legend-text">多い</span>
      </div>
    </div>
  )
}

function CategoryProgress({ completedSet }: { completedSet: Set<string> }) {
  return (
    <>
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
    </>
  )
}

export function ProfileScreen(props: ProfileScreenProps) {
  const isDesktop = useIsDesktop()
  const data = useProfileData()
  return isDesktop ? <ProfileDesktop {...props} data={data} /> : <ProfileMobile {...props} data={data} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/profile.html)
// ============================================================
function ProfileMobile({
  userName,
  data,
}: ProfileScreenProps & { data: DerivedData }) {
  const { streak, points, deviation, topPct, rankFill, completedSet, level, levelXp, levelPct, activityGrid, studyHours } = data

  return (
    <div className="stack-lg">
      <h1 style={{ fontSize: 28 }}>Profile</h1>

      <section className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar"><UserIcon width={22} height={22} /></div>
          <div>
            <div className="profile-hero-name">{userName}</div>
            <div className="profile-hero-level">Lv.{level} · 見習い探偵</div>
          </div>
        </div>
        <div className="row-between" style={{ position: 'relative' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            LEVEL PROGRESS
          </span>
          <span
            className="mono"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}
          >
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
          <div className="stat-icon"><FlameIcon width={20} height={20} /></div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">連続日数</div>
        </div>
        <div className="stat">
          <div className="stat-icon"><StarIcon width={20} height={20} /></div>
          <div className="stat-value">{points.toLocaleString()}</div>
          <div className="stat-label">ポイント</div>
        </div>
        <div className="stat">
          <div className="stat-icon"><ClockIcon width={20} height={20} /></div>
          <div className="stat-value">{studyHours}</div>
          <div className="stat-label">学習時間</div>
        </div>
      </div>

      <section className="section">
        <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>Activity</h2>
        <div className="calendar-card">
          <ActivityCalendar grid={activityGrid} />
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>Category progress</h2>
        <div className="card">
          <CategoryProgress completedSet={completedSet} />
        </div>
      </section>
    </div>
  )
}

// ============================================================
// Desktop layout (matches mocks/logic-v3/desktop/profile.html)
// ============================================================
function ProfileDesktop({
  userName,
  data,
}: ProfileScreenProps & { data: DerivedData }) {
  const { streak, completed, studyHours, points, deviation, topPct, rankFill, completedSet, level, levelXp, levelPct, activityGrid } = data

  return (
    <>
      <div className="page-head">
        <h1>Profile</h1>
      </div>

      <div className="top-grid">
        <section className="profile-hero">
          <div className="profile-hero-inner">
            <div className="profile-avatar"><UserIcon width={22} height={22} /></div>
            <div>
              <div className="profile-hero-name">{userName}</div>
              <div className="profile-hero-level">Lv.{level} · 見習い探偵</div>
            </div>
          </div>
          <div className="row-between" style={{ position: 'relative', marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              LEVEL PROGRESS
            </span>
            <span
              className="mono"
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}
            >
              {levelXp} / 1,000 XP
            </span>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              height: 10,
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
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

        <div className="stats-stack">
          {topPct != null && (
            <div className="rank-card-big">
              <div className="rk-eyebrow">NATIONAL RANKING</div>
              <div className="rank-row-big">
                <div className="rank-num-big">
                  {topPct}
                  <span>%</span>
                </div>
                <div>
                  <div className="rank-detail-label">偏差値 · Deviation</div>
                  <div className="rank-detail-val">{deviation!.toFixed(1)}</div>
                  <div className="rank-detail-sub">全国ランキング</div>
                </div>
              </div>
              <div className="rank-bar-wrap-big">
                <div className="rank-bar-fill-big" style={{ width: `${rankFill}%` }} />
              </div>
            </div>
          )}
          <div className="stat-pill-large">
            <div className="icon-box"><StarIcon width={18} height={18} /></div>
            <div>
              <div className="stat-value">{points.toLocaleString()}</div>
              <div className="stat-label">ポイント</div>
            </div>
          </div>
        </div>
      </div>

      <div className="top-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
        <div className="stat-pill-large">
          <div className="icon-box"><FlameIcon width={18} height={18} /></div>
          <div>
            <div className="stat-value">{streak}</div>
            <div className="stat-label">連続学習日数</div>
          </div>
        </div>
        <div className="stat-pill-large">
          <div className="icon-box"><CheckIcon width={18} height={18} /></div>
          <div>
            <div className="stat-value">{completed}</div>
            <div className="stat-label">完了レッスン</div>
          </div>
        </div>
        <div className="stat-pill-large">
          <div className="icon-box"><ClockIcon width={18} height={18} /></div>
          <div>
            <div className="stat-value">{studyHours}</div>
            <div className="stat-label">総学習時間</div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <section className="section-card">
          <h2>Activity · 12 weeks</h2>
          <ActivityCalendar grid={activityGrid} />
        </section>

        <section className="section-card">
          <h2>Category progress</h2>
          <CategoryProgress completedSet={completedSet} />
        </section>
      </div>
    </>
  )
}
