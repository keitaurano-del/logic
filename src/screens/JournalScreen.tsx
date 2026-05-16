import { useEffect, useState } from 'react'
import { JournalToday } from '../components/journal/JournalToday'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoals } from '../components/journal/JournalGoals'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { StreakBadge } from '../components/journal/StreakBadge'
import { AssistantNameSheet } from '../components/journal/AssistantNameSheet'
import { fetchJournalStreak } from '../components/journal/journalDb'
import type { PeriodType } from '../components/journal/types'
import { t } from '../i18n'
import '../components/journal/journal.css'

type Sub = 'today' | 'calendar' | 'goals' | 'search'

interface JournalScreenProps {
  userId: string
  assistantName: string
  onUpdateAssistantName: (name: string) => Promise<void>
  initialSub?: Sub
}

const SUB_ORDER: Sub[] = ['today', 'calendar', 'goals', 'search']

const SUB_LABEL_KEY: Record<Sub, string> = {
  today:    'journal.tabToday',
  calendar: 'journal.tabCalendar',
  goals:    'journal.tabGoals',
  search:   'journal.tabSearch',
}

export function JournalScreen({ userId, assistantName, onUpdateAssistantName, initialSub }: JournalScreenProps) {
  const [sub, setSub] = useState<Sub>(initialSub ?? 'today')
  const [goalsInitialPeriod, setGoalsInitialPeriod] = useState<PeriodType | undefined>(undefined)
  const [streak, setStreak] = useState(0)
  const [assistantSheetOpen, setAssistantSheetOpen] = useState(false)

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
        <div className="journal-hero__actions">
          <StreakBadge streak={streak} size="sm" />
          <button
            type="button"
            className="journal-hero__settings-btn"
            onClick={() => setAssistantSheetOpen(true)}
            aria-label={t('profile.assistantSettings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <AssistantNameSheet
        open={assistantSheetOpen}
        currentName={assistantName}
        onSave={onUpdateAssistantName}
        onClose={() => setAssistantSheetOpen(false)}
      />

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
