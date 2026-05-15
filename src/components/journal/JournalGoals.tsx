import { useEffect, useRef, useState } from 'react'
import { fetchGoal, upsertGoal, fetchGoalReviews, insertGoalReview, fetchJournalsBetween } from './journalDb'
import { goalFeedback } from './journalApi'
import { dateRangeFor, periodKeyFor } from './types'
import type { Goal, GoalReview, PeriodType } from './types'
import { SparkleIcon } from './MoodWeatherIcons'
import { t } from '../../i18n'

interface JournalGoalsProps {
  userId: string
  assistantName: string
}

const PERIOD_TYPES: PeriodType[] = ['daily', 'weekly', 'monthly', 'yearly']

const PERIOD_LABEL_KEY: Record<PeriodType, string> = {
  daily:   'journal.periodDaily',
  weekly:  'journal.periodWeekly',
  monthly: 'journal.periodMonthly',
  yearly:  'journal.periodYearly',
}

export function JournalGoals({ userId, assistantName }: JournalGoalsProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('weekly')
  // periodKey は periodType から派生する値なので useState ではなく直接計算する
  const periodKey = periodKeyFor(periodType)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="journal-subtabs" role="tablist" aria-label={t('journal.goalsPeriodTabs')}>
        {PERIOD_TYPES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={periodType === p}
            className={`journal-subtab ${periodType === p ? 'journal-subtab--active' : ''}`}
            onClick={() => setPeriodType(p)}
          >
            {t(PERIOD_LABEL_KEY[p])}
          </button>
        ))}
      </div>

      <GoalForPeriod
        userId={userId}
        assistantName={assistantName}
        periodType={periodType}
        periodKey={periodKey}
      />
    </div>
  )
}

interface GoalForPeriodProps {
  userId: string
  assistantName: string
  periodType: PeriodType
  periodKey: string
}

function GoalForPeriod({ userId, assistantName, periodType, periodKey }: GoalForPeriodProps) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reviews, setReviews] = useState<GoalReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // AI フィードバック中の経過秒数（タイムアウト表示用）
  const [elapsedSec, setElapsedSec] = useState(0)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const g = await fetchGoal(userId, periodType, periodKey)
      if (cancelled) return
      setGoal(g)
      setTitle(g?.title ?? '')
      setDescription(g?.description ?? '')
      if (g) {
        const r = await fetchGoalReviews(g.id)
        if (cancelled) return
        setReviews(r)
      } else {
        setReviews([])
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, periodType, periodKey])

  useEffect(() => () => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    const { goal: saved, error: err } = await upsertGoal({
      user_id: userId,
      period_type: periodType,
      period_key: periodKey,
      title: title.trim(),
      description: description.trim() || null,
    })
    setSaving(false)
    if (err) { setError(t('journal.errorGeneric')); return }
    if (saved) setGoal(saved)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const handleAiFeedback = async () => {
    if (!goal || generating) return
    setGenerating(true)
    setError(null)
    setElapsedSec(0)
    const start0 = Date.now()
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start0) / 1000))
    }, 1000)
    try {
      const { start, end } = dateRangeFor(periodType, periodKey)
      const journals = await fetchJournalsBetween(userId, start, end)
      const { feedback, error: apiErr } = await goalFeedback({
        goal: { periodType, title: goal.title, description: goal.description ?? null },
        journals: journals.map((j) => ({
          date: j.date,
          mood: j.mood,
          weather: j.weather,
          schedule_notes: j.schedule_notes,
          evening_reflection: j.evening_reflection,
        })),
        assistantName,
      })
      if (apiErr) { setError(t('journal.errorGeneric')); return }
      const { review, error: insErr } = await insertGoalReview({
        goal_id: goal.id,
        user_id: userId,
        review_text: null,
        ai_feedback: (feedback || '').trim() || null,
      })
      if (insErr) { setError(t('journal.errorGeneric')); return }
      if (review) setReviews((rs) => [review, ...rs])
    } finally {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
      setGenerating(false)
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</div>
  }

  return (
    <div className="journal-goal-card">
      <div className="journal-section__label">
        {goal ? t('journal.currentGoal') : t('journal.setGoalPlaceholder')}
      </div>

      <input
        type="text"
        className="journal-goal-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('journal.goalTitlePlaceholder')}
        aria-label={t('journal.goalTitle')}
      />

      <textarea
        className="journal-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('journal.goalDescPlaceholder')}
        style={{ minHeight: 80, paddingRight: 14 }}
        aria-label={t('journal.goalDescription')}
      />

      {/* AI フィードバックを主 CTA、保存を副 CTA に。ホーム CTA との階層を揃える。 */}
      {goal && (
        <button
          type="button"
          className={`journal-summarize-btn ${generating ? 'journal-summarize-btn--working' : ''}`}
          onClick={handleAiFeedback}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="journal-spinner" aria-hidden="true" />
              <span>
                {t('journal.goalFeedbackGenerating')}
                {elapsedSec >= 5 ? ` (${elapsedSec}s)` : ''}
              </span>
            </>
          ) : (
            <>
              <SparkleIcon size={16} />
              <span>{t('journal.goalFeedbackCta', { name: assistantName })}</span>
            </>
          )}
        </button>
      )}

      <button
        type="button"
        className="journal-summarize-btn journal-summarize-btn--secondary"
        onClick={handleSave}
        disabled={!title.trim() || saving}
      >
        {saving ? t('common.loading') : t('common.save')}
      </button>

      {error && <div style={{ fontSize: 13, color: 'var(--md-sys-color-error)' }}>{error}</div>}

      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <div className="journal-modal__section-label">{t('journal.feedbackHistory')}</div>
          {reviews.map((r) => (
            <div key={r.id} className="journal-summary-card">
              <div className="journal-summary-card__title">
                <SparkleIcon size={12} />
                <span>{new Date(r.reviewed_at).toLocaleDateString()}</span>
              </div>
              <div className="journal-summary-card__body">{r.ai_feedback || ''}</div>
            </div>
          ))}
        </div>
      )}

      {savedToast && (
        <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
      )}
    </div>
  )
}
