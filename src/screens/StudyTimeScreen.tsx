import { useMemo } from 'react'
import { getStudyTimeMs, getStudyDates, getTotalStudyDays } from '../stats'
import { ClockIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'

interface StudyTimeScreenProps {
  onBack: () => void
}

function formatMs(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}秒`
  if (ms < 3600000) return `${Math.round(ms / 60000)}分`
  const h = Math.floor(ms / 3600000)
  const m = Math.round((ms % 3600000) / 60000)
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

function formatMsEn(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  const h = Math.floor(ms / 3600000)
  const m = Math.round((ms % 3600000) / 60000)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function StudyTimeScreen({ onBack }: StudyTimeScreenProps) {
  const totalMs = getStudyTimeMs()
  const totalDays = getTotalStudyDays()
  const studyDates = useMemo(() => getStudyDates(), [])
  const isJa = t('nav.home') === 'ホーム'
  const fmt = isJa ? formatMs : formatMsEn

  const avgMs = totalDays > 0 ? Math.round(totalMs / totalDays) : 0

  // Build last 30 days bar chart
  const today = new Date()
  const studySet = new Set(studyDates)
  const last30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (29 - i))
      const ds = d.toISOString().slice(0, 10)
      return { ds, active: studySet.has(ds) }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recent 7 days list
  const recentDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      return { ds, active: studySet.has(ds) }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeDaysLast30 = last30.filter((d) => d.active).length

  return (
    <div className="stack">
      <Header title={t('studytime.title')} onBack={onBack} />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'var(--s-5) 0 var(--s-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s-3)', color: 'var(--brand)' }}>
          <ClockIcon width={40} height={40} />
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--brand)' }}>
          {fmt(totalMs)}
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 'var(--s-2)', fontWeight: 600 }}>
          {t('studytime.totalLabel')}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{totalDays}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('studytime.studyDays')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{fmt(avgMs)}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('studytime.avgPerDay')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{activeDaysLast30}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('studytime.last30Days')}</div>
        </div>
      </div>

      {/* 30-day activity bar chart */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s-4)', color: 'var(--text-muted)' }}>
          {t('studytime.last30Chart')}
        </h2>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
          {last30.map(({ ds, active }) => (
            <div
              key={ds}
              style={{
                flex: 1,
                height: active ? 40 : 8,
                borderRadius: 3,
                background: active ? 'var(--brand)' : 'var(--bg-secondary)',
                transition: 'height 0.2s',
              }}
              title={ds}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-2)' }}>
          <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>{t('label.daysAgo', { n: 30 })}</span>
          <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>{t('label.today')}</span>
        </div>
      </div>

      {/* Recent 7 days */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s-4)', color: 'var(--text-muted)' }}>
          {t('studytime.recentDays')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recentDays.map(({ ds, active }, i) => {
            const d = new Date(ds)
            const label = isJa
              ? `${d.getMonth() + 1}/${d.getDate()}（${['日','月','火','水','木','金','土'][d.getDay()]}）`
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
            const isToday = i === 0
            return (
              <div key={ds}>
                {i > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--s-3) 0', gap: 'var(--s-3)' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: active ? 'var(--brand)' : 'var(--border)',
                  }} />
                  <span style={{ flex: 1, fontSize: 16, color: isToday ? 'var(--text)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400 }}>
                    {label}{isToday ? (isJa ? ' (今日)' : ' (Today)') : ''}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text-faint)' }}>
                    {active ? (isJa ? '学習済み' : 'Studied') : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
