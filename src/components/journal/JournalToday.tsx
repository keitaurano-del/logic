import { useEffect, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { todayKey } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { JournalActivityList } from './JournalActivityList'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { t } from '../../i18n'

interface JournalTodayProps {
  userId: string | null
  assistantName: string
}

type Phase = 'morning' | 'evening'

function decideInitialPhase(): Phase {
  const h = new Date().getHours()
  return h < 16 ? 'morning' : 'evening'
}

export function JournalToday({ userId }: JournalTodayProps) {
  const [loaded, setLoaded] = useState(false)
  const [phase, setPhase] = useState<Phase>(decideInitialPhase)

  // 朝セクション（始まり・予定・タグ）
  const [scheduleNotes, setScheduleNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [savingMorning, setSavingMorning] = useState(false)

  // 夜セクション（気分・天気・振り返り）
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [celebration, setCelebration] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // 初期データロード
  useEffect(() => {
    if (!userId) {
      setLoaded(true)  // eslint-disable-line react-hooks/set-state-in-effect
      return
    }
    let cancelled = false
    ;(async () => {
      const j = await fetchJournalByDate(userId, todayKey())
      if (cancelled) return
      if (j) {
        if (j.mood) setMood(j.mood as Mood)
        if (j.weather) setWeather(j.weather as Weather)
        if (j.schedule_notes) setScheduleNotes(j.schedule_notes)
        if (j.evening_reflection) setReflection(j.evening_reflection)
        if (j.tags) setTags(j.tags)
      }
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId])

  // 朝の保存 CTA: schedule_notes か tags があれば有効
  const canSaveMorning = !!(scheduleNotes.trim() || tags.length > 0)
  // 夜の保存 CTA は気分・天気・振り返り のどれかが入ってれば有効
  const canSaveEvening = !!(mood !== null || weather !== null || reflection.trim())

  const saveDb = async (overrides: Partial<DailyJournal> = {}) => {
    if (!userId) return
    const j: DailyJournal = {
      user_id: userId,
      date: todayKey(),
      mood,
      weather,
      morning_memo: null,
      schedule_notes: scheduleNotes.trim() || null,
      evening_reflection: reflection.trim() || null,
      ai_summary: null,
      tags,
      ...overrides,
    }
    const { error: dbErr } = await upsertJournal(j)
    if (dbErr) {
      console.warn('JournalToday save:', dbErr)
      setError(t('journal.errorGeneric'))
    }
  }

  const handleSaveMorning = async () => {
    if (!canSaveMorning || savingMorning) return
    setError(null)
    setSavingMorning(true)
    await saveDb()
    setSavingMorning(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const handleSaveEvening = async () => {
    setSaving(true)
    setError(null)
    await saveDb()
    setSaving(false)
    setCelebration(true)
  }

  if (!loaded) return null

  return (
    <div className="journal-today">
      {/* Phase switcher */}
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

      {phase === 'morning' ? (
        <div className="journal-today__phase">
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

          <div className="journal-tags-compact">
            <div className="journal-section__label journal-section__label--sm">
              {t('journal.tagsLabel')}
              <span className="journal-section__hint">{t('journal.tagsAutoHint')}</span>
            </div>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder={t('journal.tagsPlaceholder')}
            />
          </div>

          <button
            type="button"
            className="journal-summarize-btn"
            disabled={!canSaveMorning || savingMorning}
            onClick={handleSaveMorning}
          >
            {savingMorning ? (
              <>
                <span className="journal-spinner" aria-hidden="true" />
                <span>{t('journal.saveMorningRunning')}</span>
              </>
            ) : (
              <span>{t('journal.saveMorning')}</span>
            )}
          </button>

          {error && <div className="journal-error">{error}</div>}

          {!userId && (
            <div className="journal-login-hint">{t('journal.loginToSave')}</div>
          )}
        </div>
      ) : (
        <div className="journal-today__phase">
          {/* 朝に書いたメモ (任意・存在時のみ) */}
          {scheduleNotes.trim() && (
            <div className="journal-summary-card journal-summary-card--compact" role="region">
              <div className="journal-summary-card__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
                <span>{t('journal.morningRecap')}</span>
              </div>
              <div className="journal-summary-card__body">{scheduleNotes}</div>
            </div>
          )}

          {/* 今日の気分（1 日を振り返って） */}
          <div>
            <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
            <MoodSelector value={mood} onChange={setMood} disabled={saving} />
          </div>

          {/* 今日の天気 */}
          <div>
            <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
            <WeatherSelector value={weather} onChange={setWeather} disabled={saving} />
          </div>

          {/* 今日アプリでやったこと */}
          <div>
            <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.activityTitle')}</div>
            <JournalActivityList date={todayKey()} />
          </div>

          {/* 振り返り */}
          <div>
            <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.eveningReflection')}</div>
            <VoiceTextarea
              value={reflection}
              onChange={setReflection}
              placeholder={t('journal.eveningPlaceholder')}
              ariaLabel={t('journal.eveningReflection')}
              minHeight={140}
              enableCleanup
              showVoiceHint
            />
          </div>

          <button
            type="button"
            className="journal-summarize-btn"
            onClick={handleSaveEvening}
            disabled={!canSaveEvening || saving}
          >
            {saving ? t('common.loading') : t('journal.saveEvening')}
          </button>

          {error && <div className="journal-error">{error}</div>}

          {!userId && (
            <div className="journal-login-hint">{t('journal.loginToSave')}</div>
          )}
        </div>
      )}

      {savedToast && (
        <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
      )}

      {celebration && (
        <CelebrationOverlay onClose={() => setCelebration(false)} />
      )}
    </div>
  )
}

function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="journal-celebration" role="dialog" aria-modal="true" aria-label={t('journal.eveningCelebrationTitle')}>
      <div className="journal-celebration__confetti" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`journal-celebration__piece journal-celebration__piece--${i % 6}`} />
        ))}
      </div>
      <div className="journal-celebration__card">
        <div className="journal-celebration__icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="journal-celebration__title">{t('journal.eveningCelebrationTitle')}</div>
        <div className="journal-celebration__body">{t('journal.eveningCelebrationBody')}</div>
        <button
          type="button"
          className="journal-summarize-btn"
          onClick={onClose}
        >
          {t('journal.eveningCelebrationClose')}
        </button>
      </div>
    </div>
  )
}
