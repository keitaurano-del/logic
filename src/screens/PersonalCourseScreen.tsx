/**
 * PersonalCourseScreen
 * 実力診断結果から自動生成された「あなた専用パーソナルコース」を表示。
 * 「コースを進める」で先頭の未完了レッスンへ、「終了する」でホームへ戻る。
 */
import { loadPersonalCourse, axisLabel, levelLabel } from '../placementData'
import { getAllLessonsFlat, type LessonData } from '../lessonData'
import { getCompletedLessons } from '../stats'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'

interface PersonalCourseScreenProps {
  onStartLesson: (lessonId: number) => void
  onExit: () => void
  onBack?: () => void
}

export function PersonalCourseScreen({ onStartLesson, onExit, onBack }: PersonalCourseScreenProps) {
  const course = loadPersonalCourse()
  const flat = getAllLessonsFlat()
  const completed = new Set(getCompletedLessons())

  if (!course) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
        <Header title={t('personalCourse.title')} onBack={onBack} />
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
          {t('personalCourse.empty')}
        </div>
      </div>
    )
  }

  const lessons = course.lessonIds.map(id => flat[id]).filter((l): l is LessonData => !!l)
  const completedCount = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
  const firstUndone = lessons.find(l => !completed.has(`lesson-${l.id}`))
  const allDone = !firstUndone
  const startId = firstUndone?.id ?? lessons[0]?.id

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button type="button" onClick={onBack} aria-label={t('personalCourse.backAria')} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.08em' }}>{t('personalCourse.eyebrow')}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.35 }}>{course.title}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* コース概要カード */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px 18px', boxShadow: 'var(--shadow-v3-card-inset)', border: `1.5px solid color-mix(in srgb, var(--brand) 19%, transparent)` }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{course.description}</div>
          {course.axisOrder.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {course.axisOrder.slice(0, 3).map((axis, idx) => (
                <div key={axis} style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#fff' : 'var(--brand)', background: idx === 0 ? 'var(--brand)' : 'var(--accent-soft)', borderRadius: 6, padding: '3px 8px' }}>
                  {t('personalCourse.priorityLine', { label: idx === 0 ? t('personalCourse.priorityFirst') : t('personalCourse.priorityNth', { n: idx }), axis: axisLabel(axis).label })}
                </div>
              ))}
            </div>
          )}
          {/* プログレス */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('personalCourse.totalLessons', { n: lessons.length })}</div>
              <div style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>{t('personalCourse.completedRatio', { done: completedCount, total: lessons.length })}</div>
            </div>
            <div style={{ height: 4, background: `color-mix(in srgb, var(--text-muted) 13%, transparent)`, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / Math.max(1, lessons.length)) * 100}%`, background: allDone ? '#22C55E' : 'var(--brand)', borderRadius: 2, transition: 'width .3s' }} />
            </div>
          </div>
        </div>

        {/* レッスン一覧 */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
          {lessons.map((lesson, idx) => {
            const isDone = completed.has(`lesson-${lesson.id}`)
            const isNext = firstUndone?.id === lesson.id
            return (
              <button type="button" key={lesson.id} onClick={() => onStartLesson(lesson.id)}
                aria-label={isDone
                  ? t('personalCourse.lessonAriaInCourseDone', { n: idx + 1, title: lesson.title })
                  : isNext
                    ? t('personalCourse.lessonAriaInCourseNext', { n: idx + 1, title: lesson.title })
                    : t('personalCourse.lessonAriaInCourse', { n: idx + 1, title: lesson.title })}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${'var(--border)'}` : 'none', background: isNext ? `color-mix(in srgb, var(--brand) 3%, transparent)` : 'transparent', border: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'var(--brand)' : isNext ? `color-mix(in srgb, var(--brand) 13%, transparent)` : `color-mix(in srgb, var(--text-muted) 9%, transparent)`, border: isNext && !isDone ? `1.5px solid ${'var(--brand)'}` : 'none' }}>
                  {isDone
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: isNext ? 'var(--brand)' : 'var(--text-muted)' }}>{idx + 1}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: isNext ? 700 : 600, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.35 }}>{lesson.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {lesson.category} · {t('personalCourse.stepCount', { count: lesson.steps?.length ?? 0 })}
                  </div>
                </div>
                {isNext && !isDone && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', background: 'var(--accent-soft)', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>{t('personalCourse.next')}</div>
                )}
                {!isDone && !isNext && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                )}
              </button>
            )
          })}
        </div>

        {/* 「コースを進める」プライマリ */}
        {startId !== undefined && (
          <button
            onClick={() => onStartLesson(startId)}
            style={{
              marginTop: 8,
              width: '100%',
              background: 'var(--brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px 0',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
            }}
          >
            {allDone ? t('personalCourse.ctaRedo') : completedCount > 0 ? t('personalCourse.ctaContinue') : t('personalCourse.ctaStart')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}

        {/* 「終了する」サブ（目立たない） */}
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            border: 'none',
            padding: '10px 0',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          {t('personalCourse.exit')}
        </button>

        {course.axisOrder.length > 0 && (
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
            {t('personalCourse.diagnosisLine', { axis: axisLabel(course.axisOrder[0]).label, from: levelLabel(1), to: levelLabel(3) })}
          </div>
        )}
      </div>
    </div>
  )
}
