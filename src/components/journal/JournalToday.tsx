import { useEffect, useState } from 'react'
import type { DailyJournal, Mood, Weather } from './types'
import { todayKey } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { StreakBadge } from './StreakBadge'
import { MoodSparkline } from './MoodSparkline'
import { SparkleIcon } from './MoodWeatherIcons'
import { fetchJournalByDate, upsertJournal, fetchRecentJournals, fetchJournalStreak } from './journalDb'
import { summarizeJournal, cleanupText } from './journalApi'
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
  const [tasks, setTasks] = useState<string[]>([])
  const [taskDone, setTaskDone] = useState<Record<number, boolean>>({})
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [intentLocked, setIntentLocked] = useState(false)

  // 夜セクション（気分・天気・振り返り）
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [reflection, setReflection] = useState('')
  const [reflectionLocked, setReflectionLocked] = useState(false)
  const [isPolishingReflection, setIsPolishingReflection] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  // streak + recent
  const [streak, setStreak] = useState(0)
  const [recent, setRecent] = useState<DailyJournal[]>([])

  const [error, setError] = useState<string | null>(null)

  // 初期データロード
  useEffect(() => {
    if (!userId) {
      setLoaded(true)  // eslint-disable-line react-hooks/set-state-in-effect
      return
    }
    let cancelled = false
    ;(async () => {
      const [j, r, s] = await Promise.all([
        fetchJournalByDate(userId, todayKey()),
        fetchRecentJournals(userId, 30),
        fetchJournalStreak(userId),
      ])
      if (cancelled) return
      if (j) {
        if (j.mood) setMood(j.mood as Mood)
        if (j.weather) setWeather(j.weather as Weather)
        if (j.schedule_notes) {
          setScheduleNotes(j.schedule_notes)
          // 既に内容があれば lock 状態で開始（読みやすさ重視）
          setIntentLocked(true)
        }
        if (j.evening_reflection) {
          setReflection(j.evening_reflection)
          setReflectionLocked(true)
        }
        if (j.ai_summary) setSummary(j.ai_summary)
        if (j.tags) setTags(j.tags)
      }
      setRecent(r)
      setStreak(s)
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId])

  // 「整える」CTA は schedule_notes / tags があれば有効
  const canOrganize = !!(scheduleNotes.trim() || tags.length > 0)
  // 夜の保存 CTA は気分・天気・振り返り のどれかが入ってれば有効
  const canSaveEvening = !!(mood !== null || weather !== null || reflection.trim())

  const refreshAfterSave = async () => {
    if (!userId) return
    const [r, s] = await Promise.all([
      fetchRecentJournals(userId, 30),
      fetchJournalStreak(userId),
    ])
    setRecent(r)
    setStreak(s)
  }

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
    await refreshAfterSave()
  }

  // 「整える」: cleanup（文章整形）+ summarize（要約・タグ・タスク抽出）を並列実行
  const handleOrganize = async () => {
    if (!canOrganize || isOrganizing) return
    setError(null)
    setIsOrganizing(true)
    try {
      const sourceText = scheduleNotes.trim()
      const [cleanupRes, summaryRes] = await Promise.all([
        sourceText ? cleanupText(sourceText) : Promise.resolve({ cleaned: sourceText, error: undefined } as { cleaned?: string; error?: string }),
        summarizeJournal({
          mood: null,
          weather: null,
          scheduleNotes: sourceText || null,
          assistantName,
        }),
      ])

      if (summaryRes.error) {
        setError(t('journal.errorGeneric'))
        return
      }

      const cleanedText = (cleanupRes.cleaned || sourceText).trim()
      const finalSummary = (summaryRes.summary || '').trim()
      const finalFollow = (summaryRes.followUpQuestion || '').trim()
      const finalTasks = (summaryRes.extractedTasks ?? []).map((s) => s.trim()).filter(Boolean)

      // 既存タグ + AI 提案タグ をマージ（重複除去 + 最大 8 個）
      const merged = [...tags]
      for (const tag of (summaryRes.suggestedTags ?? [])) {
        if (!merged.includes(tag) && merged.length < 8) merged.push(tag)
      }

      // 整え後の本文に置き換え + サマリー / タグ / タスクを反映
      if (cleanedText) setScheduleNotes(cleanedText)
      setSummary(finalSummary)
      setFollowUp(finalFollow)
      setTags(merged)
      setTasks(finalTasks)
      setTaskDone({})
      setIntentLocked(true)

      // schedule_notes は cleanup 済みのものを保存
      await saveDb({
        schedule_notes: cleanedText || null,
        ai_summary: finalSummary || null,
        tags: merged,
      })
    } catch (e) {
      console.warn('organize error:', e)
      setError(t('journal.errorGeneric'))
    } finally {
      setIsOrganizing(false)
    }
  }

  // 夜の振り返り：cleanup のみ実行して lock
  const handlePolishReflection = async () => {
    if (!reflection.trim() || isPolishingReflection) return
    setError(null)
    setIsPolishingReflection(true)
    try {
      const { cleaned, error: apiErr } = await cleanupText(reflection)
      if (apiErr) {
        setError(t('journal.cleanupError'))
        return
      }
      const final = (cleaned || reflection).trim()
      if (final) setReflection(final)
      setReflectionLocked(true)
      await saveDb({ evening_reflection: final || null })
    } catch (e) {
      console.warn('polish reflection error:', e)
      setError(t('journal.cleanupError'))
    } finally {
      setIsPolishingReflection(false)
    }
  }

  const handleSaveEvening = async () => {
    setSaving(true)
    await saveDb()
    setSaving(false)
    setReflectionLocked(true)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const toggleTask = (idx: number) => {
    setTaskDone((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  if (!loaded) return null

  return (
    <div className="journal-today">
      {/* ストリーク + ミニグラフ */}
      <div className="journal-today__strip">
        <StreakBadge streak={streak} size="sm" />
        <MoodSparkline journals={recent} days={30} />
      </div>

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
              enableCleanup={!intentLocked}
              showVoiceHint={!intentLocked}
              locked={intentLocked}
              onUnlock={() => setIntentLocked(false)}
              lockedTitle={t('journal.intentReadingTitle')}
            />
          </div>

          {!intentLocked && (
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
          )}

          {!intentLocked && (
            <div className="journal-organize-cta-wrap">
              <button
                type="button"
                className={`journal-summarize-btn ${isOrganizing ? 'journal-summarize-btn--working' : ''}`}
                disabled={!canOrganize || isOrganizing}
                onClick={handleOrganize}
                aria-label={t('journal.organizeAria')}
              >
                {isOrganizing ? (
                  <>
                    <span className="journal-spinner" aria-hidden="true" />
                    <span>{t('journal.organizing')}</span>
                  </>
                ) : (
                  <>
                    <SparkleIcon size={18} />
                    <span>{t('journal.organizeCta')}</span>
                  </>
                )}
              </button>
              {!isOrganizing && (
                <div className="journal-organize-cta__hint">{t('journal.organizeHint')}</div>
              )}
            </div>
          )}

          {error && <div className="journal-error">{error}</div>}

          {/* サマリーカード — 編集中も表示し続ける */}
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

          {/* 抽出されたタスク — 整え済み（summary がある）なら編集中も表示 */}
          {summary && (
            <div className="journal-task-card" role="region" aria-label={t('journal.tasksCardTitle')}>
              <div className="journal-task-card__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>{t('journal.tasksCardTitle')}</span>
              </div>
              {tasks.length > 0 ? (
                <ul className="journal-task-list">
                  {tasks.map((task, idx) => {
                    const done = !!taskDone[idx]
                    return (
                      <li key={idx} className={`journal-task-item ${done ? 'journal-task-item--done' : ''}`}>
                        <button
                          type="button"
                          className="journal-task-check"
                          onClick={() => toggleTask(idx)}
                          aria-label={done ? t('journal.taskCompletedAria') : t('journal.taskIncompleteAria')}
                          aria-pressed={done}
                        >
                          {done && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                        <span className="journal-task-text">{task}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="journal-task-card__empty">{t('journal.tasksEmpty')}</div>
              )}
              <div className="journal-task-card__hint">{t('journal.tasksSessionOnlyHint')}</div>
            </div>
          )}

          {/* ロック中はタグ一覧を読み取り表示で残しておく */}
          {intentLocked && tags.length > 0 && (
            <div className="journal-tag-readonly-row" aria-label={t('journal.tagsLabel')}>
              {tags.map((tag) => (
                <span key={tag} className="journal-tag-readonly-chip">{tag}</span>
              ))}
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

          {/* 振り返り */}
          <div>
            <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.eveningReflection')}</div>
            <VoiceTextarea
              value={reflection}
              onChange={setReflection}
              placeholder={t('journal.eveningPlaceholder')}
              ariaLabel={t('journal.eveningReflection')}
              minHeight={140}
              enableCleanup={!reflectionLocked}
              showVoiceHint={!reflectionLocked}
              locked={reflectionLocked}
              onUnlock={() => setReflectionLocked(false)}
              lockedTitle={t('journal.reflectionReadingTitle')}
            />
          </div>

          {/* 振り返りが unlocked かつ内容がある時だけ「整える」軽量 CTA */}
          {!reflectionLocked && reflection.trim() && (
            <button
              type="button"
              className="journal-summarize-btn journal-summarize-btn--secondary"
              onClick={handlePolishReflection}
              disabled={isPolishingReflection}
            >
              {isPolishingReflection ? (
                <>
                  <span className="journal-spinner journal-spinner--brand" aria-hidden="true" />
                  <span>{t('journal.organizing')}</span>
                </>
              ) : (
                <>
                  <SparkleIcon size={16} />
                  <span>{t('journal.organizeShort')}</span>
                </>
              )}
            </button>
          )}

          {error && <div className="journal-error">{error}</div>}

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
