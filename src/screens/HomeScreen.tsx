import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { getStreak, getCompletedCount, getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementData'
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
  getLevelTitle,
} from './homeHelpers'
import { getLocale, t } from '../i18n'

interface HomeScreenProps {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory: (category: 'fermi' | 'logic' | 'case' | 'pm') => void
  onOpenRank: () => void
  onOpenDeviation: () => void
  onOpenRanking: () => void
  onOpenStreak: () => void
}

type Category = {
  id: 'fermi' | 'logic' | 'case' | 'pm'
  icon: ReactNode
  name: string
  lessonIds: number[]
}

const ALL_CATEGORIES: (Category & { adminOnly?: boolean })[] = [
  { id: 'fermi', icon: <BarChartIcon width={20} height={20} />,   name: t('home.category.fermi'), lessonIds: [22, 23, 24, 25] },
  { id: 'logic', icon: <BrainIcon width={20} height={20} />,      name: t('home.category.logic'), lessonIds: [20, 21, 26, 27] },
  { id: 'case',  icon: <BriefcaseIcon width={20} height={20} />,  name: t('home.category.case'),  lessonIds: [28, 29] },
  { id: 'pm',    icon: <BookOpenIcon width={20} height={20} />,   name: t('home.category.pm'),    lessonIds: [30, 31, 32, 33, 34], adminOnly: true },
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
  const { eyebrow, greeting } = timeBasedGreeting(getLocale())
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
  const levelTitle = getLevelTitle(data.xp, getLocale())
  return isDesktop
    ? <HomeDesktop {...props} data={data} levelTitle={levelTitle} />
    : <HomeMobile {...props} data={data} levelTitle={levelTitle} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/home.html)
