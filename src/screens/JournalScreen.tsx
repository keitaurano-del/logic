import { useEffect, useState } from 'react'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { JournalAssistantSheet } from '../components/journal/JournalAssistantSheet'
import { StreakBadge } from '../components/journal/StreakBadge'
import { fetchJournalStreak } from '../components/journal/journalDb'
import { SearchIcon, SparklesIcon, XIcon } from '../icons'
import { t } from '../i18n'
import '../components/journal/journal.css'

interface JournalScreenProps {
  userId: string
  assistantName: string
  onUpdateAssistantName: (name: string) => Promise<void>
}

export function JournalScreen({ userId, assistantName }: JournalScreenProps) {
  const [streak, setStreak] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)

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
            onClick={() => setAssistantOpen(true)}
            aria-label={t('journal.assistantOpenAria', { name: assistantName })}
          >
            <SparklesIcon width={18} height={18} />
          </button>
          <button
            type="button"
            className="journal-hero__icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label={t('journal.tabSearch')}
          >
            <SearchIcon width={20} height={20} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 120px', display: 'flex', flexDirection: 'column' }}>
        <JournalGoalsHeader userId={userId} />
        <JournalCalendar userId={userId} assistantName={assistantName} />
      </div>

      {assistantOpen && (
        <JournalAssistantSheet
          userId={userId}
          assistantName={assistantName}
          onClose={() => setAssistantOpen(false)}
        />
      )}

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
