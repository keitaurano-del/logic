import { useEffect, useState } from 'react'
import { JournalToday } from '../components/journal/JournalToday'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoals } from '../components/journal/JournalGoals'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { StreakBadge } from '../components/journal/StreakBadge'
import { fetchJournalStreak } from '../components/journal/journalDb'
import type { PeriodType } from '../components/journal/types'
import { t } from '../i18n'
import '../components/journal/journal.css'

type Sub = 'today' | 'calendar' | 'goals' | 'search'

interface JournalScreenProps {
  userId: string
  assistantName: string
  initialSub?: Sub
}

const SUB_ORDER: Sub[] = ['today', 'calendar', 'goals', 'search']

const SUB_LABEL_KEY: Record<Sub, string> = {
  today:    'journal.tabToday',
  calendar: 'journal.tabCalendar',
  goals:    'journal.tabGoals',
  search:   'journal.tabSearch',
}

export function JournalScreen({ userId, assistantName, initialSub }: JournalScreenProps) {
  const [sub, setSub] = useState<Sub>(initialSub ?? 'today')
  const [goalsInitialPeriod, setGoalsInitialPeriod] = useState<PeriodType | undefined>(undefined)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await fetchJournalStreak(userId)
      if (!cancelled) setStreak(s)
    })()
    return () => { cancelled = true }
  }, [userId])

  const openGoalsTab = (period?: PeriodType) => {
    setGoalsInitialPeriod(period)
    setSub('goals')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
        <div className="journal-hero__streak">
          <StreakBadge streak={streak} size="sm" />
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 120px', display: 'flex', flexDirection: 'column' }}>
        {/* 「今日」タブのときだけ、年→月→週 の目標サマリーを上部に常時表示 */}
        {sub === 'today' && (
          <JournalGoalsHeader
            userId={userId}
            onOpenAll={openGoalsTab}
          />
        )}

        <div className="journal-subtabs" role="tablist" aria-label={t('journal.viewTabs')}>
          {SUB_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={sub === s}
              className={`journal-subtab ${sub === s ? 'journal-subtab--active' : ''}`}
              onClick={() => {
                if (s !== 'goals') setGoalsInitialPeriod(undefined)
                setSub(s)
              }}
            >
              {t(SUB_LABEL_KEY[s])}
            </button>
          ))}
        </div>

        {sub === 'today'    && <JournalToday    userId={userId} assistantName={assistantName} />}
        {sub === 'calendar' && <JournalCalendar userId={userId} />}
        {sub === 'goals'    && <JournalGoals    userId={userId} assistantName={assistantName} initialPeriod={goalsInitialPeriod} />}
        {sub === 'search'   && <JournalSearch   userId={userId} />}
      </div>
    </div>
  )
}
