import { useEffect, useRef, useState } from 'react'
import { fetchCurrentGoalsAllPeriods, fetchRecentJournals } from './journalDb'
import { holisticFeedback } from './journalApi'
import { displayMood, displayWeather, periodKeyFor } from './types'
import type { PeriodType } from './types'
import { SparkleIcon } from './MoodWeatherIcons'
import { XIcon } from '../../icons'
import { loadProgress } from '../../progressStore'
import { getLessonStreak, getTotalStudyDays, getXpLogThisMonth } from '../../stats'
import { t } from '../../i18n'

interface JournalAssistantSheetProps {
  userId: string
  assistantName: string
  onClose: () => void
}

export function JournalAssistantSheet({ userId, assistantName, onClose }: JournalAssistantSheetProps) {
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    let cancelled = false
    const start0 = Date.now()
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start0) / 1000))
    }, 1000)

    ;(async () => {
      try {
        const keys = {
          weekly:  periodKeyFor('weekly'),
          monthly: periodKeyFor('monthly'),
          yearly:  periodKeyFor('yearly'),
        }
        const [goalsByPeriod, recentJournals] = await Promise.all([
          fetchCurrentGoalsAllPeriods(userId, keys),
          fetchRecentJournals(userId, 30),
        ])

        const goals: Array<{ periodType: PeriodType; title: string; description: string | null }> = [
          ...goalsByPeriod.yearly,
          ...goalsByPeriod.monthly,
          ...goalsByPeriod.weekly,
        ].map((g) => ({
          periodType: g.period_type,
          title: g.title,
          description: g.description ?? null,
        }))

        const progress = loadProgress()
        const progressSummary: Record<string, { completed: number; total: number }> = {}
        for (const [category, p] of Object.entries(progress)) {
          if (p && typeof p === 'object') {
            progressSummary[category] = {
              completed: p.completedCards ?? 0,
              total: p.totalCards ?? 0,
            }
          }
        }

        const fermiCount = getXpLogThisMonth().filter((e) => e.event === 'fermi').length
        const lessonStreak = getLessonStreak()
        const studyDays = getTotalStudyDays()

        const { feedback: fb, error: apiErr } = await holisticFeedback({
          goals,
          recentJournals: recentJournals.map((j) => ({
            date: j.date,
            mood: displayMood(j),
            weather: displayWeather(j),
            schedule_notes: j.schedule_notes,
            evening_reflection: j.evening_reflection,
          })),
          progressSummary,
          fermiCount,
          lessonStreak,
          studyDays,
          assistantName,
        })

        if (cancelled) return
        if (apiErr) {
          setError(t('journal.assistantError'))
          return
        }
        setFeedback((fb || '').trim())
      } catch (e) {
        console.warn('holistic feedback error:', e)
        if (!cancelled) setError(t('journal.assistantError'))
      } finally {
        if (!cancelled) setLoading(false)
        if (elapsedTimerRef.current) {
          clearInterval(elapsedTimerRef.current)
          elapsedTimerRef.current = null
        }
      }
    })()

    return () => {
      cancelled = true
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
    }
  }, [userId, assistantName])

  return (
    <div className="journal-search-overlay" role="dialog" aria-modal="true" aria-label={t('journal.assistantSheetTitle')}>
      <div className="journal-search-overlay__sheet">
        <div className="journal-search-overlay__head">
          <div className="journal-search-overlay__title">{t('journal.assistantSheetTitle')}</div>
          <button
            type="button"
            className="journal-search-overlay__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <XIcon width={20} height={20} />
          </button>
        </div>
        <div className="journal-search-overlay__body">
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
              <span className="journal-spinner" aria-hidden="true" />
              <span>
                {t('journal.assistantGenerating')}
                {elapsedSec >= 5 ? ` (${elapsedSec}s)` : ''}
              </span>
            </div>
          )}

          {!loading && error && (
            <div className="journal-error">{error}</div>
          )}

          {!loading && !error && feedback && (
            <div className="journal-summary-card">
              <div className="journal-summary-card__title">
                <SparkleIcon size={14} />
                <span>{t('journal.assistantSummaryLabel', { name: assistantName })}</span>
              </div>
              <div className="journal-summary-card__body">{feedback}</div>
            </div>
          )}

          {!loading && !error && !feedback && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('journal.assistantEmpty')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
