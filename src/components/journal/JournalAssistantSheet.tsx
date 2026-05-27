import { useEffect, useRef, useState } from 'react'
import { fetchCurrentGoalsAllPeriods, fetchRecentJournals, saveAssistantConversation } from './journalDb'
import { holisticFeedback } from './journalApi'
import { displayMood, displayWeather, periodKeyFor } from './types'
import type { PeriodType } from './types'
import { SparkleIcon } from './MoodWeatherIcons'
import { JournalRichText } from './JournalRichText'
import { XIcon } from '../../icons'
import { loadProgress } from '../../progressStore'
import { getLessonStreak, getTotalStudyDays, getXpLogThisMonth } from '../../stats'
import { getAllLessonsFlat } from '../../lessonData'
import { COURSES, getCourseById } from '../../courseData'
import type { Course } from '../../courseData'
import { t } from '../../i18n'

interface JournalAssistantSheetProps {
  userId: string
  assistantName: string
  onClose: () => void
  /** AI 推薦レッスンタップで呼び出される。未指定なら推薦カードを描画しない */
  onOpenLesson?: (lessonId: number) => void
  /** AI 推薦コースタップで呼び出される。未指定なら推薦カードを描画しない */
  onOpenCourse?: (category: string) => void
}

interface RecommendedLesson {
  id: number
  title: string
  category: string
}

interface RecommendedCourse {
  id: string
  title: string
  category: string
  image?: string
  lessonCount: number
}

// 全レッスンから AI に渡すための軽量カタログを作成する。
// データサイズ抑制のため title と category のみに絞る。
function buildLessonCatalog(): Array<{ id: number; title: string; category: string }> {
  const all = getAllLessonsFlat()
  const out: Array<{ id: number; title: string; category: string }> = []
  for (const key of Object.keys(all)) {
    const id = Number(key)
    if (!Number.isFinite(id) || id <= 0) continue
    const lesson = all[id]
    if (!lesson) continue
    const title = (lesson.title || '').trim()
    if (!title) continue
    out.push({ id, title, category: (lesson.category || '').trim() })
  }
  return out
}

// コース一覧を AI に渡すためのカタログを作成する。
function buildCourseCatalog(): Array<{ id: string; title: string; category: string; description: string; lessonCount: number }> {
  const out: Array<{ id: string; title: string; category: string; description: string; lessonCount: number }> = []
  for (const c of COURSES as Course[]) {
    if (!c?.id || !c?.title) continue
    out.push({
      id: c.id,
      title: (c.title || '').trim(),
      category: (c.category || '').trim(),
      description: (c.description || '').trim(),
      lessonCount: Array.isArray(c.lessonIds) ? c.lessonIds.length : 0,
    })
  }
  return out
}

export function JournalAssistantSheet({ userId, assistantName, onClose, onOpenLesson, onOpenCourse }: JournalAssistantSheetProps) {
  const [feedback, setFeedback] = useState<string>('')
  const [recommended, setRecommended] = useState<RecommendedLesson[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([])
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
        const lessonCatalog = buildLessonCatalog()
        const courseCatalog = buildCourseCatalog()

        const { feedback: fb, recommendedLessonIds, recommendedCourseIds, error: apiErr } = await holisticFeedback({
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
          lessonCatalog,
          courseCatalog,
        })

        if (cancelled) return
        if (apiErr) {
          setError(t('journal.assistantError'))
          return
        }
        setFeedback((fb || '').trim())

        // 推薦レッスン: ID → 表示用オブジェクトに解決。存在しないものはスキップ。
        const lessonMap = getAllLessonsFlat()
        const resolved: RecommendedLesson[] = []
        for (const id of recommendedLessonIds ?? []) {
          const lesson = lessonMap[id]
          if (!lesson) continue
          resolved.push({ id, title: lesson.title, category: lesson.category })
          if (resolved.length >= 2) break
        }
        setRecommended(resolved)

        // 推薦コース: ID → 表示用オブジェクトに解決。存在しないものはスキップ。
        const resolvedCourses: RecommendedCourse[] = []
        for (const courseId of recommendedCourseIds ?? []) {
          const course = getCourseById(courseId)
          if (!course) continue
          resolvedCourses.push({
            id: course.id,
            title: course.title,
            category: course.category,
            image: course.image,
            lessonCount: Array.isArray(course.lessonIds) ? course.lessonIds.length : 0,
          })
          if (resolvedCourses.length >= 1) break
        }
        setRecommendedCourses(resolvedCourses)

        // 会話履歴を永続化（後から見返せるようにする）。本文が空なら保存されない。
        // 失敗してもユーザー体験は止めない（履歴保存はベストエフォート）。
        void saveAssistantConversation(userId, {
          feedback: (fb || '').trim(),
          recommendedLessons: resolved,
          recommendedCourses: resolvedCourses,
        }).catch((err) => console.warn('saveAssistantConversation failed:', err))
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
              <JournalRichText className="journal-summary-card__body" text={feedback} />
            </div>
          )}

          {!loading && !error && feedback && recommended.length > 0 && onOpenLesson && (
            <div className="journal-recommended-lessons">
              <div className="journal-recommended-lessons__title">
                {t('journal.assistantRecommendedLessons')}
              </div>
              <div className="journal-recommended-lessons__list">
                {recommended.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    className="journal-recommended-lesson-card"
                    onClick={() => {
                      onOpenLesson(lesson.id)
                      onClose()
                    }}
                    aria-label={t('journal.assistantOpenLessonAria', { title: lesson.title })}
                  >
                    {lesson.category && (
                      <div className="journal-recommended-lesson-card__category">{lesson.category}</div>
                    )}
                    <div className="journal-recommended-lesson-card__title">{lesson.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && feedback && recommendedCourses.length > 0 && onOpenCourse && (
            <div className="journal-recommended-courses">
              <div className="journal-recommended-courses__title">
                {t('journal.assistantRecommendedCourses')}
              </div>
              <div className="journal-recommended-courses__list">
                {recommendedCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className="journal-recommended-course-card"
                    onClick={() => {
                      onOpenCourse(course.category)
                      onClose()
                    }}
                    aria-label={t('journal.assistantOpenCourseAria', { title: course.title })}
                  >
                    {course.image && (
                      <div className="journal-recommended-course-card__thumb">
                        <img src={course.image} alt="" loading="lazy" />
                      </div>
                    )}
                    <div className="journal-recommended-course-card__body">
                      {course.category && (
                        <div className="journal-recommended-course-card__category">{course.category}</div>
                      )}
                      <div className="journal-recommended-course-card__title">{course.title}</div>
                      {course.lessonCount > 0 && (
                        <div className="journal-recommended-course-card__meta">
                          {t('journal.assistantCourseLessonCount', { count: course.lessonCount })}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
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
