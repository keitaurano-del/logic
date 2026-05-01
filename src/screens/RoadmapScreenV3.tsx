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
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>レッスン</div>
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
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em' }}>コースを<br />選んでください。</div>
        </div>



        {/* 2列グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.accent}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>}
            iconBg="rgba(112,216,189,.14)"
            name="ロジカルシンキング"
            meta="5レッスン · 初〜中級"
            progress="3/5"
            image={`${IMG}/course-logical.webp`}
            onClick={() => props.onOpenCategory('logic')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.warm}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke={v3.color.warm} strokeWidth="2" /></svg>}
            iconBg="rgba(244,162,97,.14)"
            name="ケース面接"
            meta="4レッスン · 中〜上級"
            progress="1/4"
            image={`${IMG}/course-business.webp`}
            onClick={() => props.onOpenCategory('case')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#A5B4FC"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
            iconBg="rgba(165,180,252,.14)"
            name="思考法"
            meta="22レッスン · 全レベル"
            progress="3/22"
            image={`${IMG}/course-thinking.webp`}
            onClick={() => props.onOpenCategory('thinking')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#C4B5FD"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="9" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="4 3" /></svg>}
            iconBg="rgba(196,181,253,.14)"
            name="哲学・思考の原理"
            meta="5レッスン · 上級"
            progress="0/5"
            image={`${IMG}/course-philosophy.webp`}
            onClick={() => props.onOpenCategory('philosophy')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.warm}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke={v3.color.warm} strokeWidth="2" /><polyline points="14 2 14 8 20 8" fill="none" stroke={v3.color.warm} strokeWidth="2" /><line x1="16" y1="13" x2="8" y2="13" stroke={v3.color.warm} strokeWidth="2" /><line x1="16" y1="17" x2="8" y2="17" stroke={v3.color.warm} strokeWidth="2" /><polyline points="10 9 9 9 8 9" stroke={v3.color.warm} strokeWidth="2" /></svg>}
            iconBg="rgba(244,162,97,.14)"
            name="提案書作成"
            meta="7レッスン · 実践・全レベル"
            progress="0/7"
            image={`${IMG}/lesson-proposal.webp`}
            onClick={() => props.onOpenCategory('提案書作成')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#C49A3C"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="#C49A3C" strokeWidth="2" /><circle cx="9" cy="7" r="4" fill="none" stroke="#C49A3C" strokeWidth="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="#C49A3C" strokeWidth="2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="#C49A3C" strokeWidth="2" /></svg>}
            iconBg="rgba(196,154,60,.14)"
            name="クライアントワーク"
            meta="9レッスン · 中級"
            progress="0/9"
            image={`${IMG}/course-client.webp`}
            onClick={() => props.onOpenCategory('クライアントワーク')}
          />
          <CategoryCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C8EF5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
            iconBg="rgba(108,142,245,.14)"
            name="フェルミ推定"
            meta="5レッスン · 中級〜上級"
            progress="0/5"
            image={`${IMG}/fermi-card.png`}
            onClick={() => props.onOpenCategory('フェルミ推定')}
          />
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
  thinking: ['思考法', 'クリティカルシンキング', '仮説思考', '課題設定', 'デザインシンキング', 'ラテラルシンキング', 'アナロジー思考', 'システムシンキング'],
  philosophy: ['哲学・思考の原理', 'philosophy'],
  proposal: ['提案・伝える技術'],
  fermi: ['フェルミ推定'],
  critical: ['クリティカルシンキング'],
  hypothesis: ['仮説思考'],
  client: ['クライアントワーク'],
}

const CATEGORY_LABEL_JP: Record<string, string> = {
  fermi: 'フェルミ推定',
  logic: 'ロジカルシンキング',
  case: 'ケース面接',
  thinking: '思考法',
  critical: 'クリティカルシンキング',
  pm: 'プロジェクト管理',
  'formal-logic': '論理学',
  hypothesis: '仮説思考',
  'problem-setting': '課題設定',
  'design-thinking': 'デザインシンキング',
  lateral: 'ラテラルシンキング',
  analogy: 'アナロジー思考',
  systems: 'システムシンキング',
  proposal: '提案・伝える技術',
  philosophy: '哲学・思考の原理',
  client: 'クライアントワーク',
}


function CategoryCard({ icon, iconBg, name, meta, progress, onClick, image }: { icon: React.ReactNode; iconBg: string; name: string; meta: string; progress: string; onClick: () => void; image?: string }) {
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
  const candidates = CATEGORY_ID_TO_NAMES[category] || [CATEGORY_LABEL_JP[category] || category, category]
  const lessons = Object.values(flat).filter((l: any) => {
    if (!l) return false
    return candidates.includes(l.category)
  }).sort((a: any, b: any) => a.id - b.id)
  const label = CATEGORY_LABEL_JP[category] || category
  // SCRUM-218: レッスンが多いカテゴリ向けに「ここから始めよう」ピン表示
  const firstUndone = lessons.find((l: any) => !completed.has(`lesson-${l.id}`))
  const showStartHint = lessons.length >= 5 && firstUndone
  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: v3.color.text }}>{label}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 2 }}>{lessons.length}レッスン · {completed.size > 0 ? `${[...completed].filter(k => lessons.some((l: any) => k === `lesson-${l.id}`)).length}/${lessons.length}完了` : '未着手'}</div>
        </div>
      </div>
      {/* SCRUM-218: 始め方ヒントバナー */}
      {showStartHint && (
        <div
          onClick={() => onOpenLesson((firstUndone as any).id)}
          style={{ margin: '0 16px 12px', background: v3.color.accentSoft, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${v3.color.accent}30` }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" style={{ transform: 'scaleX(-1)', transformOrigin: '50% 50%' }} /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: v3.color.accent, marginBottom: 2 }}>ここから始めよう</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>{(firstUndone as any).title}</div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {lessons.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: v3.color.text2 }}>このカテゴリにはまだレッスンがありません。</div>
        )}
        {showStartHint && <div style={{ fontSize: 12, color: v3.color.text3, padding: '4px 4px 0', fontWeight: 600 }}>すべてのレッスン</div>}
        {lessons.map((lesson: any) => {
          const isDone = completed.has(`lesson-${lesson.id}`)
          // カテゴリごとに画像をマッピング（既存 v3 画像を活用）
          // SVGサムネイルを使用（LessonThumbnailコンポーネント）
          return (
            <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)} style={{ background: v3.color.card, borderRadius: 16, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'stretch', gap: 0, overflow: 'hidden' }}>
              {/* SVGサムネイル */}
              <div style={{ width: 88, height: 88, flexShrink: 0, overflow: 'hidden', borderRadius: '0' }}>
                <LessonThumbnail lessonId={lesson.id} size={88} />
              </div>
              <div style={{ padding: '14px 14px 14px 14px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${isDone ? v3.color.accent : v3.color.text3}`, background: isDone ? v3.color.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text, marginBottom: 3, lineHeight: 1.4 }}>{lesson.title}</div>
                  <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500 }}>{lesson.steps?.length ?? 0}ステップ · {lesson.difficulty || '初級'}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          )
        })}
        {/* おすすめレッスン */}
        <RecommendedLessonsSection currentCategory={label} onOpenLesson={onOpenLesson} />
      </div>
    </div>
  )
}

