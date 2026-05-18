import { useEffect, useMemo, useRef, useState } from 'react'
import type { DailyJournal, JournalImage, Mood, Weather } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { JournalActivityList } from './JournalActivityList'
import { JournalHealthCard } from './JournalHealthCard'
import { JournalImageGrid } from './JournalImageGrid'
import type { HealthSnapshot } from '../../platform/health'
import { SparkleIcon } from './MoodWeatherIcons'
import { PencilIcon, XIcon } from '../../icons'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { suggestJournalTags } from './journalApi'
import { JournalXpToast } from './JournalXpToast'
import { awardJournalXp } from '../../stats'
import { t } from '../../i18n'

interface JournalDetailSheetProps {
  userId: string
  date: string // YYYY-MM-DD
  initialJournal?: DailyJournal | null
  onClose: () => void
  onSaved?: (j: DailyJournal) => void
}

type Phase = 'morning' | 'evening'

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
    images: [],
  }
}

function hasMorningContent(scheduleNotes: string, tags: string[]): boolean {
  return !!(scheduleNotes.trim() || tags.length > 0)
}

function hasEveningContent(mood: Mood | null, weather: Weather | null, reflection: string): boolean {
  return !!(mood !== null || weather || reflection.trim())
}

function hasContent(j: DailyJournal | null | undefined): boolean {
  if (!j) return false
  return !!(
    j.mood !== null && j.mood !== undefined ||
    j.weather ||
    (j.schedule_notes && j.schedule_notes.trim()) ||
    (j.evening_reflection && j.evening_reflection.trim()) ||
    (j.ai_summary && j.ai_summary.trim()) ||
    (j.tags && j.tags.length > 0) ||
    (j.images && j.images.length > 0)
  )
}

function decideInitialPhase(j: DailyJournal | null): Phase {
  if (j) {
    const m = hasMorningContent(j.schedule_notes ?? '', j.tags ?? [])
    const e = hasEveningContent((j.mood as Mood | null) ?? null, (j.weather as Weather | null) ?? null, j.evening_reflection ?? '')
    if (m && !e) return 'morning'
    if (e && !m) return 'evening'
  }
  const h = new Date().getHours()
  return h < 16 ? 'morning' : 'evening'
}

