import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { getStreak, getCompletedCount, getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementData'
import { ArrowRightIcon, BarChartIcon, BrainIcon, BriefcaseIcon, CheckIcon, FlameIcon, StarIcon, TrendingUpIcon, ZapIcon } from '../icons'
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
  onOpenRoleplay: () => void
  onOpenFlashcards: () => void
  onOpenPricing: () => void
  onOpenAIGen: () => void
}

type Category = {
  id: 'fermi' | 'logic' | 'case' | 'pm'
  icon: ReactNode
  name: string
  lessonIds: number[]
}

const ALL_CATEGORIES: (Category & { adminOnly?: boolean })[] = [
  { id: 'fermi', icon: <BarChartIcon width={22} height={22} />,  name: t('home.category.fermi'), lessonIds: [22, 23, 24, 25] },
  { id: 'logic', icon: <BrainIcon width={22} height={22} />,     name: t('home.category.logic'), lessonIds: [20, 21, 26, 27] },
  { id: 'case',  icon: <BriefcaseIcon width={22} height={22} />, name: t('home.category.case'),  lessonIds: [28, 29, 35, 36] },
]

const CAT_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  fermi: { bg: '#FFF7ED', accent: '#F59E0B', text: '#92400E' },
  logic: { bg: '#EEF2FE', accent: '#3D5FC4', text: '#1E3A8A' },
  case:  { bg: '#F0FDF4', accent: '#10B981', text: '#065F46' },
}

