import { useEffect, useState } from 'react'
import { fetchRecentJournals } from './journalDb'
import { JournalDetailSheet } from './JournalDetailSheet'
import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import type { DailyJournal, Mood, Weather } from './types'
import { t } from '../../i18n'

interface JournalRecentListProps {
  userId: string
  /** Refresh signal — bump this when the parent saves a journal to force a re-fetch */
  refreshKey?: number
  /** How many recent entries to show. Default 5. */
  limit?: number
}

function hasContent(j: DailyJournal): boolean {
  return !!(
    (j.mood !== null && j.mood !== undefined) ||
    j.weather ||
    (j.schedule_notes && j.schedule_notes.trim()) ||
    (j.evening_reflection && j.evening_reflection.trim()) ||
    (j.tags && j.tags.length > 0) ||
    (j.images && j.images.length > 0)
  )
}

function formatDate(iso: string): string {
  // iso = YYYY-MM-DD
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

function excerpt(j: DailyJournal): string {
  const text = (j.evening_reflection || j.schedule_notes || j.ai_summary || '').trim()
  if (!text) return ''
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

export function JournalRecentList({ userId, refreshKey = 0, limit = 5 }: JournalRecentListProps) {
  const [items, setItems] = useState<DailyJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchRecentJournals(userId, 60)
        if (cancelled) return
        const filtered = list.filter(hasContent).slice(0, limit)
        setItems(filtered)
      } finally {
        // 例外が出ても loading 状態を必ず解放（無限スピナー防止）。
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [userId, refreshKey, limit])

  if (loading) {
    return (
      <div className="journal-recent">
        <div className="journal-recent__title">{t('journal.recentTitle')}</div>
        <div className="journal-recent__loading">{t('common.loading')}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="journal-recent">
        <div className="journal-recent__title">{t('journal.recentTitle')}</div>
        <div className="journal-recent__empty">{t('journal.recentEmpty')}</div>
      </div>
    )
  }

  return (
    <div className="journal-recent">
      <div className="journal-recent__title">{t('journal.recentTitle')}</div>
      <ul className="journal-recent__list">
        {items.map((j) => {
          const tags = Array.isArray(j.tags) ? j.tags.slice(0, 3) : []
          return (
            <li key={j.date}>
              <button
                type="button"
                className="journal-recent__item"
                onClick={() => setSelected(j.date)}
                aria-label={`${j.date} ${t('journal.openEntryAria')}`}
              >
                <div className="journal-recent__item-head">
                  <span className="journal-recent__date">{formatDate(j.date)}</span>
                  <div className="journal-recent__icons">
                    {j.mood != null && (
                      <span className={`journal-emoji-icon journal-cal-cell__mood--${j.mood}`}>
                        <MoodIcon mood={j.mood as Mood} size={18} />
                      </span>
                    )}
                    {j.weather && (
                      <span className="journal-emoji-icon">
                        <WeatherIcon weather={j.weather as Weather} size={18} />
                      </span>
                    )}
                  </div>
                </div>
                {excerpt(j) && (
                  <div className="journal-recent__excerpt">{excerpt(j)}</div>
                )}
                {tags.length > 0 && (
                  <div className="journal-recent__tags">
                    {tags.map((tag) => (
                      <span key={tag} className="journal-recent__tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {selected && (
        <JournalDetailSheet
          userId={userId}
          date={selected}
          initialJournal={items.find((j) => j.date === selected) ?? null}
          onClose={() => setSelected(null)}
          onSaved={() => {/* parent's refreshKey will re-fetch */}}
        />
      )}
    </div>
  )
}
