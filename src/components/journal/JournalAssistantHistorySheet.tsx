import { useEffect, useState } from 'react'
import { fetchAssistantConversations, deleteAssistantConversation } from './journalDb'
import { JournalRichText } from './JournalRichText'
import { SparkleIcon } from './MoodWeatherIcons'
import { XIcon, TrashIcon, ChevronDownIcon } from '../../icons'
import { t, getLocale } from '../../i18n'
import type { AssistantConversation } from './types'
import { resolveAssetUrl } from '../../lessonAssets'

interface JournalAssistantHistorySheetProps {
  userId: string
  assistantName: string
  onClose: () => void
  /** 推薦レッスンタップで呼び出される。未指定なら推薦レッスンを描画しない */
  onOpenLesson?: (lessonId: number) => void
  /** 推薦コースタップで呼び出される。未指定なら推薦コースを描画しない */
  onOpenCourse?: (category: string) => void
}

// 会話保存日時を表示用にフォーマットする（ja/en）。
function formatTimestamp(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  if (getLocale() === 'ja') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// 一覧の折りたたみ表示用の抜粋（markdown 記号を雑に剥がして 1 行に）。
function excerptOf(text: string): string {
  const plain = (text || '')
    .replace(/[#*_`>~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 70 ? `${plain.slice(0, 70)}…` : plain
}

export function JournalAssistantHistorySheet({
  userId,
  assistantName,
  onClose,
  onOpenLesson,
  onOpenCourse,
}: JournalAssistantHistorySheetProps) {
  const [items, setItems] = useState<AssistantConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchAssistantConversations(userId, 50)
        if (cancelled) return
        setItems(list)
        // 先頭（最新）の 1 件を初期展開しておく。
        if (list.length > 0 && list[0].id) setExpandedId(list[0].id)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id))
    if (expandedId === id) setExpandedId(null)
    await deleteAssistantConversation(id)
  }

  return (
    <div className="journal-search-overlay" role="dialog" aria-modal="true" aria-label={t('journal.assistantHistoryTitle')}>
      <div className="journal-search-overlay__sheet">
        <div className="journal-search-overlay__head">
          <div className="journal-search-overlay__title">{t('journal.assistantHistoryTitle')}</div>
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
            <div className="journal-recent__loading">{t('common.loading')}</div>
          )}

          {!loading && items.length === 0 && (
            <div className="journal-recent__empty">{t('journal.assistantHistoryEmpty')}</div>
          )}

          {!loading && items.length > 0 && (
            <div className="journal-assistant-history">
              {items.map((conv, idx) => {
                const expanded = !!conv.id && conv.id === expandedId
                return (
                  <div key={conv.id ?? `conv-${idx}`} className="journal-assistant-history__item">
                    <button
                      type="button"
                      className="journal-assistant-history__head"
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : (conv.id ?? null))}
                    >
                      <div className="journal-assistant-history__meta">
                        <span className="journal-assistant-history__date">{formatTimestamp(conv.created_at)}</span>
                        {!expanded && (
                          <span className="journal-assistant-history__excerpt">{excerptOf(conv.feedback)}</span>
                        )}
                      </div>
                      <ChevronDownIcon
                        width={18}
                        height={18}
                        className={`journal-assistant-history__chevron${expanded ? ' journal-assistant-history__chevron--open' : ''}`}
                      />
                    </button>

                    {expanded && (
                      <div className="journal-assistant-history__body">
                        <div className="journal-summary-card">
                          <div className="journal-summary-card__title">
                            <SparkleIcon size={14} />
                            <span>{t('journal.assistantSummaryLabel', { name: assistantName })}</span>
                          </div>
                          <JournalRichText className="journal-summary-card__body" text={conv.feedback} />
                        </div>

                        {conv.recommended_lessons.length > 0 && onOpenLesson && (
                          <div className="journal-recommended-lessons">
                            <div className="journal-recommended-lessons__title">
                              {t('journal.assistantRecommendedLessons')}
                            </div>
                            <div className="journal-recommended-lessons__list">
                              {conv.recommended_lessons.map((lesson) => (
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

                        {conv.recommended_courses.length > 0 && onOpenCourse && (
                          <div className="journal-recommended-courses">
                            <div className="journal-recommended-courses__title">
                              {t('journal.assistantRecommendedCourses')}
                            </div>
                            <div className="journal-recommended-courses__list">
                              {conv.recommended_courses.map((course) => (
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
                                      <img src={resolveAssetUrl(course.image)} alt="" loading="lazy" />
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

                        {conv.id && (
                          <div className="journal-assistant-history__actions">
                            <button
                              type="button"
                              className="journal-assistant-history__delete"
                              onClick={() => { void handleDelete(conv.id as string) }}
                              aria-label={t('journal.assistantHistoryDelete')}
                            >
                              <TrashIcon width={15} height={15} />
                              <span>{t('journal.assistantHistoryDelete')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
