import { useEffect, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import { VoiceTextarea } from './VoiceTextarea'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { t } from '../../i18n'

interface JournalDetailSheetProps {
  userId: string
  date: string // YYYY-MM-DD
  initialJournal?: DailyJournal | null
  onClose: () => void
  onSaved?: (j: DailyJournal) => void
}

const MOOD_LABEL_KEY: Record<Mood, string> = {
  1: 'journal.moodVeryBad',
  2: 'journal.moodBad',
  3: 'journal.moodNeutral',
  4: 'journal.moodGood',
  5: 'journal.moodGreat',
}

const WEATHER_LABEL_KEY: Record<Weather, string> = {
  sunny:  'journal.weatherSunny',
  cloudy: 'journal.weatherCloudy',
  rainy:  'journal.weatherRainy',
  snowy:  'journal.weatherSnowy',
}

export function JournalDetailSheet({ userId, date, initialJournal, onClose, onSaved }: JournalDetailSheetProps) {
  const [journal, setJournal] = useState<DailyJournal | null>(initialJournal ?? null)
  const [reflection, setReflection] = useState(initialJournal?.evening_reflection ?? '')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [loading, setLoading] = useState(!initialJournal)

  useEffect(() => {
    if (initialJournal !== undefined && initialJournal !== null) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const j = await fetchJournalByDate(userId, date)
      if (cancelled) return
      setJournal(j)
      setReflection(j?.evening_reflection ?? '')
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, date, initialJournal])

  const handleSave = async () => {
    setSaving(true)
    const updated: DailyJournal = {
      user_id: userId,
      date,
      mood: (journal?.mood as Mood | null) ?? null,
      weather: (journal?.weather as Weather | null) ?? null,
      morning_memo: journal?.morning_memo ?? null,
      schedule_notes: journal?.schedule_notes ?? null,
      ai_summary: journal?.ai_summary ?? null,
      evening_reflection: reflection.trim() || null,
    }
    const { error } = await upsertJournal(updated)
    setSaving(false)
    if (!error) {
      setJournal(updated)
      setSavedToast(true)
      onSaved?.(updated)
      setTimeout(() => setSavedToast(false), 2000)
    }
  }

  return (
    <div className="journal-modal-overlay" role="dialog" aria-modal="true" aria-label={date}>
      <button
        type="button"
        aria-label={t('common.cancel')}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      />
      <div className="journal-modal" style={{ position: 'relative' }}>
        <div className="journal-modal__bar" />
        <div>
          <div className="journal-modal__title">{date}</div>
          {(journal?.mood || journal?.weather) && (
            <div className="journal-modal__meta" style={{ marginTop: 6 }}>
              {journal.mood && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--brand)' }}>
                  <MoodIcon mood={journal.mood as Mood} size={18} color="currentColor" />
                  <span>{t(MOOD_LABEL_KEY[journal.mood as Mood])}</span>
                </span>
              )}
              {journal.weather && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                  <WeatherIcon weather={journal.weather as Weather} size={18} color="currentColor" />
                  <span>{t(WEATHER_LABEL_KEY[journal.weather as Weather])}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {loading && <div className="journal-modal__empty">{t('common.loading')}</div>}

        {!loading && !journal && (
          <div className="journal-modal__empty">{t('journal.noEntryThisDay')}</div>
        )}

        {!loading && journal && (
          <>
            {journal.schedule_notes && (
              <div>
                <div className="journal-modal__section-label">{t('journal.scheduleLabel')}</div>
                <div className="journal-modal__body">{journal.schedule_notes}</div>
              </div>
            )}

            {journal.ai_summary && (
              <div>
                <div className="journal-modal__section-label">{t('journal.aiSummary')}</div>
                <div className="journal-modal__body">{journal.ai_summary}</div>
              </div>
            )}

            <div>
              <div className="journal-modal__section-label">{t('journal.eveningReflection')}</div>
              <div style={{ marginTop: 6 }}>
                <VoiceTextarea
                  value={reflection}
                  onChange={setReflection}
                  placeholder={t('journal.eveningPlaceholder')}
                  ariaLabel={t('journal.eveningReflection')}
                />
              </div>
            </div>

            <button
              type="button"
              className="journal-summarize-btn"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: 8 }}
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 4, width: '100%', background: 'transparent', border: 'none',
            padding: 12, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          {t('common.cancel')}
        </button>

        {savedToast && (
          <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
        )}
      </div>
    </div>
  )
}
