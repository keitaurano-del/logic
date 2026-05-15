import { useEffect, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { todayKey } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { JournalActivityList } from './JournalActivityList'
import { SparkleIcon } from './MoodWeatherIcons'
import { fetchJournalByDate, upsertJournal } from './journalDb'
import { summarizeJournal } from './journalApi'
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

export function JournalToday({ userId, assistantName }: JournalTodayProps) {
  const [loaded, setLoaded] = useState(false)
  const [phase, setPhase] = useState<Phase>(decideInitialPhase)

  // 朝セクション（意図・予定・タグ）
  const [scheduleNotes, setScheduleNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 夜セクション（気分・天気・振り返り）
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

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
        if (j.ai_summary) setSummary(j.ai_summary)
        if (j.tags) setTags(j.tags)
      }
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId])

  // 朝の要約 CTA は schedule_notes / tags があれば有効
  const canGenerate = !!(scheduleNotes.trim() || tags.length > 0)
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
      ai_summary: summary || null,
      tags,
      ...overrides,
    }
    const { error: dbErr } = await upsertJournal(j)
    if (dbErr) console.warn('JournalToday save:', dbErr)
  }

  // 朝のサマリー: scheduleNotes + tags を中心に。mood/weather は朝時点で未入力なので渡さない
  // AI が tags も提案するので、ユーザーが手動で入れたタグとマージする
  const handleSummarize = async () => {
    if (!canGenerate || isGenerating) return
    setError(null)
    setIsGenerating(true)
    try {
      const { summary: newSummary, followUpQuestion, suggestedTags, error: apiErr } = await summarizeJournal({
        mood: null,
        weather: null,
        scheduleNotes: scheduleNotes.trim() || null,
        assistantName,
      })
      if (apiErr) {
        setError(t('journal.errorGeneric'))
        return
      }
      const finalSummary = (newSummary || '').trim()
      const finalFollow = (followUpQuestion || '').trim()
      // 既存タグ + AI 提案タグ をマージ（重複除去 + 最大 8 個）
      const merged = [...tags]
      for (const tag of (suggestedTags ?? [])) {
        if (!merged.includes(tag) && merged.length < 8) merged.push(tag)
      }
      setSummary(finalSummary)
      setFollowUp(finalFollow)
      setTags(merged)
      await saveDb({ ai_summary: finalSummary || null, tags: merged })
    } catch (e) {
      console.warn('summarize error:', e)
      setError(t('journal.errorGeneric'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveEvening = async () => {
    setSaving(true)
    await saveDb()
    setSaving(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
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
          <span className="journal-phase-tab__emoji" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </span>
          <span>{t('journal.phaseMorning')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={phase === 'evening'}
          className={`journal-phase-tab ${phase === 'evening' ? 'journal-phase-tab--active' : ''}`}
          onClick={() => setPhase('evening')}
        >
          <span className="journal-phase-tab__emoji" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
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

          <div>
            <div className="journal-section__label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('journal.tagsLabel')}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{t('journal.tagsAutoHint')}</span>
            </div>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder={t('journal.tagsPlaceholder')}
            />
          </div>

          <button
            type="button"
            className={`journal-summarize-btn ${isGenerating ? 'journal-summarize-btn--working' : ''}`}
            disabled={!canGenerate || isGenerating}
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

          {error && <div className="journal-error">{error}</div>}

          {summary && (
            <div className="journal-summary-card" role="region" aria-live="polite">
              <div className="journal-summary-card__title">
                <SparkleIcon size={14} />
                <span>{t('journal.summaryCardTitle', { name: assistantName })}</span>
              </div>
              <div className="journal-summary-card__body">{summary}</div>
              {followUp && (
                <div className="journal-followup">
                  <div className="journal-followup__label">{t('journal.followUpLabel')}</div>
                  <div className="journal-followup__body">{followUp}</div>
                </div>
              )}
            </div>
          )}

          {!userId && (
            <div className="journal-login-hint">{t('journal.loginToSave')}</div>
          )}
        </div>
      ) : (
        <div className="journal-today__phase">
          {/* 朝のリキャップ (任意・存在時のみ) */}
          {summary && (
            <div className="journal-summary-card journal-summary-card--compact" role="region">
              <div className="journal-summary-card__title">
                <SparkleIcon size={14} />
                <span>{t('journal.morningRecap')}</span>
              </div>
              <div className="journal-summary-card__body">{summary}</div>
              {followUp && (
                <div className="journal-followup">
                  <div className="journal-followup__label">{t('journal.followUpLabel')}</div>
                  <div className="journal-followup__body">{followUp}</div>
                </div>
              )}
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

          {!userId && (
            <div className="journal-login-hint">{t('journal.loginToSave')}</div>
          )}
        </div>
      )}

      {savedToast && (
        <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
      )}
    </div>
  )
}
