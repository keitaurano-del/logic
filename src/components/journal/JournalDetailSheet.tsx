import { useEffect, useMemo, useRef, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { JournalActivityList } from './JournalActivityList'
import { SparkleIcon } from './MoodWeatherIcons'
import { PencilIcon } from '../../icons'
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

function hasContent(j: DailyJournal | null | undefined): boolean {
  if (!j) return false
  return !!(
    j.mood !== null && j.mood !== undefined ||
    j.weather ||
    (j.schedule_notes && j.schedule_notes.trim()) ||
    (j.evening_reflection && j.evening_reflection.trim()) ||
    (j.ai_summary && j.ai_summary.trim()) ||
    (j.tags && j.tags.length > 0)
  )
}

export function JournalDetailSheet({ userId, date, initialJournal, onClose, onSaved }: JournalDetailSheetProps) {
  // 表示用 + バッファ用 state
  const [journal, setJournal] = useState<DailyJournal | null>(initialJournal ?? null)
  const [mood, setMood] = useState<Mood | null>((initialJournal?.mood as Mood | null) ?? null)
  const [weather, setWeather] = useState<Weather | null>((initialJournal?.weather as Weather | null) ?? null)
  const [scheduleNotes, setScheduleNotes] = useState<string>(initialJournal?.schedule_notes ?? '')
  const [reflection, setReflection] = useState<string>(initialJournal?.evening_reflection ?? '')
  const [tags, setTags] = useState<string[]>(initialJournal?.tags ?? [])
  const aiSummary = journal?.ai_summary ?? ''

  // 編集モード切替: 既存エントリありで開いたときは閲覧モードでスタート、なければ編集モード
  const startsEditing = !hasContent(initialJournal)
  const [editing, setEditing] = useState(startsEditing)

  const [loading, setLoading] = useState(initialJournal === undefined)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // initialJournal が undefined（=未指定）の場合のみ fetch（null 明示は「無し確定」として扱う）
  useEffect(() => {
    if (initialJournal !== undefined) return
    let cancelled = false
    ;(async () => {
      const j = await fetchJournalByDate(userId, date)
      if (cancelled) return
      if (j) {
        setJournal(j)
        setMood((j.mood as Mood | null) ?? null)
        setWeather((j.weather as Weather | null) ?? null)
        setScheduleNotes(j.schedule_notes ?? '')
        setReflection(j.evening_reflection ?? '')
        setTags(j.tags ?? [])
        if (hasContent(j)) setEditing(false)
      } else {
        setEditing(true)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, date, initialJournal])

  // モーダル a11y
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

  const moodLabel = useMemo(() => {
    if (mood === null) return null
    const key = ({
      1: 'journal.moodVeryBad',
      2: 'journal.moodBad',
      3: 'journal.moodNeutral',
      4: 'journal.moodGood',
      5: 'journal.moodGreat',
    } as Record<number, string>)[mood]
    return key ? t(key) : null
  }, [mood])

  const weatherLabel = useMemo(() => {
    if (!weather) return null
    const key = ({
      sunny: 'journal.weatherSunny',
      cloudy: 'journal.weatherCloudy',
      rainy: 'journal.weatherRainy',
      snowy: 'journal.weatherSnowy',
    } as Record<string, string>)[weather]
    return key ? t(key) : null
  }, [weather])

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
      setJournal(updated)
      setSavedToast(true)
      onSaved?.(updated)
      setEditing(false) // 保存後は閲覧モードに戻す
      setTimeout(() => setSavedToast(false), 1500)
    }
  }

  const handleEnterEdit = () => setEditing(true)

  const handleCancelEdit = () => {
    // バッファを破棄して元の値に戻す
    if (journal) {
      setMood((journal.mood as Mood | null) ?? null)
      setWeather((journal.weather as Weather | null) ?? null)
      setScheduleNotes(journal.schedule_notes ?? '')
      setReflection(journal.evening_reflection ?? '')
      setTags(journal.tags ?? [])
      setEditing(false)
    } else {
      // 既存無しならシートごと閉じる
      onClose()
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
        <div className="journal-modal__header">
          <div className="journal-modal__title">{date}</div>
          {!editing && !loading && hasContent(journal) && (
            <button
              type="button"
              className="journal-modal__edit-btn"
              onClick={handleEnterEdit}
              aria-label={t('journal.editEntry')}
            >
              <PencilIcon width={14} height={14} />
              <span>{t('common.edit')}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="journal-modal__empty">{t('common.loading')}</div>
        ) : editing ? (
          // ── 編集モード ──
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

            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
              <MoodSelector value={mood} onChange={setMood} disabled={saving} />
            </div>

            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
              <WeatherSelector value={weather} onChange={setWeather} disabled={saving} />
            </div>

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

            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.tagsLabel')}</div>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder={t('journal.tagsPlaceholder')}
              />
            </div>

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

            <div>
              <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.activityTitle')}</div>
              <JournalActivityList date={date} />
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

            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                marginTop: 4, width: '100%', background: 'transparent', border: 'none',
                padding: 12, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {hasContent(journal) ? t('common.cancel') : t('common.close')}
            </button>
          </>
        ) : (
          // ── 閲覧モード ──
          <>
            {(moodLabel || weatherLabel) && (
              <div className="journal-view-row">
                {moodLabel && (
                  <div className="journal-view-chip">
                    <MoodIcon mood={mood as Mood} size={18} />
                    <span>{moodLabel}</span>
                  </div>
                )}
                {weatherLabel && (
                  <div className="journal-view-chip">
                    <WeatherIcon weather={weather as Weather} size={18} />
                    <span>{weatherLabel}</span>
                  </div>
                )}
              </div>
            )}

            {aiSummary && (
              <div className="journal-summary-card journal-summary-card--compact" role="region">
                <div className="journal-summary-card__title">
                  <SparkleIcon size={14} />
                  <span>{t('journal.aiSummary')}</span>
                </div>
                <div className="journal-summary-card__body">{aiSummary}</div>
              </div>
            )}

            {scheduleNotes.trim() && (
              <div className="journal-view-section">
                <div className="journal-modal__section-label">{t('journal.intentLabel')}</div>
                <div className="journal-modal__body">{scheduleNotes}</div>
              </div>
            )}

            {reflection.trim() && (
              <div className="journal-view-section">
                <div className="journal-modal__section-label">{t('journal.eveningReflection')}</div>
                <div className="journal-modal__body">{reflection}</div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="journal-view-section">
                <div className="journal-modal__section-label">{t('journal.tagsLabel')}</div>
                <div className="journal-view-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="journal-tag-chip">
                      <span className="journal-tag-chip__text">{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="journal-view-section">
              <div className="journal-modal__section-label">{t('journal.activityTitle')}</div>
              <JournalActivityList date={date} />
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 4, width: '100%', background: 'transparent', border: 'none',
                padding: 12, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {t('common.close')}
            </button>
          </>
        )}

        {savedToast && (
          <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
        )}
      </div>
    </div>
  )
}
