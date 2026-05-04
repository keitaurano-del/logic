import { useState, useMemo } from 'react'
import { getStreak, getStudyDates, getTotalStudyDays } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, FlameIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

interface StreakScreenProps {
  onBack: () => void
}

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']
const DOW_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime()
    const cur = new Date(sorted[i]).getTime()
    const diff = cur - prev
    if (diff === 86400000) {
      current++
      if (current > longest) longest = current
    } else if (diff > 86400000) {
      current = 1
    }
    // same day: skip
  }
  return longest
}

export function StreakScreen({ onBack }: StreakScreenProps) {
  const today = new Date()
  const [monthOffset, setMonthOffset] = useState(0)

  const streak = getStreak()
  const studyDates = useMemo(() => new Set(getStudyDates()), [])
  const totalDays = getTotalStudyDays()
  const longestStreak = useMemo(() => getLongestStreak(getStudyDates()), [])
  const streakWeeks = streak > 0 ? Math.ceil(streak / 7) : 0

  // Compute displayed month
  const displayDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()

  const monthLabel = t('streak.month', { year: String(year), month: String(month + 1) })

  // Build calendar cells: 6 rows × 7 cols (Sun-Sat)
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().slice(0, 10)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isJa = t('nav.home') === 'ホーム'
  const dowLabels = isJa ? DOW_JA : DOW_EN

  return (
    <div className="stack">
      {/* Header */}
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('streak.title')}</div>
      </div>

      {/* Flame + streak count */}
      <div style={{ textAlign: 'center', padding: 'var(--s-5) 0 var(--s-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-4)' }}>
          <span style={{ color: 'var(--brand)', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameIcon width={40} height={40} />
          </span>
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--brand)' }}>
          {streak}
        </div>
        <div style={{ fontSize: 18, color: 'var(--text-muted)', marginTop: 'var(--s-2)', fontWeight: 600 }}>
          {t('streak.currentLabel')}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--s-3)', marginBottom: 'var(--s-2)' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>{streak}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('streak.dayStreak')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>{streakWeeks}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('streak.weekStreak')}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-4)' }}>
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}
            aria-label="Previous month"
          >
            <ArrowLeftIcon width={22} height={22} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{monthLabel}</div>
          <button
            onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
            style={{ background: 'none', border: 'none', cursor: monthOffset < 0 ? 'pointer' : 'default', padding: 12, color: monthOffset < 0 ? 'var(--text-muted)' : 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}
            aria-label="Next month"
          >
            <ArrowRightIcon width={22} height={22} />
          </button>
        </div>

        {/* DOW header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 'var(--s-2)' }}>
          {dowLabels.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-faint)', paddingBottom: 'var(--s-2)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />
            const ds = dateStr(day)
            const isToday = ds === todayStr
            const isStudied = studyDates.has(ds)
            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: isToday || isStudied ? 700 : 400,
                  background: isStudied ? 'var(--brand)' : isToday ? 'var(--brand-soft)' : 'transparent',
                  color: isStudied ? '#fff' : isToday ? 'var(--brand)' : 'var(--text-muted)',
                  outline: isToday && !isStudied ? '2px solid var(--brand)' : 'none',
                  outlineOffset: -2,
                }}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>

      {/* My Records */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 'var(--s-4)' }}>{t('streak.records')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{t('streak.longestStreak')}</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand)' }}>
              {longestStreak} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>{t('streak.days')}</span>
            </span>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{t('streak.totalStudyDays')}</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              {totalDays} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>{t('streak.days')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
