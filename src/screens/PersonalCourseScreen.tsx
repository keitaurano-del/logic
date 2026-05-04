/**
 * PersonalCourseScreen
 * 実力診断結果から自動生成された「あなた専用パーソナルコース」を表示。
 * 「コースを進める」で先頭の未完了レッスンへ、「終了する」でホームへ戻る。
 */
import { loadPersonalCourse, axisLabel, levelLabel } from '../placementData'
import { getAllLessonsFlat, type LessonData } from '../lessonData'
import { getCompletedLessons } from '../stats'
import { v3 } from '../styles/tokensV3'

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
      <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </div>
          )}
          <div style={{ fontSize: 20, fontWeight: 700 }}>パーソナルコース</div>
        </div>
        <div style={{ padding: 24, textAlign: 'center', color: v3.color.text2, fontSize: 14, lineHeight: 1.7 }}>
          まだパーソナルコースが生成されていません。実力診断テストを受けると、あなた専用のコースが自動生成されます。
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
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: v3.color.accent, letterSpacing: '.08em' }}>YOUR PERSONAL COURSE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: v3.color.text, marginTop: 2, lineHeight: 1.35 }}>{course.title}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* コース概要カード */}
        <div style={{ background: v3.color.card, borderRadius: 16, padding: '16px 18px', boxShadow: v3.shadow.card, border: `1.5px solid ${v3.color.accent}30` }}>
          <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.7, marginBottom: 10 }}>{course.description}</div>
          {course.axisOrder.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {course.axisOrder.slice(0, 3).map((axis, idx) => (
                <div key={axis} style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#fff' : v3.color.accent, background: idx === 0 ? v3.color.accent : v3.color.accentSoft, borderRadius: 6, padding: '3px 8px' }}>
                  {idx === 0 ? '優先' : `次点${idx}`}：{axisLabel(axis).label}
                </div>
              ))}
            </div>
          )}
          {/* プログレス */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: v3.color.text3 }}>{lessons.length}レッスン構成</div>
              <div style={{ fontSize: 11, color: v3.color.accent, fontWeight: 600 }}>{completedCount}/{lessons.length} 完了</div>
            </div>
            <div style={{ height: 4, background: `${v3.color.text3}22`, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / Math.max(1, lessons.length)) * 100}%`, background: allDone ? '#22C55E' : v3.color.accent, borderRadius: 2, transition: 'width .3s' }} />
            </div>
          </div>
        </div>

        {/* レッスン一覧 */}
        <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden', boxShadow: v3.shadow.card }}>
          {lessons.map((lesson, idx) => {
            const isDone = completed.has(`lesson-${lesson.id}`)
            const isNext = firstUndone?.id === lesson.id
            return (
              <div key={lesson.id} onClick={() => onStartLesson(lesson.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${v3.color.line}` : 'none', background: isNext ? `${v3.color.accent}08` : 'transparent' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? v3.color.accent : isNext ? `${v3.color.accent}20` : `${v3.color.text3}18`, border: isNext && !isDone ? `1.5px solid ${v3.color.accent}` : 'none' }}>
                  {isDone
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: isNext ? v3.color.accent : v3.color.text3 }}>{idx + 1}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: isNext ? 700 : 600, color: isDone ? v3.color.text2 : v3.color.text, lineHeight: 1.35 }}>{lesson.title}</div>
                  <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>
                    {lesson.category} · {lesson.steps?.length ?? 0}ステップ
                  </div>
                </div>
                {isNext && !isDone && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: v3.color.accent, background: v3.color.accentSoft, borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>次へ</div>
                )}
                {!isDone && !isNext && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                )}
              </div>
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
              background: v3.color.accent,
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
            {allDone ? 'もう一度進める' : completedCount > 0 ? '続きから進める' : 'コースを進める'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}

        {/* 「終了する」サブ（目立たない） */}
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            color: v3.color.text3,
            border: 'none',
            padding: '10px 0',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          終了する
        </button>

        {course.axisOrder.length > 0 && (
          <div style={{ marginTop: 4, fontSize: 11, color: v3.color.text3, lineHeight: 1.6, textAlign: 'center' }}>
            診断で「{axisLabel(course.axisOrder[0]).label}（{levelLabel(1)}〜{levelLabel(3)}）」が伸びしろと判定されました。
          </div>
        )}
      </div>
    </div>
  )
}
