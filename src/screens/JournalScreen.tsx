import { useEffect, useState } from 'react'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { StreakBadge } from '../components/journal/StreakBadge'
import { AssistantNameSheet } from '../components/journal/AssistantNameSheet'
import { fetchJournalStreak } from '../components/journal/journalDb'
import { SearchIcon, XIcon } from '../icons'
import { t } from '../i18n'
import '../components/journal/journal.css'

interface JournalScreenProps {
  userId: string
  assistantName: string
  onUpdateAssistantName: (name: string) => Promise<void>
}

export function JournalScreen({ userId, assistantName, onUpdateAssistantName }: JournalScreenProps) {
  const [streak, setStreak] = useState(0)
  const [assistantSheetOpen, setAssistantSheetOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await fetchJournalStreak(userId)
      if (!cancelled) setStreak(s)
    })()
    return () => { cancelled = true }
  }, [userId])

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
            className="journal-hero__icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label={t('journal.tabSearch')}
          >
            <SearchIcon width={20} height={20} />
          </button>
          <button
            type="button"
            className="journal-hero__icon-btn"
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
        <JournalGoalsHeader userId={userId} />
        <JournalCalendar userId={userId} assistantName={assistantName} />
      </div>

      {searchOpen && (
        <div className="journal-search-overlay" role="dialog" aria-modal="true" aria-label={t('journal.tabSearch')}>
          <div className="journal-search-overlay__sheet">
            <div className="journal-search-overlay__head">
              <div className="journal-search-overlay__title">{t('journal.tabSearch')}</div>
              <button
                type="button"
                className="journal-search-overlay__close"
                onClick={() => setSearchOpen(false)}
                aria-label={t('common.close')}
              >
                <XIcon width={20} height={20} />
              </button>
            </div>
            <div className="journal-search-overlay__body">
              <JournalSearch userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
