import { useEffect, useRef, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { SparkleIcon } from './MoodWeatherIcons'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { t } from '../../i18n'

interface JournalDetailSheetProps {
  userId: string
  date: string // YYYY-MM-DD
  initialJournal?: DailyJournal | null
  onClose: () => void
  onSaved?: (j: DailyJournal) => void
}

function emptyJournal(userId: string, date: string): DailyJournal {
  return {
    user_id: userId,
    date,
    mood: null,
    weather: null,
    morning_memo: null,
    schedule_notes: null,
    evening_reflection: null,
    ai_summary: null,
    tags: [],
  }
}

export function JournalDetailSheet({ userId, date, initialJournal, onClose, onSaved }: JournalDetailSheetProps) {
  // フル編集モード: 開いている間は state にバッファし、保存で確定
  const [mood, setMood] = useState<Mood | null>((initialJournal?.mood as Mood | null) ?? null)
  const [weather, setWeather] = useState<Weather | null>((initialJournal?.weather as Weather | null) ?? null)
  const [scheduleNotes, setScheduleNotes] = useState<string>(initialJournal?.schedule_notes ?? '')
  const [reflection, setReflection] = useState<string>(initialJournal?.evening_reflection ?? '')
  const [tags, setTags] = useState<string[]>(initialJournal?.tags ?? [])
  const [aiSummary] = useState<string>(initialJournal?.ai_summary ?? '') // read-only 表示用

  const [loading, setLoading] = useState(!initialJournal)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // 初期データが渡されない場合は fetch
  useEffect(() => {
    if (initialJournal !== undefined && initialJournal !== null) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const j = await fetchJournalByDate(userId, date)
      if (cancelled) return
      if (j) {
        setMood((j.mood as Mood | null) ?? null)
        setWeather((j.weather as Weather | null) ?? null)
        setScheduleNotes(j.schedule_notes ?? '')
        setReflection(j.evening_reflection ?? '')
        setTags(j.tags ?? [])
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, date, initialJournal])

  // モーダル a11y: ESC で閉じる、focus trap、body scroll lock
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const root = modalRef.current
        if (!root) return
        const focusables = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    closeBtnRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      previouslyFocusedRef.current?.focus?.()
    }
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    const updated: DailyJournal = {
      ...emptyJournal(userId, date),
      mood,
      weather,
      schedule_notes: scheduleNotes.trim() || null,
      evening_reflection: reflection.trim() || null,
      ai_summary: aiSummary.trim() || null,
      tags,
    }
    const { error } = await upsertJournal(updated)
    setSaving(false)
    if (!error) {
      setSavedToast(true)
      onSaved?.(updated)
      setTimeout(() => setSavedToast(false), 1500)
    }
  }

  return (
    <div className="journal-modal-overlay" role="dialog" aria-modal="true" aria-label={date}>
      <button
        type="button"
        ref={closeBtnRef}
        aria-label={t('journal.closeSheet')}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      />
      <div ref={modalRef} className="journal-modal" style={{ position: 'relative' }}>
        <div className="journal-modal__bar" />
        <div className="journal-modal__title">{date}</div>

        {loading ? (
          <div className="journal-modal__empty">{t('common.loading')}</div>
        ) : (
          <>
            {aiSummary && (
              <div className="journal-summary-card journal-summary-card--compact" role="region">
                <div className="journal-summary-card__title">
                  <SparkleIcon size={14} />
                  <span>{t('journal.aiSummary')}</span>
                </div>
                <div className="journal-summary-card__body">{aiSummary}</div>
              </div>
            )}

            {/* mood */}
            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
              <MoodSelector value={mood} onChange={setMood} disabled={saving} />
            </div>

            {/* weather */}
            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
              <WeatherSelector value={weather} onChange={setWeather} disabled={saving} />
            </div>

            {/* schedule_notes (朝の意図) */}
            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.intentLabel')}</div>
              <VoiceTextarea
                value={scheduleNotes}
                onChange={setScheduleNotes}
                placeholder={t('journal.intentPlaceholder')}
                ariaLabel={t('journal.intentLabel')}
                enableCleanup
                showVoiceHint
              />
            </div>

            {/* tags */}
            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.tagsLabel')}</div>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder={t('journal.tagsPlaceholder')}
              />
            </div>

            {/* evening_reflection */}
            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.eveningReflection')}</div>
              <VoiceTextarea
                value={reflection}
                onChange={setReflection}
                placeholder={t('journal.eveningPlaceholder')}
                ariaLabel={t('journal.eveningReflection')}
                minHeight={120}
                enableCleanup
                showVoiceHint
              />
            </div>

            <button
              type="button"
              className="journal-summarize-btn"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: 4 }}
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
