import { useMemo, type ReactNode } from 'react'
import {
  getCompletedCount,
  getCompletedLessons,
  getStreak,
  getStudyHours,
} from '../stats'
import { loadPlacementResult } from '../placementData'
import { UserIcon, FlameIcon, StarIcon, CheckIcon, ClockIcon, ChevronRightIcon } from '../icons'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { deviationToTopPercent, getPoints, getLevelTitle } from './homeHelpers'
import { getLocale } from '../i18n'
import { t } from '../i18n'

interface ProfileScreenProps {
  userName: string
  onOpenStreak: () => void
  onOpenSettings: () => void
  onOpenCompleted: () => void
  onOpenStudyTime: () => void
  onOpenRank: () => void
  onOpenRanking: () => void
}

const CAT_ROWS: { name: string; lessonIds: number[] }[] = [
  { name: t('home.category.fermi'), lessonIds: [22, 23, 24, 25] },
  { name: t('home.category.logic'), lessonIds: [20, 21, 26, 27] },
  { name: t('home.category.case'),  lessonIds: [28, 29, 35, 36] },
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
  return { streak, completed, studyHours, points, deviation, topPct, rankFill, completedSet, xp, level, levelXp, levelPct }
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

function ProfileNavRow({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: 'var(--s-4)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        gap: 'var(--s-3)',
      }}
    >
      <span style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{value}</span>}
      <ChevronRightIcon width={16} height={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
    </button>
  )
}

function StatTile({
  icon, value, label, onClick, tileColor,
}: { icon: ReactNode; value: string | number; label: string; onClick?: () => void; tileColor?: string }) {
  return (
    <div
      className="stat"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        background: tileColor ? `${tileColor}18` : undefined,
      }}
    >
      <div className="stat-icon" style={{ color: tileColor }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {onClick && (
        <ChevronRightIcon
          width={12} height={12}
          style={{ position: 'absolute', bottom: 8, right: 8, color: 'var(--text-faint)' }}
        />
      )}
    </div>
  )
}

export function ProfileScreen(props: ProfileScreenProps) {
  const isDesktop = useIsDesktop()
  const data = useProfileData()
  const levelTitle = getLevelTitle(data.xp, getLocale())
  return isDesktop
    ? <ProfileDesktop {...props} data={data} levelTitle={levelTitle} />
    : <ProfileMobile {...props} data={data} levelTitle={levelTitle} />
}

