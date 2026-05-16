import { useEffect, useRef, useState } from 'react'
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  fetchGoalReviews,
  insertGoalReview,
  fetchJournalsBetween,
} from './journalDb'
import { goalFeedback } from './journalApi'
import { dateRangeFor, periodKeyFor, GOAL_CATEGORIES } from './types'
import type { Goal, GoalCategory, GoalReview, PeriodType } from './types'
import { SparkleIcon } from './MoodWeatherIcons'
import { ConfirmSheet } from './ConfirmSheet'
import { t } from '../../i18n'

interface JournalGoalsProps {
  userId: string
  assistantName: string
  initialPeriod?: PeriodType
}

const PERIOD_TYPES: PeriodType[] = ['weekly', 'monthly', 'yearly']

const PERIOD_LABEL_KEY: Record<PeriodType, string> = {
  weekly:  'journal.periodWeekly',
  monthly: 'journal.periodMonthly',
  yearly:  'journal.periodYearly',
}

const CATEGORY_LABEL_KEY: Record<GoalCategory, string> = {
  work:    'journal.goalCategoryWork',
  private: 'journal.goalCategoryPrivate',
}

export function JournalGoals({ userId, assistantName, initialPeriod }: JournalGoalsProps) {
  const [periodType, setPeriodType] = useState<PeriodType>(initialPeriod ?? 'weekly')
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

      <GoalsForPeriod
        userId={userId}
        assistantName={assistantName}
        periodType={periodType}
        periodKey={periodKey}
      />
    </div>
  )
}

interface GoalsForPeriodProps {
  userId: string
  assistantName: string
  periodType: PeriodType
  periodKey: string
}

function GoalsForPeriod({ userId, assistantName, periodType, periodKey }: GoalsForPeriodProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<{ kind: 'create' } | { kind: 'edit'; goal: Goal } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const list = await fetchGoals(userId, periodType, periodKey)
      if (cancelled) return
      setGoals(list)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, periodType, periodKey])

  const handleCreated = (g: Goal) => {
    setGoals((gs) => [...gs, g])
    setEditorMode(null)
  }
  const handleUpdated = (g: Goal) => {
    setGoals((gs) => gs.map((x) => (x.id === g.id ? g : x)))
    setEditorMode(null)
  }
  const handleDeleted = (id: string) => {
    setGoals((gs) => gs.filter((x) => x.id !== id))
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {goals.length === 0 && !editorMode && (
        <div className="journal-goal-card" style={{ color: 'var(--text-muted)', fontSize: 13, alignItems: 'center', textAlign: 'center' }}>
          {t('journal.goalsEmptyForPeriod')}
        </div>
      )}

      {goals.map((g) => (
        editorMode?.kind === 'edit' && editorMode.goal.id === g.id ? (
          <GoalEditor
            key={g.id}
            userId={userId}
            periodType={periodType}
            periodKey={periodKey}
            existing={g}
            onSaved={handleUpdated}
            onCancel={() => setEditorMode(null)}
          />
        ) : (
          <GoalCard
            key={g.id}
            goal={g}
            assistantName={assistantName}
            periodType={periodType}
            periodKey={periodKey}
            userId={userId}
            onEdit={() => setEditorMode({ kind: 'edit', goal: g })}
            onDelete={() => handleDeleted(g.id)}
          />
        )
      ))}

      {editorMode?.kind === 'create' && (
        <GoalEditor
          userId={userId}
          periodType={periodType}
          periodKey={periodKey}
          existing={null}
          onSaved={handleCreated}
          onCancel={() => setEditorMode(null)}
        />
      )}

      {!editorMode && (
        <button
          type="button"
          className="journal-summarize-btn journal-summarize-btn--secondary"
          onClick={() => setEditorMode({ kind: 'create' })}
        >
          {t('journal.addGoalCta')}
        </button>
      )}
    </div>
  )
}

// ─── Goal card with feedback ──────────────────────────────────────
interface GoalCardProps {
  goal: Goal
  assistantName: string
  periodType: PeriodType
  periodKey: string
  userId: string
  onEdit: () => void
  onDelete: () => void
}