export function JournalDetailSheet({ userId, date, initialJournal, onClose, onSaved }: JournalDetailSheetProps) {
  const [journal, setJournal] = useState<DailyJournal | null>(initialJournal ?? null)
  const [mood, setMood] = useState<Mood | null>((initialJournal?.mood as Mood | null) ?? null)
  const [weather, setWeather] = useState<Weather | null>((initialJournal?.weather as Weather | null) ?? null)
  const [scheduleNotes, setScheduleNotes] = useState<string>(initialJournal?.schedule_notes ?? '')
  const [reflection, setReflection] = useState<string>(initialJournal?.evening_reflection ?? '')
  const [tags, setTags] = useState<string[]>(initialJournal?.tags ?? [])
  const [health, setHealth] = useState<HealthSnapshot>(() => ({
    steps: initialJournal?.steps_count ?? null,
    sleepMinutes: initialJournal?.sleep_minutes ?? null,
    sleepStart: initialJournal?.sleep_start ?? null,
    sleepEnd: initialJournal?.sleep_end ?? null,
  }))
  const [images, setImages] = useState<JournalImage[]>(initialJournal?.images ?? [])
  const aiSummary = journal?.ai_summary ?? ''

  const [phase, setPhase] = useState<Phase>(() => decideInitialPhase(initialJournal ?? null))

  const startsEditing = !hasContent(initialJournal)
  const [editing, setEditing] = useState(startsEditing)

  const [loading, setLoading] = useState(initialJournal === undefined)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [aiTagToast, setAiTagToast] = useState<string | null>(null)
  const [xpToast, setXpToast] = useState<{ xp: number; label: string } | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

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
        setHealth({
          steps: j.steps_count ?? null,
          sleepMinutes: j.sleep_minutes ?? null,
          sleepStart: j.sleep_start ?? null,
          sleepEnd: j.sleep_end ?? null,
        })
        setImages(j.images ?? [])
        setPhase(decideInitialPhase(j))
        if (hasContent(j)) setEditing(false)
      } else {
        setEditing(true)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, date, initialJournal])

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
    setSaveError(null)
    const trimmedSchedule = scheduleNotes.trim()
    const trimmedReflection = reflection.trim()
    const updated: DailyJournal = {
      ...emptyJournal(userId, date),
      mood,
      weather,
      schedule_notes: trimmedSchedule || null,
      evening_reflection: trimmedReflection || null,
      ai_summary: aiSummary.trim() || null,
      tags,
      steps_count: health.steps,
      sleep_minutes: health.sleepMinutes,
      sleep_start: health.sleepStart,
      sleep_end: health.sleepEnd,
      images,
    }
    // 保存前: この保存で「初めて朝/夜が埋まる」かを判定（XP は新規完成時のみ）
    const wasMorning = hasMorningContent(journal?.schedule_notes ?? '', journal?.tags ?? [])
    const wasEvening = hasEveningContent(
      (journal?.mood as Mood | null) ?? null,
      (journal?.weather as Weather | null) ?? null,
      journal?.evening_reflection ?? '',
    )
    const nowMorning = hasMorningContent(trimmedSchedule, tags)
    const nowEvening = hasEveningContent(mood, weather, trimmedReflection)

    const { error } = await upsertJournal(updated)
    setSaving(false)
    if (error) {
      console.error('[journal] upsertJournal failed:', error)
      setSaveError(error)
      return
    }

    setJournal(updated)
    setSavedToast(true)
    onSaved?.(updated)
    setEditing(false)
    setTimeout(() => setSavedToast(false), 1500)

    // 初めて朝/夜が完成した瞬間のみ XP 付与 + アニメーション。
    // awardJournalXp は同日同フェーズで既に付与済みなら 0 を返すので二重付与は起きない。
    if (!wasMorning && nowMorning) {
      const gained = awardJournalXp(date, 'morning')
      if (gained > 0) setXpToast({ xp: gained, label: t('journal.xpMorningLabel') })
    } else if (!wasEvening && nowEvening) {
      const gained = awardJournalXp(date, 'evening')
      if (gained > 0) setXpToast({ xp: gained, label: t('journal.xpEveningLabel') })
    }

    // バックグラウンドで AI タグ提案。既存タグが少なく (<4)、本文がある場合のみ。
    const hasText = trimmedSchedule.length > 5 || trimmedReflection.length > 5
    if (hasText && tags.length < 4) {
      ;(async () => {
        const { suggestedTags } = await suggestJournalTags({
          scheduleNotes: trimmedSchedule,
          eveningReflection: trimmedReflection,
          existingTags: tags,
        })
        if (!suggestedTags || suggestedTags.length === 0) return
        const lower = new Set(tags.map((t2) => t2.toLowerCase()))
        const additions = suggestedTags
          .filter((s) => s && !lower.has(s.toLowerCase()))
          .slice(0, Math.max(0, 5 - tags.length))
        if (additions.length === 0) return
        const merged = [...tags, ...additions]
        const reupdated: DailyJournal = { ...updated, tags: merged }
        const { error: e2 } = await upsertJournal(reupdated)
        if (e2) return
        setTags(merged)
        setJournal(reupdated)
        onSaved?.(reupdated)
        setAiTagToast(t('journal.aiTagsAdded', { n: String(additions.length) }))
        setTimeout(() => setAiTagToast(null), 2400)
      })()
    }
  }

  const handleEnterEdit = () => setEditing(true)

  const handleCancelEdit = () => {
    if (journal) {
      setMood((journal.mood as Mood | null) ?? null)
      setWeather((journal.weather as Weather | null) ?? null)
      setScheduleNotes(journal.schedule_notes ?? '')
      setReflection(journal.evening_reflection ?? '')
      setTags(journal.tags ?? [])
      // images は即保存方式（Storage に upload 済み）なのでキャンセル時もそのまま残す
      setEditing(false)
    } else {
      onClose()
    }
  }

  // 画像の追加・削除は Storage への upload/delete が即時走るため、DB の images カラムも
  // ここで即時 upsert して整合を取る（編集モードのキャンセルでは画像変更は巻き戻さない）。
  const handleImagesChange = async (next: JournalImage[]) => {
    setImages(next)
    const base = journal ?? emptyJournal(userId, date)
    const updated: DailyJournal = {
      ...base,
      user_id: userId,
      date,
      images: next,
    }
    const { error } = await upsertJournal(updated)
    if (error) return
    setJournal(updated)
    onSaved?.(updated)
  }

  const morningWritten = hasMorningContent(scheduleNotes, tags)
  const eveningWritten = hasEveningContent(mood, weather, reflection)
  const hasImages = images.length > 0

  const renderImagesSection = (mode: 'edit' | 'view') => (
    <div className="journal-view-section">
      <div className="journal-modal__section-label">{t('journal.imagesLabel')}</div>
      <JournalImageGrid
        userId={userId}
        date={date}
        images={images}
        editing={mode === 'edit'}
        onChange={handleImagesChange}
        disabled={saving}
      />
    </div>
  )

  const renderPhaseTabs = () => (
    <div className="journal-phase-tabs" role="tablist" aria-label={t('journal.phaseTabs')}>
      <button
        type="button"
        role="tab"
        aria-selected={phase === 'morning'}
        className={`journal-phase-tab ${phase === 'morning' ? 'journal-phase-tab--active' : ''}`}
        onClick={() => setPhase('morning')}
      >
        <span className="journal-emoji-icon journal-phase-tab__emoji" aria-hidden="true">☀️</span>
        <span>{t('journal.phaseMorning')}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={phase === 'evening'}
        className={`journal-phase-tab ${phase === 'evening' ? 'journal-phase-tab--active' : ''}`}
        onClick={() => setPhase('evening')}
      >
        <span className="journal-emoji-icon journal-phase-tab__emoji" aria-hidden="true">🌙</span>
        <span>{t('journal.phaseEvening')}</span>
      </button>
    </div>
  )

  const renderMorningEdit = () => (
    <>
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
    </>
  )

  const renderEveningEdit = () => (
    <>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
        <MoodSelector value={mood} onChange={setMood} disabled={saving} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
        <WeatherSelector value={weather} onChange={setWeather} disabled={saving} />
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
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.healthTitle')}</div>
        <JournalHealthCard date={date} initial={health} onSnapshot={setHealth} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.activityTitle')}</div>
        <JournalActivityList date={date} />
      </div>
    </>
  )

  const renderMorningView = () => (
    <div className="journal-view-block">
      <div className="journal-view-block__title">
        <span className="journal-emoji-icon" aria-hidden="true">☀️</span>
        <span>{t('journal.phaseMorning')}</span>
      </div>
      {scheduleNotes.trim() && (
        <div className="journal-view-section">
          <div className="journal-modal__section-label">{t('journal.intentLabel')}</div>
          <div className="journal-modal__body">{scheduleNotes}</div>
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
    </div>
  )

  const renderEveningView = () => (
    <div className="journal-view-block">
      <div className="journal-view-block__title">
        <span className="journal-emoji-icon" aria-hidden="true">🌙</span>
        <span>{t('journal.phaseEvening')}</span>
      </div>
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
      {reflection.trim() && (
        <div className="journal-view-section">
          <div className="journal-modal__section-label">{t('journal.eveningReflection')}</div>
          <div className="journal-modal__body">{reflection}</div>
        </div>
      )}
      <div className="journal-view-section">
        <div className="journal-modal__section-label">{t('journal.healthTitle')}</div>
        <JournalHealthCard date={date} initial={health} onSnapshot={setHealth} />
      </div>
      <div className="journal-view-section">
        <div className="journal-modal__section-label">{t('journal.activityTitle')}</div>
        <JournalActivityList date={date} />
      </div>
    </div>
  )

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
          <div className="journal-modal__header-actions">
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
            <button
              type="button"
              className="journal-modal__close-btn"
              onClick={onClose}
              aria-label={t('journal.closeSheet')}
            >
              <XIcon width={18} height={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="journal-modal__empty">{t('common.loading')}</div>
        ) : editing ? (
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

            {renderPhaseTabs()}

            <div className="journal-today__phase">
              {phase === 'morning' ? renderMorningEdit() : renderEveningEdit()}
            </div>

            {renderImagesSection('edit')}

            {saveError && (
              <div
                role="alert"
                className="journal-save-error"
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--danger-soft, #FEECEC)',
                  color: 'var(--danger, #C0392B)',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{t('journal.saveErrorTitle')}</div>
                <div>{t('journal.saveErrorRetry')}</div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.75, wordBreak: 'break-word' }}>
                  {saveError}
                </div>
              </div>
            )}

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
              {t('common.cancel')}
            </button>
          </>
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

            {morningWritten && eveningWritten ? (
              <div className="journal-view-stack">
                {renderMorningView()}
                {renderEveningView()}
              </div>
            ) : morningWritten ? (
              renderMorningView()
            ) : eveningWritten ? (
              renderEveningView()
            ) : !hasImages ? (
              <div className="journal-modal__empty">{t('journal.emptyEntryHint')}</div>
            ) : null}

            {hasImages && renderImagesSection('view')}
          </>
        )}

        {savedToast && (
          <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
        )}
        {aiTagToast && (
          <div className="journal-toast" role="status">{aiTagToast}</div>
        )}
        {xpToast && (
          <JournalXpToast
            xp={xpToast.xp}
            label={xpToast.label}
            onDone={() => setXpToast(null)}
          />
        )}
      </div>
    </div>
  )
}