// ============================================================
// Mobile layout
// ============================================================
function ProfileMobile({
  userName,
  data,
  levelTitle,
  onOpenStreak,
  onOpenSettings,
  onOpenCompleted,
  onOpenStudyTime,
  onOpenRank,
  onOpenRanking,
}: ProfileScreenProps & { data: DerivedData; levelTitle: string }) {
  const { streak, completed, points, deviation, topPct, rankFill, completedSet, level, levelXp, levelPct, studyHours } = data

  return (
    <div className="stack-lg">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 28 }}>{t('profile.title')}</h1>
        <button
          onClick={onOpenSettings}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--s-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          aria-label={t('settings.title')}
        >
          {/* gear icon inline */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <button className="profile-hero" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', padding: 0, textAlign: 'left', width: '100%', display: 'block' }}>
        <div className="profile-hero-inner">
          <div className="profile-avatar"><UserIcon width={22} height={22} /></div>
          <div>
            <div className="profile-hero-name">{userName}</div>
            <div className="profile-hero-level">Lv.{level} · {levelTitle}</div>
          </div>
        </div>
        <div className="row-between" style={{ position: 'relative' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' }}>
            {t('home.levelProgress')}
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {levelXp} / 1,000 XP
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.14)', height: 8, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: 8 }}>
          <div style={{ background: 'var(--brand-light)', height: '100%', width: `${levelPct}%`, borderRadius: 'var(--radius-full)' }} />
        </div>
      </button>

      {topPct != null && (
        <button className="rank-card" onClick={onOpenRanking} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
          <div className="rank-eyebrow">{t('home.nationalRanking')} · {t('ranking.deviationLabel')} {deviation!.toFixed(1)}</div>
          <div className="rank-row">
            <div className="rank-num">{topPct}<span className="rank-num-unit">%</span></div>
            <div>
              <div className="rank-meta-top">{t('ranking.topPercent', { pct: topPct })}</div>
              <div className="rank-meta-sub">{t('profile.nationalRankingCard')}</div>
            </div>
          </div>
          <div className="rank-bar">
            <div className="rank-bar-fill" style={{ width: `${rankFill}%` }} />
          </div>
        </button>
      )}

      {/* Points tappable */}
      <button className="card" onClick={onOpenRank} style={{ cursor: 'pointer', border: '1px solid rgba(234,179,8,0.3)', background: 'var(--xp-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--s-3) var(--s-4)', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', textAlign: 'left', width: '100%' }}>
        <StarIcon width={18} height={18} style={{ color: 'var(--xp-icon)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--xp-text)' }}>{t('profile.points')}</div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--xp-text)', letterSpacing: '-0.02em' }}>{points.toLocaleString()}</div>
        </div>
        <ChevronRightIcon width={14} height={14} style={{ color: 'var(--xp-text)', opacity: 0.5 }} />
      </button>

      <div className="stats-grid">
        <StatTile icon={<FlameIcon width={20} height={20} />} value={streak}     label={t('profile.statStreak')}   onClick={onOpenStreak}    tileColor="var(--streak-icon)" />
        <StatTile icon={<CheckIcon width={20} height={20} />} value={completed}  label={t('profile.statCompleted')} onClick={onOpenCompleted} tileColor="var(--lesson-icon)" />
        <StatTile icon={<ClockIcon width={20} height={20} />} value={studyHours} label={t('profile.statStudyTime')} onClick={onOpenStudyTime} tileColor="var(--time-icon)" />
      </div>

      <section className="section">
        <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>{t('profile.categoryProgress')}</h2>
        <div className="card">
          <CategoryProgress completedSet={completedSet} />
        </div>
      </section>
    </div>
  )
}

// ============================================================
// Desktop layout
// ============================================================
function ProfileDesktop({
  userName,
  data,
  levelTitle,
  onOpenStreak,
  onOpenSettings,
  onOpenCompleted,
  onOpenStudyTime,
  onOpenRank,
  onOpenRanking,
}: ProfileScreenProps & { data: DerivedData; levelTitle: string }) {
  const { streak, completed, studyHours, points, deviation, topPct, rankFill, completedSet, level, levelXp, levelPct } = data

  return (
    <>
      <div className="page-head">
        <h1>{t('profile.title')}</h1>
        <button
          onClick={onOpenSettings}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: '6px 14px', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}
          aria-label={t('settings.title')}
        >
          {/* gear icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {t('settings.title')}
        </button>
      </div>

      <div className="top-grid">
        <button className="profile-hero" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
          <div className="profile-hero-inner">
            <div className="profile-avatar"><UserIcon width={22} height={22} /></div>
            <div>
              <div className="profile-hero-name">{userName}</div>
              <div className="profile-hero-level">Lv.{level} · {levelTitle}</div>
            </div>
          </div>
          <div className="row-between" style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' }}>
              {t('home.levelProgress')}
            </span>
            <span className="mono" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              {levelXp} / 1,000 XP
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', height: 10, borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--brand-light)', height: '100%', width: `${levelPct}%`, borderRadius: 'var(--radius-full)' }} />
          </div>
        </button>

        <div className="stats-stack">
          {topPct != null && (
            <button className="rank-card-big" onClick={onOpenRanking} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
              <div className="rk-eyebrow">{t('home.nationalRanking')}</div>
              <div className="rank-row-big">
                <div className="rank-num-big">{topPct}<span>%</span></div>
                <div>
                  <div className="rank-detail-label">{t('ranking.deviationLabel')} · Deviation</div>
                  <div className="rank-detail-val">{deviation!.toFixed(1)}</div>
                  <div className="rank-detail-sub">{t('profile.nationalRankingCard')}</div>
                </div>
              </div>
              <div className="rank-bar-wrap-big">
                <div className="rank-bar-fill-big" style={{ width: `${rankFill}%` }} />
              </div>
            </button>
          )}
          <button
            className="stat-pill-large"
            onClick={onOpenRank}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--s-4) var(--s-5)', textAlign: 'left', width: '100%' }}
          >
            <div className="icon-box"><StarIcon width={18} height={18} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-value">{points.toLocaleString()}</div>
              <div className="stat-label">{t('profile.points')}</div>
            </div>
            <ChevronRightIcon width={14} height={14} style={{ color: 'var(--text-faint)' }} />
          </button>
        </div>
      </div>

      <div className="top-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
        <button
          className="stat-pill-large"
          onClick={onOpenStreak}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--s-4) var(--s-5)', textAlign: 'left', width: '100%' }}
        >
          <div className="icon-box"><FlameIcon width={18} height={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-value">{streak}</div>
            <div className="stat-label">{t('profile.statStreakDays')}</div>
          </div>
          <ChevronRightIcon width={14} height={14} style={{ color: 'var(--text-faint)' }} />
        </button>
        <button
          className="stat-pill-large"
          onClick={onOpenCompleted}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--s-4) var(--s-5)', textAlign: 'left', width: '100%' }}
        >
          <div className="icon-box"><CheckIcon width={18} height={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-value">{completed}</div>
            <div className="stat-label">{t('profile.statCompleted')}</div>
          </div>
          <ChevronRightIcon width={14} height={14} style={{ color: 'var(--text-faint)' }} />
        </button>
        <button
          className="stat-pill-large"
          onClick={onOpenStudyTime}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--s-4) var(--s-5)', textAlign: 'left', width: '100%' }}
        >
          <div className="icon-box"><ClockIcon width={18} height={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-value">{studyHours}</div>
            <div className="stat-label">{t('profile.statTotalStudyTime')}</div>
          </div>
          <ChevronRightIcon width={14} height={14} style={{ color: 'var(--text-faint)' }} />
        </button>
      </div>

      <div className="bottom-grid">
        <section className="section-card">
          <h2>{t('profile.categoryProgress')}</h2>
          <CategoryProgress completedSet={completedSet} />
        </section>
        <section className="section-card">
          <h2>{t('settings.title')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <ProfileNavRow label={t('streak.title')} value={`${streak} ${t('streak.days')}`} onClick={onOpenStreak} />
            <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />
            <ProfileNavRow label={t('settings.title')} onClick={onOpenSettings} />
          </div>
        </section>
      </div>
    </>
  )
}
