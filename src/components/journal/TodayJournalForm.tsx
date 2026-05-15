import { useEffect, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { todayKey } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { VoiceTextarea } from './VoiceTextarea'
import { SparkleIcon } from './MoodWeatherIcons'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { summarizeJournal } from './journalApi'
import { t } from '../../i18n'

interface TodayJournalFormProps {
  userId: string | null
  assistantName: string
}

export function TodayJournalForm({ userId, assistantName }: TodayJournalFormProps) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [scheduleNotes, setScheduleNotes] = useState('')
  const [summary, setSummary] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // 今日のジャーナルを取得して状態を復元
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true)
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
        if (j.ai_summary) setSummary(j.ai_summary)
      }
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId])

  const canSubmit = !!(mood !== null || weather !== null || scheduleNotes.trim())

  const handleSummarize = async () => {
    if (!canSubmit || isGenerating) return
    setError(null)
    setIsGenerating(true)
    try {
      const { summary: newSummary, error: apiErr } = await summarizeJournal({
        mood,
        weather,
        scheduleNotes: scheduleNotes.trim() || null,
        assistantName,
      })
      if (apiErr) {
        setError(t('journal.errorGeneric'))
        return
      }
      const final = (newSummary || '').trim()
      setSummary(final)

      // Supabase 保存（ログインユーザーのみ）
      if (userId) {
        const journal: DailyJournal = {
          user_id: userId,
          date: todayKey(),
          mood,
          weather,
          morning_memo: null,
          schedule_notes: scheduleNotes.trim() || null,
          evening_reflection: null,
          ai_summary: final || null,
        }
        const { error: dbErr } = await upsertJournal(journal)
        if (dbErr) console.warn('TodayJournalForm save:', dbErr)
      }
    } catch (e) {
      console.warn('summarize error:', e)
      setError(t('journal.errorGeneric'))
    } finally {
      setIsGenerating(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="journal-section">
      {/* mood */}
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
        <MoodSelector value={mood} onChange={setMood} disabled={isGenerating} />
      </div>

      {/* weather */}
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
        <WeatherSelector value={weather} onChange={setWeather} disabled={isGenerating} />
      </div>

      {/* schedule notes */}
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.scheduleLabel')}</div>
        <VoiceTextarea
          value={scheduleNotes}
          onChange={setScheduleNotes}
          placeholder={t('journal.schedulePlaceholder')}
          ariaLabel={t('journal.scheduleLabel')}
        />
      </div>

      {/* CTA */}
      <button
        type="button"
        className={`journal-summarize-btn ${isGenerating ? 'journal-summarize-btn--working' : ''}`}
        disabled={!canSubmit || isGenerating}
        onClick={handleSummarize}
      >
        {isGenerating ? (
          <>
            <span className="journal-spinner" aria-hidden="true" />
            <span>{t('journal.summarizing')}</span>
          </>
        ) : (
          <>
            <SparkleIcon size={18} />
            <span>{t('journal.summarizeCta', { name: assistantName })}</span>
          </>
        )}
      </button>

      {error && (
        <div style={{ fontSize: 13, color: 'var(--md-sys-color-error)' }}>{error}</div>
      )}

      {summary && (
        <div className="journal-summary-card" role="region" aria-live="polite">
          <div className="journal-summary-card__title">
            <SparkleIcon size={14} />
            <span>{t('journal.summaryCardTitle', { name: assistantName })}</span>
          </div>
          <div className="journal-summary-card__body">{summary}</div>
        </div>
      )}

      {!userId && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
          {t('journal.loginToSave')}
        </div>
      )}
    </div>
  )
}