// カテゴリ詳細画面のおすすめレッスンコンポーネント
const CATEGORY_RECOMMEND: Record<string, number[]> = {
  'ロジカルシンキング': [40, 50, 28],
  'クリティカルシンキング': [20, 50, 53],
  '仮説思考': [22, 40, 53],
  'ケース面接': [20, 50, 89],
  'デザインシンキング': [40, 59, 62],
  'ラテラルシンキング': [56, 62, 59],
  'アナロジー思考': [59, 65, 40],
  'システムシンキング': [50, 62, 40],
  '哲学・思考の原理': [77, 78, 40],
  'クライアントワーク': [20, 50, 28],
  'フェルミ推定': [20, 89, 200],
  '提案書作成': [20, 22, 50],
  '提案・伝える技術': [20, 22, 50],
  '課題設定': [40, 50, 22],
}


function RecommendedLessonsSection({ currentCategory, onOpenLesson }: { currentCategory: string; onOpenLesson: (id: number) => void }) {
  const recIds = CATEGORY_RECOMMEND[currentCategory] || [20, 40, 50]
  const flat = getAllLessonsFlat()
  const recs = recIds.map(id => flat[id]).filter(Boolean) as Array<{ id: number; title: string; category: string }>
  if (recs.length === 0) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 600, marginBottom: 10, padding: '0 4px' }}>他のおすすめレッスン</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recs.map(lesson => (
          <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
            style={{ background: v3.color.card, borderRadius: 14, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${v3.color.line}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: 2, lineHeight: 1.3 }}>{lesson.title}</div>
              <div style={{ fontSize: 12, color: v3.color.text2 }}>{lesson.category}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        ))}
      </div>
    </div>
  )
}
