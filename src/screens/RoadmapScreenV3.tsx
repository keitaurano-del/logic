/**
 * RoadmapScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.2
 * モックアップ: lv3-courses.html
 */
import { useState } from 'react'
import { v3 } from '../styles/tokensV3'
import { LessonThumbnail } from '../components/LessonThumbnail'
import { getAllLessonsFlat } from '../lessonData'
import { getCompletedLessons } from '../stats'
import { getCoursesByCategory } from '../courseData'

const IMG = '/images/v3'

interface RoadmapScreenV3Props {
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
  initialCategory?: string
  onBack?: () => void
}

export function RoadmapScreenV3(props: RoadmapScreenV3Props) {
  const [searchQuery, setSearchQuery] = useState('')

  if (props.initialCategory) {
    return <CategoryDetailView category={props.initialCategory} onOpenLesson={props.onOpenLesson} onBack={props.onBack} />
  }

  // SCRUM-161: 検索フィルタリングは CategoryDetailView 内で行うので、ここでは検索UIのみ
  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>トレーニング</div>
      </div>
      {/* SCRUM-161: 検索ボックス */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            placeholder="レッスンを検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 16px 10px 38px',
              borderRadius: 12,
              border: `1px solid ${v3.color.line}`,
              background: v3.color.card,
              color: v3.color.text,
              fontSize: 14, outline: 'none',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>
      {searchQuery.trim() && (
        <SearchResults query={searchQuery} onOpenLesson={props.onOpenLesson} />
      )}

      {!searchQuery.trim() && <div style={{ flex: 1, padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em' }}>今日、どのスキルを<br />鍛える？</div>
        </div>



        {/* 2列グリッド — courseData.ts の全14カテゴリ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>} iconBg="rgba(108,142,245,.14)" name="ロジカルシンキング" meta="2コース · 初〜中級" image={`${IMG}/course-logical.webp`} onClick={() => props.onOpenCategory('logic')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>} iconBg="rgba(248,113,113,.14)" name="クリティカルシンキング" meta="2コース · 初〜中級" image={`${IMG}/lesson-critical-thinking.webp`} onClick={() => props.onOpenCategory('critical')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>} iconBg="rgba(251,191,36,.14)" name="仮説思考" meta="1コース · 中級" image={`${IMG}/lesson-hypothesis.webp`} onClick={() => props.onOpenCategory('hypothesis')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} iconBg="rgba(52,211,153,.14)" name="課題設定" meta="1コース · 中級" image={`${IMG}/lesson-issue-setting.webp`} onClick={() => props.onOpenCategory('problem-setting')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>} iconBg="rgba(96,165,250,.14)" name="デザインシンキング" meta="1コース · 初級" image={`${IMG}/lesson-design-thinking.webp`} onClick={() => props.onOpenCategory('design-thinking')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>} iconBg="rgba(167,139,250,.14)" name="ラテラルシンキング" meta="1コース · 中級" image={`${IMG}/lesson-lateral-thinking.webp`} onClick={() => props.onOpenCategory('lateral')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>} iconBg="rgba(244,114,182,.14)" name="アナロジー思考" meta="1コース · 中級" image={`${IMG}/lesson-analogy.webp`} onClick={() => props.onOpenCategory('analogy')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>} iconBg="rgba(45,212,191,.14)" name="システムシンキング" meta="1コース · 上級" image={`${IMG}/lesson-systems-thinking.webp`} onClick={() => props.onOpenCategory('systems')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.warm} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} iconBg="rgba(244,162,97,.14)" name="提案・伝える技術" meta="1コース · 中級" image={`${IMG}/lesson-proposal.webp`} onClick={() => props.onOpenCategory('proposal')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} iconBg="rgba(251,146,60,.14)" name="提案書作成" meta="1コース · 上級" image={`${IMG}/lesson-23.webp`} onClick={() => props.onOpenCategory('提案書作成')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10" strokeDasharray="4 3"/></svg>} iconBg="rgba(196,181,253,.14)" name="哲学・思考の原理" meta="1コース · 上級" image={`${IMG}/course-philosophy.webp`} onClick={() => props.onOpenCategory('philosophy')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A3C" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} iconBg="rgba(196,154,60,.14)" name="クライアントワーク" meta="2コース · 中級" image={`${IMG}/course-client.webp`} onClick={() => props.onOpenCategory('クライアントワーク')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.warm} strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} iconBg="rgba(244,162,97,.14)" name="ケース面接" meta="1コース · 上級" image={`${IMG}/course-business.webp`} onClick={() => props.onOpenCategory('case')} />
          <CategoryCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C8EF5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>} iconBg="rgba(108,142,245,.14)" name="フェルミ推定" meta="1コース · 中級" image={`${IMG}/fermi-card.png`} onClick={() => props.onOpenCategory('フェルミ推定')} />
        </div>
      </div>}
    </div>
  )
}

function SearchResults({ query, onOpenLesson }: { query: string; onOpenLesson: (id: number) => void }) {
  const q = query.toLowerCase().trim()
  const all = getAllLessonsFlat() as Record<number, { id: number; title: string; category: string; description?: string }>
  const results = Object.values(all).filter(l =>
    l.title.toLowerCase().includes(q) || (l.category || '').toLowerCase().includes(q)
  ).slice(0, 20)
  return (
    <div style={{ flex: 1, padding: '8px 16px 100px', display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
      {results.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: v3.color.text2, fontSize: 14 }}>「{query}」に一致するレッスンが見つかりません</div>
      )}
      {results.map(lesson => (
        <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
          style={{ background: v3.color.card, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text, marginBottom: 2 }}>{lesson.title}</div>
            <div style={{ fontSize: 14, color: v3.color.text2 }}>{lesson.category}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </div>
      ))}
    </div>
  )
}




const CATEGORY_ID_TO_NAMES: Record<string, string[]> = {
  logic: ['ロジカルシンキング', 'Logical Thinking'],
  case: ['ケース面接'],
  critical: ['クリティカルシンキング'],
  hypothesis: ['仮説思考'],
  'problem-setting': ['課題設定'],
  'design-thinking': ['デザインシンキング'],
  lateral: ['ラテラルシンキング'],
  analogy: ['アナロジー思考'],
  systems: ['システムシンキング'],
  proposal: ['提案・伝える技術'],
  '提案書作成': ['提案書作成'],
  philosophy: ['哲学・思考の原理', 'philosophy'],
  'クライアントワーク': ['クライアントワーク'],
  'フェルミ推定': ['フェルミ推定'],
}

const CATEGORY_LABEL_JP: Record<string, string> = {
  logic: 'ロジカルシンキング',
  case: 'ケース面接',
  critical: 'クリティカルシンキング',
  hypothesis: '仮説思考',
  'problem-setting': '課題設定',
  'design-thinking': 'デザインシンキング',
  lateral: 'ラテラルシンキング',
  analogy: 'アナロジー思考',
  systems: 'システムシンキング',
  proposal: '提案・伝える技術',
  '提案書作成': '提案書作成',
  philosophy: '哲学・思考の原理',
  'クライアントワーク': 'クライアントワーク',
  'フェルミ推定': 'フェルミ推定',
}


function CategoryCard({ icon, iconBg, name, meta, progress, onClick, image }: { icon: React.ReactNode; iconBg: string; name: string; meta: string; progress?: string; onClick: () => void; image?: string }) {
  return (
    <div onClick={onClick} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, display: 'flex', flexDirection: 'column' }}>
      {image && (
        <div style={{ height: 80, overflow: 'hidden', flexShrink: 0 }}>
          <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, marginBottom: 2, lineHeight: 1.3 }}>{name}</div>
          <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500 }}>{meta}</div>
        </div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 12, fontWeight: 700, color: v3.color.accent }}>{progress}</div>
      </div>
    </div>
  )
}

function CategoryDetailView({ category, onOpenLesson, onBack }: { category: string; onOpenLesson: (id: number) => void; onBack?: () => void }) {
  const flat = getAllLessonsFlat()
  const completed = new Set(getCompletedLessons())
  const label = CATEGORY_LABEL_JP[category] || category
  const courses = getCoursesByCategory(label)

  // コースが定義されていないカテゴリはフォールバック表示
  const candidates = CATEGORY_ID_TO_NAMES[category] || [label, category]
  const fallbackLessons = courses.length === 0
    ? Object.values(flat).filter((l: any) => l && candidates.includes(l.category)).sort((a: any, b: any) => a.id - b.id)
    : []

  const totalLessons = courses.length > 0
    ? courses.reduce((acc, c) => acc + c.lessonIds.length, 0)
    : fallbackLessons.length
  const completedCount = courses.length > 0
    ? courses.flatMap(c => c.lessonIds).filter(id => completed.has(`lesson-${id}`)).length
    : fallbackLessons.filter((l: any) => completed.has(`lesson-${l.id}`)).length

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: v3.color.text }}>{label}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 2 }}>
            {courses.length > 0 ? `${courses.length}コース · ` : ''}{totalLessons}レッスン · {completedCount > 0 ? `${completedCount}/${totalLessons}完了` : '未着手'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* コース単位表示 */}
        {courses.map((course) => {
          const courseLessons = course.lessonIds.map(id => flat[id]).filter(Boolean) as any[]
          const courseCompleted = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
          const allDone = courseCompleted === course.lessonIds.length
          const firstUndone = courseLessons.find((l: any) => !completed.has(`lesson-${l.id}`))

          return (
            <div key={course.id} style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden', boxShadow: v3.shadow.card }}>
              {/* コースヘッダー */}
              <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${v3.color.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: v3.color.text3, letterSpacing: '.06em', background: `${v3.color.text3}14`, borderRadius: 6, padding: '2px 7px' }}>
                    {course.category}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: v3.color.accent, letterSpacing: '.08em', background: v3.color.accentSoft, borderRadius: 6, padding: '2px 7px' }}>
                    {course.level}
                  </div>
                  {allDone && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', background: '#22C55E18', borderRadius: 6, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      完了
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: v3.color.text, lineHeight: 1.3, marginBottom: 4 }}>{course.title}</div>
                <div style={{ fontSize: 12, color: v3.color.text2, lineHeight: 1.5 }}>{course.description}</div>
                {/* プログレスバー */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: v3.color.text3 }}>{course.lessonIds.length}レッスン</div>
                    <div style={{ fontSize: 11, color: v3.color.accent, fontWeight: 600 }}>{courseCompleted}/{course.lessonIds.length}</div>
                  </div>
                  <div style={{ height: 4, background: `${v3.color.text3}22`, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(courseCompleted / course.lessonIds.length) * 100}%`, background: allDone ? '#22C55E' : v3.color.accent, borderRadius: 2, transition: 'width .3s' }} />
                  </div>
                </div>
              </div>

              {/* レッスン一覧 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {courseLessons.map((lesson: any, idx: number) => {
                  const isDone = completed.has(`lesson-${lesson.id}`)
                  const isNext = firstUndone?.id === lesson.id
                  return (
                    <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${v3.color.line}` : 'none', background: isNext ? `${v3.color.accent}08` : 'transparent' }}>
                      {/* ステップ番号 or チェック */}
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? v3.color.accent : isNext ? `${v3.color.accent}20` : `${v3.color.text3}18`, border: isNext && !isDone ? `1.5px solid ${v3.color.accent}` : 'none' }}>
                        {isDone
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span style={{ fontSize: 11, fontWeight: 700, color: isNext ? v3.color.accent : v3.color.text3 }}>{idx + 1}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: isNext ? 700 : 600, color: isDone ? v3.color.text2 : v3.color.text, lineHeight: 1.3 }}>{lesson.title}</div>
                        <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 2 }}>{lesson.steps?.length ?? 0}ステップ</div>
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
            </div>
          )
        })}

        {/* コース未定義のカテゴリのフォールバック */}
        {fallbackLessons.map((lesson: any) => {
          const isDone = completed.has(`lesson-${lesson.id}`)
          return (
            <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
              style={{ background: v3.color.card, borderRadius: 14, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'stretch', overflow: 'hidden', boxShadow: v3.shadow.card }}>
              <div style={{ width: 80, height: 80, flexShrink: 0 }}><LessonThumbnail lessonId={lesson.id} size={80} /></div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text, marginBottom: 3, lineHeight: 1.4 }}>{lesson.title}</div>
                  <div style={{ fontSize: 13, color: v3.color.text2 }}>{lesson.steps?.length ?? 0}ステップ</div>
                </div>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: isDone ? v3.color.accent : `${v3.color.text3}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  }
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


