import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { getStreak, getCompletedCount, getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementTest'
import { ArrowRightIcon, BarChartIcon, BrainIcon, BriefcaseIcon, BookOpenIcon, FlameIcon, StarIcon, TrendingUpIcon, ZapIcon } from '../icons'
import { Button } from '../components/Button'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { isAdmin } from '../admin'
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
  icon: ReactNode
  name: string
  lessonIds: number[]
}

const ALL_CATEGORIES: (Category & { adminOnly?: boolean })[] = [
  { id: 'fermi', icon: <BarChartIcon width={20} height={20} />,   name: 'フェルミ推定', lessonIds: [22, 23, 24, 25] },
  { id: 'logic', icon: <BrainIcon width={20} height={20} />,      name: '論理パズル',   lessonIds: [20, 21, 26, 27] },
  { id: 'case',  icon: <BriefcaseIcon width={20} height={20} />,  name: 'ケース面接',   lessonIds: [28, 29] },
  { id: 'pm',    icon: <BookOpenIcon width={20} height={20} />,   name: 'PM 入門',      lessonIds: [30, 31, 32, 33, 34], adminOnly: true },
]

const CATEGORIES = ALL_CATEGORIES.filter((c) => isAdmin() || !c.adminOnly)

interface DerivedData {
  streak: number
  streakState: 'none' | 'active' | 'at-risk'
  completed: number
  completedSet: Set<string>
  points: number
  deviation: number | null
  topPct: number | null
  rankFill: number
  eyebrow: string
  greeting: string
  recovery: { hours: number; minutes: number }
  level: number
  levelXp: number
  levelPct: number
  xp: number
  weekProgress: number
  weekPct: number
}

function useHomeData(): DerivedData {
  const streak = getStreak()
  const streakState = getStreakState()
  const completed = getCompletedCount()
  const completedSet = useMemo(() => new Set(getCompletedLessons()), [])
  const placement = loadPlacementResult()
  const points = getPoints()
  const deviation = placement?.deviation ?? null
  const topPct = deviation != null ? deviationToTopPercent(deviation) : null
  const rankFill = topPct != null ? Math.min(100, Math.max(10, 100 - topPct)) : 0
  const { eyebrow, greeting } = timeBasedGreeting()
  const recovery = hoursUntilMidnight()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1
  const levelXp = xp % 1000
  const levelPct = (levelXp / 1000) * 100
  const weekProgress = Math.min(7, streak)
  const weekPct = (weekProgress / 7) * 100
  return {
    streak, streakState, completed, completedSet, points, deviation, topPct, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekProgress, weekPct,
  }
}

export function HomeScreen(props: HomeScreenProps) {
  const isDesktop = useIsDesktop()
  const data = useHomeData()
  return isDesktop ? <HomeDesktop {...props} data={data} /> : <HomeMobile {...props} data={data} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/home.html)