// ============================================================
function HomeMobile({
  userName,
  onOpenLesson,
  onOpenCategory,
  onOpenRank,
  onOpenDeviation,
  onOpenRanking,
  onOpenStreak,
  data,
  levelTitle,
}: HomeScreenProps & { data: DerivedData; levelTitle: string }) {
  const {
    streak, streakState, completedSet, points, deviation, topPct,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp,
  } = data

  return (
    <div className="stack-lg">

      {/* ── Zone A: Compact header ── */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-3)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginTop: 4, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {greeting}{t('home.greetingSep')}{userName}
          </h1>
          <p style={{ marginTop: 4, fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
            {t('home.subtitle')}
          </p>
        </div>
        {/* Streak pill */}
        <button
          onClick={onOpenStreak}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--streak-bg)', color: 'var(--streak-text)',
            border: 'none', borderRadius: 'var(--radius-full)',
            padding: '8px 14px', fontSize: 'var(--font-sm)', fontWeight: 700,
            cursor: 'pointer', flexShrink: 0, marginTop: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <FlameIcon width={15} height={15} style={{ color: 'var(--streak-icon)' }} />
          <span>{streak}</span>
          <span style={{ fontWeight: 500, color: 'var(--streak-text)', opacity: 0.75 }}>
            {t('home.dayStreakLabel')}
          </span>
        </button>
      </header>

      {/* Streak at-risk banner */}
      {streakState === 'at-risk' && (
        <div className="recovery-banner">
          <div className="recovery-icon"><ZapIcon width={16} height={16} /></div>
          <div className="recovery-text">
            <b>{t('home.streakProtectionLabel')}</b> · {t('home.streakRecovery', { hours: recovery.hours, minutes: recovery.minutes })}
          </div>
        </div>
      )}

      {/* ── Zone B: Today's featured (visual hero) ── */}
      <section style={{
        background: 'var(--bg-hero)',
        borderRadius: 'var(--radius-2xl)',
        padding: '28px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(158,179,240,0.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          fontSize: 'var(--font-xs)', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--brand-light)', marginBottom: 10,
        }}>
          {t('home.todayRecommended')} · FERMI · 5 MIN
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-xl)', fontWeight: 800,
          color: '#fff', lineHeight: 1.3,
          letterSpacing: '-0.02em', marginBottom: 24,
        }}>
          {t('home.fermiQuestion')}
        </h2>
        <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
          {t('home.startLesson')}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </section>

      {/* ── Zone C: Stats chips ── */}
      <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
        <button onClick={onOpenRank} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)', padding: '6px 12px',
          fontSize: 'var(--font-sm)', fontWeight: 600,
          color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          <StarIcon width={13} height={13} style={{ color: 'var(--xp-icon)' }} />
          {points.toLocaleString()} pt
        </button>
        {deviation != null ? (
          <button onClick={onOpenDeviation} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '6px 12px',
            fontSize: 'var(--font-sm)', fontWeight: 600,
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            <TrendingUpIcon width={13} height={13} style={{ color: 'var(--brand)' }} />
            {t('ranking.deviationLabel')} {deviation.toFixed(1)}
          </button>
        ) : (
          <button onClick={onOpenRank} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '6px 12px',
            fontSize: 'var(--font-sm)', fontWeight: 600,
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            <BarChartIcon width={13} height={13} style={{ color: 'var(--brand)' }} />
            {xp.toLocaleString()} XP
          </button>
        )}
        <button onClick={onOpenRank} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)', padding: '6px 12px',
          fontSize: 'var(--font-sm)', fontWeight: 600,
          color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          Lv.{level} · {levelTitle}
        </button>
      </div>

      {/* Rank banner (compact, only when ranking exists) */}
      {topPct != null && (
        <button onClick={onOpenRanking} style={{
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
          borderRadius: 'var(--radius-xl)', padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 'var(--s-4)',
          width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32, fontWeight: 900,
            color: '#fff', lineHeight: 1, flexShrink: 0,
          }}>
            {topPct}<span style={{ fontSize: 15, fontWeight: 600 }}>%</span>
          </div>
          <div>
            <div style={{
              fontSize: 'var(--font-xs)', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)', marginBottom: 2,
            }}>
              {t('home.nationalRanking')}
            </div>
            <div style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: '#fff' }}>
              {t('ranking.topPercent', { pct: topPct })}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-sm)', color: 'rgba(255,255,255,0.65)' }}>
              {t('ranking.deviationLabel')} {deviation!.toFixed(1)}
            </div>
          </div>
        </button>
      )}

      {/* Categories */}
      <section className="section">
        <div className="section-head">
          <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>{t('home.categories')}</h2>
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

      {/* Level progress (bottom, secondary) */}
      <button onClick={onOpenRank} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--s-4)',
        width: '100%', textAlign: 'left', cursor: 'pointer',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('home.levelProgress')} · Lv.{level} · {levelTitle}
          </span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {levelXp} / 1,000 XP
          </span>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${levelPct}%` }} />
        </div>
      </button>

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
  onOpenRank,
  onOpenDeviation,
  onOpenRanking,
  onOpenStreak: _onOpenStreak,
  data,
  levelTitle,
}: HomeScreenProps & { data: DerivedData; levelTitle: string }) {
  const {
    streak, streakState, completedSet, points, deviation, topPct, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekPct,
  } = data

  return (
    <>
      <header className="hero-greeting">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{greeting}{t('home.greetingSep')}{userName}</h1>
        <p className="hero-greeting-sub">{t('home.subtitleLong')}</p>
      </header>

      <div className="hero-grid">
        <section className="streak-card">
          <div className="streak-top">
            <div className="streak-icon"><FlameIcon width={24} height={24} /></div>
            <div>
              <div className="streak-num">{streak}</div>
              <div className="streak-label">{t('home.dayStreakLabel')}</div>
            </div>
          </div>
          <div className="streak-bar-wrap">
            <div className="streak-bar-fill" style={{ width: `${weekPct}%` }} />
          </div>
          <div className="streak-meta">
            <span>{t('home.thisWeek')}</span>
            <span>{t('home.weekProgress', { n: Math.min(7, streak) })}</span>
          </div>
          {streakState === 'at-risk' && (
            <div className="recovery-banner">
              <div className="recovery-icon"><ZapIcon width={16} height={16} /></div>
              <div className="recovery-text">
                <b>{t('home.streakProtectionLabel')}</b> · {t('home.streakRecovery', { hours: recovery.hours, minutes: recovery.minutes })}
              </div>
            </div>
          )}
        </section>

        <section className="featured-card">
          <div>
            <span className="featured-tag">{t('home.todaysChallenge')}</span>
          </div>
          <div className="featured-q">
            {t('home.fermiQuestion')}
          </div>
          <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
            {t('home.startLesson')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </section>
      </div>

      <div className="stats-row">
        <button className="stat-pill" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
          <div className="icon-box"><StarIcon width={18} height={18} /></div>
          <div>
            <div className="lbl">{t('profile.points')}</div>
            <div className="val">{points.toLocaleString()}</div>
            <div className="delta">{t('home.pointsToday', { n: Math.max(0, points % 200) })}</div>
          </div>
        </button>
        {deviation != null ? (
          <button className="stat-pill" onClick={onOpenDeviation} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <div className="icon-box"><TrendingUpIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">{t('ranking.deviationLabel')}</div>
              <div className="val">{deviation.toFixed(1)}</div>
              <div className="delta">{t('home.placementDone')}</div>
            </div>
          </button>
        ) : (
          <button className="stat-pill" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <div className="icon-box"><BarChartIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">XP</div>
              <div className="val">{xp.toLocaleString()}</div>
              <div className="delta">{t('home.totalEarned')}</div>
            </div>
          </button>
        )}
        {topPct != null ? (
          <button className="rank-card" onClick={onOpenRanking} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
            <div className="rank-eyebrow">{t('home.nationalRanking')}</div>
            <div className="rank-row">
              <div className="rank-num">
                {topPct}
                <span className="rank-num-unit">%</span>
              </div>
              <div>
                <div className="rank-meta-top">{t('ranking.topPercent', { pct: topPct })}</div>
                <div className="rank-meta-sub">{t('ranking.deviationLabel')} {deviation!.toFixed(1)}</div>
              </div>
            </div>
            <div className="rank-bar">
              <div className="rank-bar-fill" style={{ width: `${rankFill}%` }} />
            </div>
          </button>
        ) : (
          <button className="rank-card" onClick={onOpenRanking} style={{ cursor: 'pointer', opacity: 0.6, border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
            <div className="rank-eyebrow">{t('home.nationalRanking')}</div>
            <div className="rank-meta-top">{t('home.placementIncomplete')}</div>
          </button>
        )}
      </div>

      <button className="level-section" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">{t('home.levelProgress')}</div>
          <div className="level-name">Lv.{level} · {levelTitle}</div>
          <div className="progress" style={{ marginTop: 10, maxWidth: 600 }}>
            <div className="progress-fill" style={{ width: `${levelPct}%` }} />
          </div>
        </div>
        <div className="level-xp">{levelXp} / 1,000 XP</div>
      </button>

      <section>
        <div className="section-head">
          <h2>{t('home.categories')}</h2>
          <button className="link-btn" onClick={() => onOpenCategory('logic')}>{t('home.viewAll')}</button>
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
