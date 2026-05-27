import { useEffect, useState } from 'react'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { JournalAssistantSheet } from '../components/journal/JournalAssistantSheet'
import { JournalAssistantHistorySheet } from '../components/journal/JournalAssistantHistorySheet'
import { JournalRecentList } from '../components/journal/JournalRecentList'
import { StreakBadge } from '../components/journal/StreakBadge'
import { fetchJournalStreak } from '../components/journal/journalDb'
import { SearchIcon, XIcon, HistoryIcon } from '../icons'
import { t } from '../i18n'
import { useStudyTimer } from '../hooks/useStudyTimer'
import '../components/journal/journal.css'

interface JournalScreenProps {
  userId: string
  assistantName: string
  onUpdateAssistantName: (name: string) => Promise<void>
  /** AI アシスタントの推薦レッスンタップから呼ばれる遷移ハンドラ */
  onOpenLesson?: (lessonId: number) => void
  /** AI アシスタントの推薦コースタップから呼ばれる遷移ハンドラ（カテゴリ名で受け取る） */
  onOpenCourse?: (category: string) => void
}

export function JournalScreen({ userId, assistantName, onOpenLesson, onOpenCourse }: JournalScreenProps) {
  // 学習時間計測 — ジャーナル画面の滞在時間を study_sessions に記録
  useStudyTimer({ type: 'journal' })
  const [streak, setStreak] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  // ジャーナル保存のたびにインクリメントして、recent list / streak を再フェッチさせる
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await fetchJournalStreak(userId)
      if (!cancelled) setStreak(s)
    })()
    return () => { cancelled = true }
  }, [userId, refreshKey])

  const bumpRefresh = () => setRefreshKey((k) => k + 1)

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
            className="journal-ai-btn"
            onClick={() => setAssistantOpen(true)}
            aria-label={t('journal.assistantOpenAria', { name: assistantName })}
          >
            <span className="journal-ai-btn__pulse" aria-hidden="true" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="journal-ai-btn__sparkle">
              <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" fill="currentColor" />
              <path d="M19 14l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4z" fill="currentColor" opacity=".7" />
            </svg>
          </button>
          <button
            type="button"
            className="journal-hero__icon-btn"
            onClick={() => setHistoryOpen(true)}
            aria-label={t('journal.assistantHistoryOpenAria')}
          >
            <HistoryIcon width={20} height={20} />
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
        <JournalCalendar userId={userId} assistantName={assistantName} onSaved={bumpRefresh} />
        <JournalRecentList userId={userId} refreshKey={refreshKey} limit={5} />
      </div>

      {assistantOpen && (
        <JournalAssistantSheet
          userId={userId}
          assistantName={assistantName}
          onClose={() => setAssistantOpen(false)}
          onOpenLesson={onOpenLesson}
          onOpenCourse={onOpenCourse}
        />
      )}

      {historyOpen && (
        <JournalAssistantHistorySheet
          userId={userId}
          assistantName={assistantName}
          onClose={() => setHistoryOpen(false)}
          onOpenLesson={onOpenLesson}
          onOpenCourse={onOpenCourse}
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