function GoalCard({ goal, assistantName, periodType, periodKey, userId, onEdit, onDelete }: GoalCardProps) {
  const [reviews, setReviews] = useState<GoalReview[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await fetchGoalReviews(goal.id)
      if (cancelled) return
      setReviews(r)
      setReviewsLoaded(true)
    })()
    return () => { cancelled = true }
  }, [goal.id])

  useEffect(() => () => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
  }, [])

  const handleAiFeedback = async () => {
    if (generating) return
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

  const handleDeleteConfirmed = async () => {
    setConfirmDelete(false)
    const { error: delErr } = await deleteGoal(goal.id)
    if (delErr) { setError(t('journal.errorGeneric')); return }
    onDelete()
  }

  return (
    <div className="journal-goal-card">
      <div className="journal-goal-card__header">
        <div className="journal-goal-card__title">{goal.title}</div>
        {goal.category && (
          <CategoryChip category={goal.category} />
        )}
      </div>

      {goal.description && (
        <div className="journal-goal-card__desc">{goal.description}</div>
      )}

      <div className="journal-goal-card__actions">
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

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="journal-goal-card__icon-btn"
            onClick={onEdit}
            aria-label={t('journal.editGoalAria', { title: goal.title })}
          >
            {t('journal.editGoalCta')}
          </button>
          <button
            type="button"
            className="journal-goal-card__icon-btn journal-goal-card__icon-btn--danger"
            onClick={() => setConfirmDelete(true)}
            aria-label={t('journal.deleteGoalAria', { title: goal.title })}
          >
            {t('journal.deleteGoalCta')}
          </button>
        </div>
      </div>

      {error && <div className="journal-error">{error}</div>}

      <ConfirmSheet
        open={confirmDelete}
        title={t('journal.deleteGoalConfirm')}
        description={goal.title}
        confirmLabel={t('journal.deleteGoalCta')}
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(false)}
      />

      {reviewsLoaded && reviews.length > 0 && (
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
    </div>
  )
}

// ─── Editor (create / edit) ───────────────────────────────────────
interface GoalEditorProps {
  userId: string
  periodType: PeriodType
  periodKey: string
  existing: Goal | null
  onSaved: (g: Goal) => void
  onCancel: () => void
}

function GoalEditor({ userId, periodType, periodKey, existing, onSaved, onCancel }: GoalEditorProps) {
  const [title, setTitle] = useState(existing?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [category, setCategory] = useState<GoalCategory | null>(existing?.category ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    if (existing) {
      const { goal, error: err } = await updateGoal(existing.id, {
        title: title.trim(),
        description: description.trim() || null,
        category,
      })
      setSaving(false)
      if (err || !goal) { setError(t('journal.errorGeneric')); return }
      onSaved(goal)
    } else {
      const { goal, error: err } = await createGoal({
        user_id: userId,
        period_type: periodType,
        period_key: periodKey,
        title: title.trim(),
        description: description.trim() || null,
        category,
      })
      setSaving(false)
      if (err || !goal) { setError(t('journal.errorGeneric')); return }
      onSaved(goal)
    }
  }

  return (
    <div className="journal-goal-card">
      <div className="journal-section__label">
        {existing ? t('journal.currentGoal') : t('journal.setGoalPlaceholder')}
      </div>

      {/* カテゴリ選択（仕事 / プライベート）。「指定なし」は clear ボタン */}
      <div>
        <div className="journal-section__label" style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>
          {t('journal.goalCategoryLabel')}
        </div>
        <div className="journal-goal-cat-row" role="radiogroup" aria-label={t('journal.goalCategoryLabel')}>
          {GOAL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              className={`journal-goal-cat-btn journal-goal-cat-btn--${c} ${category === c ? 'journal-goal-cat-btn--active' : ''}`}
              onClick={() => setCategory((cur) => (cur === c ? null : c))}
            >
              {t(CATEGORY_LABEL_KEY[c])}
            </button>
          ))}
          {category !== null && (
            <button
              type="button"
              className="journal-goal-cat-btn journal-goal-cat-btn--clear"
              onClick={() => setCategory(null)}
              aria-label={t('journal.goalCategoryNone')}
            >
              {t('journal.goalCategoryNone')}
            </button>
          )}
        </div>
        <div className="journal-goal-cat-hint">{t('journal.goalCategoryHint')}</div>
      </div>

      <input
        type="text"
        className="journal-goal-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('journal.goalTitlePlaceholder')}
        aria-label={t('journal.goalTitle')}
        autoFocus
      />

      <textarea
        className="journal-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('journal.goalDescPlaceholder')}
        style={{ minHeight: 80, paddingRight: 14 }}
        aria-label={t('journal.goalDescription')}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="journal-summarize-btn"
          onClick={handleSave}
          disabled={!title.trim() || saving}
          style={{ flex: 1 }}
        >
          {saving ? t('common.loading') : t('common.save')}
        </button>
        <button
          type="button"
          className="journal-summarize-btn journal-summarize-btn--secondary"
          onClick={onCancel}
          disabled={saving}
          style={{ flex: 1 }}
        >
          {t('journal.cancelCta')}
        </button>
      </div>

      {error && <div className="journal-error">{error}</div>}
    </div>
  )
}

// ─── Category chip ───────────────────────────────────────────────
export function CategoryChip({ category, compact = false }: { category: GoalCategory; compact?: boolean }) {
  return (
    <span className={`journal-goal-cat-chip journal-goal-cat-chip--${category} ${compact ? 'journal-goal-cat-chip--compact' : ''}`}>
      {t(CATEGORY_LABEL_KEY[category])}
    </span>
  )
}