// ============================================================
function HomeMobile({
  userName,
  onOpenLesson,
  onOpenCategory,
  data,
}: HomeScreenProps & { data: DerivedData }) {
  const {
    streak, streakState, completedSet, points, deviation, topPct, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekProgress, weekPct,
  } = data

  return (
    <div className="stack-lg">
      <header>
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: 34, marginTop: 6, letterSpacing: '-0.025em' }}>
          {greeting}、{userName}
        </h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>
          今日も一歩ずつ。
        </p>
      </header>

      <section className="streak-hero">
        <div className="streak-hero-top">
          <div className="streak-hero-icon"><FlameIcon width={24} height={24} /></div>
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
          <span>{weekProgress} / 7 days</span>
        </div>
        {streakState === 'at-risk' && (
          <div className="recovery-banner">
            <div className="recovery-icon"><ZapIcon width={16} height={16} /></div>
            <div className="recovery-text">
              <b>Streak protection active</b> · 今日中にレッスンを完了すれば連続日数を維持できます（残り {recovery.hours} 時間 {recovery.minutes} 分）
            </div>
          </div>
        )}
      </section>

      <section className="points-row">
        <div className="points-pill">
          <div className="points-pill-icon"><StarIcon width={18} height={18} /></div>
          <div>
            <div className="points-pill-label">Points</div>
            <div className="points-pill-value">{points.toLocaleString()}</div>
          </div>
        </div>
        {deviation != null ? (
          <div className="points-pill">
            <div className="points-pill-icon"><TrendingUpIcon width={18} height={18} /></div>
            <div>
              <div className="points-pill-label">偏差値</div>
              <div className="points-pill-value">{deviation.toFixed(1)}</div>
            </div>
          </div>
        ) : (
          <div className="points-pill">
            <div className="points-pill-icon"><BarChartIcon width={18} height={18} /></div>
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
          <h3 style={{ fontSize: 17 }}>Lv.{level} · 見習い探偵</h3>
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
                <div className="cat-tile-meta">{done} / {total}</div>
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

// ============================================================
// Desktop layout (matches mocks/logic-v3/desktop/home.html)
// ============================================================
function HomeDesktop({
  userName,
  onOpenLesson,
  onOpenCategory,
  data,
}: HomeScreenProps & { data: DerivedData }) {
  const {
    streak, streakState, completedSet, points, deviation, topPct, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekPct,
  } = data

  return (
    <>
      <header className="hero-greeting">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{greeting}、{userName}</h1>
        <p className="hero-greeting-sub">今日も一歩ずつ。昨日より少しだけ賢くなろう。</p>
      </header>

      <div className="hero-grid">
        <section className="streak-card">
          <div className="streak-top">
            <div className="streak-icon"><FlameIcon width={24} height={24} /></div>
            <div>
              <div className="streak-num">{streak}</div>
              <div className="streak-label">DAY STREAK</div>
            </div>
          </div>
          <div className="streak-bar-wrap">
            <div className="streak-bar-fill" style={{ width: `${weekPct}%` }} />
          </div>
          <div className="streak-meta">
            <span>This week</span>
            <span>{Math.min(7, streak)} / 7 days</span>
          </div>
          {streakState === 'at-risk' && (
            <div className="recovery-banner">
              <div className="recovery-icon"><ZapIcon width={16} height={16} /></div>
              <div className="recovery-text">
                <b>Streak protection active</b> · 今日中にレッスンを完了すれば連続日数を維持できます（残り {recovery.hours} 時間 {recovery.minutes} 分）
              </div>
            </div>
          )}
        </section>

        <section className="featured-card">
          <div>
            <span className="featured-tag">TODAY'S CHALLENGE · FERMI · 5 MIN</span>
          </div>
          <div className="featured-q">
            日本にある電柱の本数は<br />どれくらい?
          </div>
          <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
            Start lesson
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </section>
      </div>

      <div className="stats-row">
        <div className="stat-pill">
          <div className="icon-box"><StarIcon width={18} height={18} /></div>
          <div>
            <div className="lbl">Points</div>
            <div className="val">{points.toLocaleString()}</div>
            <div className="delta">+{Math.max(0, points % 200)} today</div>
          </div>
        </div>
        {deviation != null ? (
          <div className="stat-pill">
            <div className="icon-box"><TrendingUpIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">偏差値 · Deviation</div>
              <div className="val">{deviation.toFixed(1)}</div>
              <div className="delta">Placement</div>
            </div>
          </div>
        ) : (
          <div className="stat-pill">
            <div className="icon-box"><BarChartIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">XP</div>
              <div className="val">{xp.toLocaleString()}</div>
              <div className="delta">Total earned</div>
            </div>
          </div>
        )}
        {topPct != null ? (
          <div className="rank-card">
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
          </div>
        ) : (
          <div className="rank-card" style={{ opacity: 0.6 }}>
            <div className="rank-eyebrow">NATIONAL RANKING</div>
            <div className="rank-meta-top">プレースメントテスト未完了</div>
          </div>
        )}
      </div>

      <div className="level-section">
        <div>
          <div className="eyebrow">LEVEL PROGRESS</div>
          <div className="level-name">Lv.{level} · 見習い探偵</div>
          <div className="progress" style={{ marginTop: 10, maxWidth: 600 }}>
            <div className="progress-fill" style={{ width: `${levelPct}%` }} />
          </div>
        </div>
        <div className="level-xp">{levelXp} / 1,000 XP</div>
      </div>

      <section>
        <div className="section-head">
          <h2>Categories</h2>
          <button className="link-btn" onClick={() => onOpenCategory('logic')}>View all →</button>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => {
            const done = c.lessonIds.filter((id) => completedSet.has(`lesson-${id}`)).length
            const total = c.lessonIds.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button
                key={c.id}
                className="cat-card"
                onClick={() => {
                  if (c.lessonIds.length > 0) onOpenLesson(c.lessonIds[0])
                  else onOpenCategory(c.id)
                }}
              >
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-meta-row">
                  <span>{done} / {total}</span>
                  <span>{pct}%</span>
                </div>
                <div className="cat-progress">
                  <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