const CASE_LESSONS = [
  { id: 28, title: 'ケース面接入門',       sub: 'フレームワーク・仮説思考' },
  { id: 29, title: 'プロフィタビリティ',    sub: '利益構造の分解と改善' },
  { id: 35, title: '新市場参入ケース',      sub: '市場魅力度・競合分析' },
  { id: 36, title: 'M&Aケース',            sub: 'シナジー・バリュエーション' },
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
  onOpenRanking: _onOpenRanking,
  onOpenStreak,
  onOpenRoleplay,
  onOpenFlashcards,
  onOpenPricing,
  onOpenAIGen,
  data,
  levelTitle,
}: HomeScreenProps & { data: DerivedData; levelTitle: string }) {
  const {
    streak, streakState, completedSet, points, deviation, topPct, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp,
  } = data

  return (
    <div className="stack-lg">

      {/* ── ヘッダー ── */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-3)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>
            {eyebrow}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {greeting}{t('home.greetingSep')}{userName}
          </h1>
          <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
            {t('home.subtitle')}
          </p>
        </div>
        {/* Streak badge — flame gradient */}
        <button onClick={onOpenStreak} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'linear-gradient(160deg, #FF6B35 0%, #F59E0B 100%)',
          borderRadius: 18, padding: '10px 14px', border: 'none',
          cursor: 'pointer', flexShrink: 0, marginTop: 8,
          boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
        }}>
          <FlameIcon width={18} height={18} style={{ color: '#fff' }} />
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginTop: 2, fontFamily: 'var(--font-display)' }}>{streak}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>DAY</span>
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

      {/* ── 今日のフィーチャー ── */}
      <section style={{
        background: 'linear-gradient(145deg, #0D1B3E 0%, #1E2D5C 100%)',
        borderRadius: 28, padding: '24px 22px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(158,179,240,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(158,179,240,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        {/* glow */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(61,95,196,0.45) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(158,179,240,0.18)', borderRadius: 999,
            padding: '4px 10px', marginBottom: 14,
          }}>
            <BarChartIcon width={10} height={10} style={{ color: 'var(--brand-light)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-light)' }}>
              {t('home.todayRecommended')} · 5 MIN
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800,
            color: '#fff', lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 22,
          }}>
            {t('home.fermiQuestion')}
          </h2>
          <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
            {t('home.startLesson')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      </section>

      {/* ── 統計カード ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            {
              onClick: onOpenRank,
              icon: <StarIcon width={15} height={15} style={{ color: 'var(--xp-icon)' }} />,
              value: points.toLocaleString(),
              label: t('profile.points'),
            },
            deviation != null ? {
              onClick: onOpenDeviation,
              icon: <TrendingUpIcon width={15} height={15} style={{ color: 'var(--brand)' }} />,
              value: deviation.toFixed(1),
              label: t('ranking.deviationLabel'),
            } : {
              onClick: onOpenRank,
              icon: <BarChartIcon width={15} height={15} style={{ color: 'var(--brand)' }} />,
              value: xp.toLocaleString(),
              label: 'XP',
            },
            {
              onClick: onOpenRank,
              icon: <div style={{ width: 15, height: 15, background: 'var(--brand)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff' }}>{level}</div>,
              value: levelTitle.length > 5 ? `Lv.${level}` : levelTitle,
              label: 'レベル',
            },
          ].map((stat, i) => (
            <button key={i} onClick={stat.onClick} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '16px 8px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              {stat.icon}
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 偏差値カード（独立表示） */}
      {deviation != null && (
        <button onClick={onOpenDeviation} style={{
          background: 'linear-gradient(145deg, #0D1B3E 0%, #1E2D5C 100%)',
          borderRadius: 20, padding: '18px 20px',
          width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(30,45,92,0.25)',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(61,95,196,0.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-light)', marginBottom: 8 }}>
              {t('ranking.deviationLabel')} · {t('home.nationalRanking')}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {deviation.toFixed(1)}
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                  {topPct != null ? t('ranking.topPercent', { pct: topPct }) : ''}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  {t('profile.nationalRankingCard')}
                </div>
              </div>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${rankFill}%`, background: 'linear-gradient(90deg, var(--brand-light), #fff)', borderRadius: 99 }} />
            </div>
          </div>
        </button>
      )}

      {/* ── ケース面接 ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981', marginBottom: 2 }}>CASE INTERVIEW</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('home.category.case')}</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CASE_LESSONS.map((lesson) => {
            const done = completedSet.has(`lesson-${lesson.id}`)
            return (
              <button key={lesson.id} onClick={() => onOpenLesson(lesson.id)} style={{
                background: done ? '#F0FDF4' : 'var(--bg-card)',
                border: `1.5px solid ${done ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                borderRadius: 18, padding: '14px 12px',
                cursor: 'pointer', textAlign: 'left', position: 'relative',
              }}>
                {done && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 20, height: 20, borderRadius: '50%', background: '#10B981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckIcon width={11} height={11} style={{ color: '#fff' }} />
                  </div>
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: 12, marginBottom: 10,
                  background: done ? 'rgba(16,185,129,0.15)' : '#EEF2FE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BriefcaseIcon width={18} height={18} style={{ color: done ? '#10B981' : 'var(--brand)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: done ? '#065F46' : 'var(--text)', lineHeight: 1.35, marginBottom: 4 }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lesson.sub}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── トレーニングメニュー ── */}
      <section>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>TRAINING</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>練習メニュー</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'ロールプレイ', sub: 'AI対話練習', emoji: '💬', onClick: onOpenRoleplay, bg: '#EEF2FE', color: '#1E3A8A' },
            { label: 'フラッシュカード', sub: 'SM-2復習', emoji: '🃏', onClick: onOpenFlashcards, bg: '#F0FDF4', color: '#065F46' },
            { label: 'AI問題生成', sub: 'プレミアム', emoji: '✨', onClick: onOpenAIGen, bg: '#F5F3FF', color: '#5B21B6', locked: false, onLocked: onOpenPricing },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} style={{
              background: item.bg, border: 'none', borderRadius: 16,
              padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
              position: 'relative',
            }}>
              {'locked' in item && item.locked && (
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 14 }}>🔒</div>
              )}
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: 10, color: item.color, opacity: 0.65, marginTop: 2 }}>{item.sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── カテゴリ ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('home.categories')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {CATEGORIES.map((c) => {
            const done = c.lessonIds.filter((id) => completedSet.has(`lesson-${id}`)).length
            const total = c.lessonIds.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const col = CAT_COLORS[c.id] ?? { bg: '#F5F5F5', accent: '#6B7280', text: '#374151' }
            return (
              <button key={c.id} onClick={() => {
                if (c.lessonIds.length > 0) onOpenLesson(c.lessonIds[0])
                else onOpenCategory(c.id)
              }} style={{
                background: col.bg, border: 'none',
                borderRadius: 18, padding: '14px 12px',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ marginBottom: 10, color: col.accent }}>{c.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: col.text, lineHeight: 1.3, marginBottom: 10 }}>{c.name}</div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: col.accent, borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: col.text, opacity: 0.7, marginTop: 5, fontWeight: 700 }}>{done}/{total}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── レベル進捗 ── */}
      <button onClick={onOpenRank} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '16px 18px',
        width: '100%', textAlign: 'left', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              {t('home.levelProgress')}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
              Lv.{level} · {levelTitle}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{levelXp} / 1,000</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${levelPct}%`,
            background: 'linear-gradient(90deg, var(--brand) 0%, #6B85D6 100%)',
            borderRadius: 99,
          }} />
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
  onOpenRoleplay,
  onOpenFlashcards,
  onOpenPricing: _onOpenPricing,
  onOpenAIGen,
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

      {/* ── トレーニングメニュー（デスクトップ） ── */}
      <section>
        <div className="section-head">
          <h2>練習メニュー</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'ロールプレイ', sub: 'AI対話練習', emoji: '💬', onClick: onOpenRoleplay, bg: '#EEF2FE', color: '#1E3A8A' },
            { label: 'フラッシュカード', sub: 'SM-2復習', emoji: '🃏', onClick: onOpenFlashcards, bg: '#F0FDF4', color: '#065F46' },
            { label: 'AI問題生成', sub: 'プレミアム', emoji: '✨', onClick: onOpenAIGen, bg: '#F5F3FF', color: '#5B21B6' },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} style={{
              background: item.bg, border: 'none', borderRadius: 16,
              padding: '20px', cursor: 'pointer', textAlign: 'left',
              transition: 'transform 120ms ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color, letterSpacing: '-0.01em' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: item.color, opacity: 0.65, marginTop: 4 }}>{item.sub}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
