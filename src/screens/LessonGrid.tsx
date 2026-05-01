/**
 * LessonGrid - Responsive Design対応（1列/2列/3列自動切り替え）
 */
import { v3 } from '../styles/tokensV3'
import { useWindowSize, getGridColumns } from '../hooks/useResponsive'

const IMG = '/images/v3'

export function LessonGridSection({ onOpenCategory }: { onOpenCategory: (cat: string) => void }) {
  const { width } = useWindowSize()
  const columns = getGridColumns(width)
  
  const lessons = [
    { cat: 'logic', name: 'ロジカルシンキング', meta: '5レッスン · 初級', progress: 60, accent: v3.color.accent, image: `${IMG}/course-logical.webp` },
    { cat: 'case', name: 'ケース面接', meta: '4レッスン · 中級', progress: 25, accent: v3.color.warm, image: `${IMG}/course-business.webp` },
    { cat: 'client', name: 'クライアント\nワーク', meta: '9レッスン · 中級', progress: 0, accent: '#F59E0B', image: `${IMG}/course-client.webp` },
    { cat: 'thinking', name: '思考法', meta: '22レッスン · 初級〜中級', progress: 15, accent: '#A5B4FC', image: `${IMG}/course-thinking.webp` },
    { cat: 'philosophy', name: '哲学・思考の原理', meta: '5レッスン · 上級', progress: 0, accent: '#C4B5FD', image: `${IMG}/course-philosophy.webp` },
  ]

  return (
    <div>
      {/* Lesson Grid - Responsive: 1列(SM) / 2列(MD) / 3列(LG) */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12, marginBottom: 12 }}>
        {lessons.map(lesson => (
          <LessonGridCard key={lesson.cat} lesson={lesson} onOpen={() => onOpenCategory(lesson.cat)} />
        ))}
      </div>
    </div>
  )
}

function LessonGridCard({ lesson, onOpen }: { lesson: any; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card }}>
      <div style={{ height: 100, overflow: 'hidden', background: v3.color.card }}>
        <img src={lesson.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '12px 14px 14px', background: v3.color.card }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, marginBottom: 3, lineHeight: 1.3 }}>{lesson.name}</div>
        <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500, marginBottom: 10 }}>{lesson.meta}</div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${lesson.progress}%`, background: lesson.accent, borderRadius: 99 }}></div>
        </div>
      </div>
    </div>
  )
}
