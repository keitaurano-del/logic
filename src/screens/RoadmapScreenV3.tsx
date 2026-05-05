/**
 * RoadmapScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.2
 * モックアップ: lv3-courses.html
 */
import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { v3 } from '../styles/tokensV3'
import { Header } from '../components/platform/Header'
import { LessonThumbnail } from '../components/LessonThumbnail'
import LessonIcon from '../LessonIcon'
import { getAllLessonsFlat } from '../lessonData'
import type { LessonData } from '../lessonData'
import { getCompletedLessons } from '../stats'
import { getCoursesByCategory, getCoursesByGroup, COURSES, COURSE_GROUPS, type Course } from '../courseData'
import { loadPersonalCourse, axisLabel } from '../placementData'

const IMG = '/images/v3'

// ──────── カテゴリ別ビジュアル（アイコン・色・画像） ────────
type CategoryVisual = {
  icon: ReactNode
  iconBg: string
  image: string
  routeKey: string  // CategoryDetailView へ渡す識別子
}

const CATEGORY_VISUAL: Record<string, CategoryVisual> = {
  'ロジカルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>,
    iconBg: 'rgba(168,192,255,.14)',
    image: `${IMG}/course-logical.webp`,
    routeKey: 'logic',
  },
  'クリティカルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    iconBg: 'rgba(248,113,113,.14)',
    image: `${IMG}/lesson-critical-thinking.webp`,
    routeKey: 'critical',
  },
  '仮説思考': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
    iconBg: 'rgba(251,191,36,.14)',
    image: `${IMG}/lesson-hypothesis.webp`,
    routeKey: 'hypothesis',
  },
  '課題設定': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    iconBg: 'rgba(52,211,153,.14)',
    image: `${IMG}/lesson-issue-setting.webp`,
    routeKey: 'problem-setting',
  },
  'デザインシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    iconBg: 'rgba(96,165,250,.14)',
    image: `${IMG}/lesson-design-thinking.webp`,
    routeKey: 'design-thinking',
  },
  'ラテラルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    iconBg: 'rgba(167,139,250,.14)',
    image: `${IMG}/lesson-lateral-thinking.webp`,
    routeKey: 'lateral',
  },
  'アナロジー思考': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>,
    iconBg: 'rgba(244,114,182,.14)',
    image: `${IMG}/lesson-analogy.webp`,
    routeKey: 'analogy',
  },
  'システムシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    iconBg: 'rgba(45,212,191,.14)',
    image: `${IMG}/lesson-systems-thinking.webp`,
    routeKey: 'systems',
  },
  '提案・伝える技術': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.warm} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    iconBg: 'rgba(244,162,97,.14)',
    image: `${IMG}/lesson-proposal.webp`,
    routeKey: 'proposal',
  },
  '提案書作成': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    iconBg: 'rgba(251,146,60,.14)',
    image: `${IMG}/course-proposal-writing.svg`,
    routeKey: '提案書作成',
  },
  '哲学・思考の原理': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10" strokeDasharray="4 3"/></svg>,
    iconBg: 'rgba(196,181,253,.14)',
    image: `${IMG}/course-philosophy.webp`,
    routeKey: 'philosophy',
  },
  '東洋思想': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD566" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 0 20 5 5 0 0 1 0-10 5 5 0 0 0 0-10z"/><circle cx="12" cy="7" r="1" fill="#FFD566"/><circle cx="12" cy="17" r="1" fill="#FFD566"/></svg>,
    iconBg: 'rgba(255,213,102,.14)',
    image: `${IMG}/course-eastern-01.svg`,
    routeKey: '東洋思想',
  },
  'クライアントワーク': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A3C" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    iconBg: 'rgba(196,154,60,.14)',
    image: `${IMG}/course-client.webp`,
    routeKey: 'クライアントワーク',
  },
  'ケース面接': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.warm} strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    iconBg: 'rgba(244,162,97,.14)',
    image: `${IMG}/course-business.webp`,
    routeKey: 'case',
  },
  '経営戦略': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAEFF" strokeWidth="2" strokeLinecap="round"><path d="M3 21V10l5 3V10l5 3V10l5 3v8z"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
    iconBg: 'rgba(122,174,255,.14)',
    image: `${IMG}/course-strategy.svg`,
    routeKey: '経営戦略',
  },
  'フェルミ推定': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    iconBg: 'rgba(168,192,255,.14)',
    image: `${IMG}/fermi-card.png`,
    routeKey: 'フェルミ推定',
  },
  '数字に強くなる': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAEFF" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
    iconBg: 'rgba(122,174,255,.14)',
    image: `${IMG}/course-numeracy.svg`,
    routeKey: '数字に強くなる',
  },
  'ピークパフォーマンス習慣': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5BB97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l3-8 4 16 3-8h5"/></svg>,
    iconBg: 'rgba(91,185,126,.14)',
    image: `${IMG}/course-thinking.webp`,
    routeKey: 'ピークパフォーマンス習慣',
  },
}

const DEFAULT_VISUAL: CategoryVisual = {
  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  iconBg: 'rgba(168,192,255,.14)',
  image: `${IMG}/course-logical.webp`,
  routeKey: '',
}

// ──────── 検索ユーティリティ ────────
// クエリを正規化（NFKC + 小文字 + カタカナ→ひらがな）
function normalizeQ(s: string): string {
  return (s || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

const SEARCH_HISTORY_KEY = 'logic-search-history'
function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : []
  } catch { return [] }
}
function saveSearchHistory(q: string) {
  const t = q.trim()
  if (!t) return
  const cur = loadSearchHistory().filter(x => x !== t)
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([t, ...cur].slice(0, 5)))
}
const SUGGESTED_KEYWORDS = ['MECE', '仮説思考', 'VRIO', '5フォース', 'ブルーオーシャン', 'デザインシンキング']

type LevelFilter = '初級' | '中級' | '上級'
type ProgressFilter = 'todo' | 'done'
type FormatFilter = 'quiz' | 'think' | 'case'
type SortOption = 'relevance' | 'level' | 'id'

// 検索結果項目
type LessonResult = {
  kind: 'lesson'
  lesson: LessonData
  course: Course | null
  status: 'todo' | 'done'
  level: LevelFilter | undefined
  formats: Set<FormatFilter>
  score: number
  snippet?: string
}
type CourseResult = {
  kind: 'course'
  course: Course
  doneCount: number
  totalCount: number
  score: number
}
type SearchResult = LessonResult | CourseResult

// ハイライト
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim()
  if (!q || !text) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    i % 2 === 1
      ? <mark key={i} style={{ background: 'rgba(168,192,255,.32)', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>{p}</mark>
      : <span key={i}>{p}</span>
  )
}

// 本文のヒット箇所からスニペット抽出（前後30文字）
function extractSnippet(text: string, nq: string, ctx = 30): string {
  if (!text) return ''
  const nt = normalizeQ(text)
  const idx = nt.indexOf(nq)
  if (idx < 0) return ''
  const start = Math.max(0, idx - ctx)
  const end = Math.min(text.length, idx + nq.length + ctx)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

interface RoadmapScreenV3Props {
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
  onOpenPersonalCourse?: () => void
  onOpenPlacementTest?: () => void
  initialCategory?: string
  onBack?: () => void
}

export function RoadmapScreenV3(props: RoadmapScreenV3Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilters, setLevelFilters] = useState<Set<LevelFilter>>(new Set())
  const [progressFilters, setProgressFilters] = useState<Set<ProgressFilter>>(new Set())
  const [formatFilters, setFormatFilters] = useState<Set<FormatFilter>>(new Set())
  const [sortOption, setSortOption] = useState<SortOption>('relevance')

  if (props.initialCategory) {
    return <CategoryDetailView category={props.initialCategory} onOpenLesson={props.onOpenLesson} onBack={props.onBack} />
  }

  const hasFilter = levelFilters.size + progressFilters.size + formatFilters.size > 0
  const showSearch = searchQuery.trim().length > 0 || hasFilter

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>トレーニング</div>
      </div>
      {/* 検索ボックス */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            placeholder="レッスン・コースを検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => saveSearchHistory(searchQuery)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 38px 10px 38px',
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
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="クリア"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: v3.color.text2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* フィルタ・ソート */}
      <FilterBar
        levelFilters={levelFilters} setLevelFilters={setLevelFilters}
        progressFilters={progressFilters} setProgressFilters={setProgressFilters}
        formatFilters={formatFilters} setFormatFilters={setFormatFilters}
        sortOption={sortOption} setSortOption={setSortOption}
        showSort={showSearch}
      />

      {showSearch && (
        <SearchPanel
          query={searchQuery}
          levelFilters={levelFilters}
          progressFilters={progressFilters}
          formatFilters={formatFilters}
          sortOption={sortOption}
          onOpenLesson={props.onOpenLesson}
          onOpenCategory={props.onOpenCategory}
          onPickKeyword={(k) => setSearchQuery(k)}
        />
      )}

      {!showSearch && <div style={{ flex: 1, padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em' }}>今日、どのスキルを<br />鍛える？</div>
        </div>

        {/* パーソナルコース（診断結果から自動生成）— 一番上 */}
        <PersonalCourseBanner
          onOpenPersonalCourse={props.onOpenPersonalCourse}
          onOpenPlacementTest={props.onOpenPlacementTest}
        />

        {/* グループ別コース一覧 — 5グループ × 全21コース */}
        {COURSE_GROUPS.map(group => {
          const groupCourses = getCoursesByGroup(group.id)
          if (groupCourses.length === 0) return null
          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '8px 4px 0' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: v3.color.text, letterSpacing: '-.005em' }}>{group.label}</div>
                <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2, lineHeight: 1.45 }}>{group.description}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {groupCourses.map(course => {
                  const v = CATEGORY_VISUAL[course.category] || DEFAULT_VISUAL
                  return (
                    <CategoryCard
                      key={course.id}
                      name={course.title}
                      meta={`${course.lessonIds.length}レッスン · ${course.level}`}
                      image={course.image || v.image}
                      onClick={() => props.onOpenCategory(v.routeKey)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>}
    </div>
  )
}

// ──────── フィルタバー ────────
function FilterBar(p: {
  levelFilters: Set<LevelFilter>; setLevelFilters: (s: Set<LevelFilter>) => void
  progressFilters: Set<ProgressFilter>; setProgressFilters: (s: Set<ProgressFilter>) => void
  formatFilters: Set<FormatFilter>; setFormatFilters: (s: Set<FormatFilter>) => void
  sortOption: SortOption; setSortOption: (s: SortOption) => void
  showSort: boolean
}) {
  const toggle = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val); else next.add(val)
    setter(next)
  }
  return (
    <div style={{ padding: '0 16px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {(['初級', '中級', '上級'] as LevelFilter[]).map(l => (
          <Pill key={l} active={p.levelFilters.has(l)} onClick={() => toggle(p.levelFilters, l, p.setLevelFilters)} label={l} />
        ))}
        <Pill active={p.progressFilters.has('todo')} onClick={() => toggle(p.progressFilters, 'todo', p.setProgressFilters)} label="未着手" />
        <Pill active={p.progressFilters.has('done')} onClick={() => toggle(p.progressFilters, 'done', p.setProgressFilters)} label="完了" />
        <Pill active={p.formatFilters.has('quiz')} onClick={() => toggle(p.formatFilters, 'quiz', p.setFormatFilters)} label="クイズ" />
        <Pill active={p.formatFilters.has('think')} onClick={() => toggle(p.formatFilters, 'think', p.setFormatFilters)} label="思考問題" />
        <Pill active={p.formatFilters.has('case')} onClick={() => toggle(p.formatFilters, 'case', p.setFormatFilters)} label="ケース" />
      </div>
      {p.showSort && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <select value={p.sortOption} onChange={e => p.setSortOption(e.target.value as SortOption)}
            style={{ background: v3.color.card, color: v3.color.text2, border: `1px solid ${v3.color.line}`, borderRadius: 8, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit' }}>
            <option value="relevance">関連度順</option>
            <option value="level">難易度順</option>
            <option value="id">レッスン番号順</option>
          </select>
        </div>
      )}
    </div>
  )
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        borderRadius: 100,
        border: `1px solid ${active ? v3.color.accent : v3.color.line}`,
        background: active ? 'rgba(168,192,255,.18)' : v3.color.card,
        color: active ? v3.color.accent : v3.color.text2,
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}>
      {label}
    </button>
  )
}

// ──────── 検索パネル本体 ────────
function SearchPanel(p: {
  query: string
  levelFilters: Set<LevelFilter>
  progressFilters: Set<ProgressFilter>
  formatFilters: Set<FormatFilter>
  sortOption: SortOption
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
  onPickKeyword: (k: string) => void
}) {
  // p.query が変わるたびに最新の検索履歴を取得（useEffect の同期 setState を避けるため useMemo で計算）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = useMemo(() => loadSearchHistory(), [p.query])

  const all = getAllLessonsFlat()
  const completed = useMemo(() => new Set(getCompletedLessons()), [])

  // レッスンID → 所属コース（最初に見つかったもの）
  const lessonToCourse: Map<number, Course> = useMemo(() => {
    const m = new Map<number, Course>()
    for (const c of COURSES) for (const id of c.lessonIds) if (!m.has(id)) m.set(id, c)
    return m
  }, [])

  const nq = normalizeQ(p.query)
  const hasQuery = nq.length > 0
  const hasFilter = p.levelFilters.size + p.progressFilters.size + p.formatFilters.size > 0

  const results = useMemo<SearchResult[]>(() => {
    const out: SearchResult[] = []

    // コース検索（タイトル / 説明 / カテゴリ）
    if (hasQuery) {
      for (const c of COURSES) {
        const fields = [c.title, c.description, c.category]
        let score = 0
        if (normalizeQ(c.title).includes(nq)) score += 12
        else if (normalizeQ(c.category).includes(nq)) score += 6
        else if (normalizeQ(c.description).includes(nq)) score += 4
        if (score === 0) {
          // 全体ヒットなしならスキップ
          continue
        }
        const doneCount = c.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
        out.push({ kind: 'course', course: c, doneCount, totalCount: c.lessonIds.length, score })
        void fields
      }
    }

    // レッスン検索
    for (const lesson of Object.values(all)) {
      if (!lesson) continue
      const course = lessonToCourse.get(lesson.id) || null
      const status: 'todo' | 'done' = completed.has(`lesson-${lesson.id}`) ? 'done' : 'todo'
      const level = course?.level as LevelFilter | undefined

      // 形式判定
      const formats: Set<FormatFilter> = new Set()
      for (const s of lesson.steps) {
        if (s.type === 'quiz') formats.add('quiz')
        else if (s.type === 'think') formats.add('think')
        else if (s.type === 'case') formats.add('case')
      }

      // フィルタ適用
      if (p.levelFilters.size && (!level || !p.levelFilters.has(level))) continue
      if (p.progressFilters.size && !p.progressFilters.has(status)) continue
      if (p.formatFilters.size) {
        let ok = false
        for (const f of p.formatFilters) if (formats.has(f)) { ok = true; break }
        if (!ok) continue
      }

      // スコア計算
      let score = 0
      let snippet: string | undefined
      if (hasQuery) {
        if (normalizeQ(lesson.title).includes(nq)) score += 10
        if (normalizeQ(lesson.category).includes(nq)) score += 5
        // 本文検索
        for (const s of lesson.steps) {
          let target = ''
          if (s.type === 'explain') target = s.title + '\n' + s.content
          else if (s.type === 'quiz') target = s.question + '\n' + s.explanation + '\n' + s.options.map(o => o.label).join('\n')
          else if (s.type === 'think') target = s.question + '\n' + s.modelAnswer + '\n' + s.points.join('\n')
          else if (s.type === 'case') target = s.title + '\n' + s.situation + '\n' + s.conclusion
          if (target && normalizeQ(target).includes(nq)) {
            score += 2
            if (!snippet) snippet = extractSnippet(target, nq)
          }
        }
        if (score === 0) continue
      }

      out.push({ kind: 'lesson', lesson, course, status, level, formats, score: score || 1, snippet })
    }

    // ソート
    const levelOrder: Record<string, number> = { '初級': 0, '中級': 1, '上級': 2 }
    out.sort((a, b) => {
      if (p.sortOption === 'level') {
        const la = a.kind === 'lesson' ? (levelOrder[a.level || ''] ?? 99) : (levelOrder[a.course.level] ?? 99)
        const lb = b.kind === 'lesson' ? (levelOrder[b.level || ''] ?? 99) : (levelOrder[b.course.level] ?? 99)
        if (la !== lb) return la - lb
      }
      if (p.sortOption === 'id') {
        const ia = a.kind === 'lesson' ? a.lesson.id : 0
        const ib = b.kind === 'lesson' ? b.lesson.id : 0
        if (ia !== ib) return ia - ib
      }
      // 関連度（コース優先 → score 降順）
      if (a.kind !== b.kind) return a.kind === 'course' ? -1 : 1
      return b.score - a.score
    })

    return out.slice(0, 50)
  }, [all, lessonToCourse, completed, nq, hasQuery, p.levelFilters, p.progressFilters, p.formatFilters, p.sortOption])

  // クエリもフィルタも空 → 履歴・サジェスト
  if (!hasQuery && !hasFilter) {
    return (
      <div style={{ padding: '12px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: v3.color.text2, marginBottom: 6 }}>最近の検索</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.map(h => (
                <Pill key={h} active={false} onClick={() => p.onPickKeyword(h)} label={h} />
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: v3.color.text2, marginBottom: 6 }}>おすすめキーワード</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED_KEYWORDS.map(k => (
              <Pill key={k} active={false} onClick={() => p.onPickKeyword(k)} label={k} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: v3.color.text2, fontSize: 14 }}>
        条件に一致する{hasQuery ? `レッスンが見つかりません` : `項目がありません`}
        {hasQuery && (<><br /><span style={{ fontSize: 12 }}>「{p.query}」</span></>)}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: '8px 16px 100px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
      <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 600, padding: '0 2px' }}>
        {results.length}件
      </div>
      {results.map(r => r.kind === 'course'
        ? <CourseResultCard key={`c-${r.course.id}`} result={r} query={p.query} onOpen={() => p.onOpenCategory(r.course.category)} />
        : <LessonResultCard key={`l-${r.lesson.id}`} result={r} query={p.query} onOpen={() => p.onOpenLesson(r.lesson.id)} />
      )}
    </div>
  )
}

function CourseResultCard({ result, query, onOpen }: { result: CourseResult; query: string; onOpen: () => void }) {
  const c = result.course
  return (
    <button type="button" onClick={onOpen}
      aria-label={`${c.category} コース: ${c.title} (${result.doneCount}/${result.totalCount} 完了)`}
      style={{ background: v3.color.card, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${v3.color.line}`, color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,192,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: v3.color.accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: v3.color.accent, fontWeight: 700, marginBottom: 2 }}>コース · {c.category}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: 2, lineHeight: 1.3 }}>
          <Highlight text={c.title} query={query} />
        </div>
        <div style={{ fontSize: 12, color: v3.color.text2 }}>
          {c.level} · {result.doneCount}/{result.totalCount} 完了
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}

function LessonResultCard({ result, query, onOpen }: { result: LessonResult; query: string; onOpen: () => void }) {
  const l = result.lesson
  const courseTitle = result.course?.title
  return (
    <button type="button" onClick={onOpen}
      aria-label={`レッスン: ${l.title}${courseTitle ? ` (${courseTitle})` : ''}`}
      style={{ background: v3.color.card, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,192,255,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: v3.color.accent }}>
        <LessonIcon id={l.id} action="lesson" size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          {result.level && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: result.level === '初級' ? 'rgba(52,211,153,.18)' : result.level === '中級' ? 'rgba(251,191,36,.18)' : 'rgba(248,113,113,.18)', color: result.level === '初級' ? '#34D399' : result.level === '中級' ? '#FBBF24' : 'var(--md-sys-color-error)' }}>{result.level}</span>
          )}
          {result.status === 'done' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(168,192,255,.18)', color: v3.color.accent, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              完了
            </span>
          )}
          <span style={{ fontSize: 11, color: v3.color.text2 }}>{l.category}{courseTitle ? ` · ${courseTitle}` : ''}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: result.snippet ? 4 : 0, lineHeight: 1.3 }}>
          <Highlight text={l.title} query={query} />
        </div>
        {result.snippet && (
          <div style={{ fontSize: 11, color: v3.color.text2, lineHeight: 1.4 }}>
            <Highlight text={result.snippet} query={query} />
          </div>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" style={{ marginTop: 10, flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
    </button>
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
  '東洋思想': ['東洋思想'],
  'クライアントワーク': ['クライアントワーク'],
  'フェルミ推定': ['フェルミ推定'],
  '経営戦略': ['経営戦略', 'strategy'],
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
  '東洋思想': '東洋思想',
  'クライアントワーク': 'クライアントワーク',
  'フェルミ推定': 'フェルミ推定',
  '経営戦略': '経営戦略',
}


function CategoryCard({ name, meta, progress, onClick, image }: { name: string; meta: string; progress?: string; onClick: () => void; image?: string }) {
  return (
    <button type="button" onClick={onClick}
      aria-label={`${name}: ${meta}${progress ? ` (${progress})` : ''}`}
      style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, display: 'flex', flexDirection: 'column', border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', padding: 0 }}>
      {image && (
        <div style={{ height: 80, overflow: 'hidden', flexShrink: 0 }}>
          <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, marginBottom: 2, lineHeight: 1.3 }}>{name}</div>
          <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500 }}>{meta}</div>
        </div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 12, fontWeight: 700, color: v3.color.accent }}>{progress}</div>
      </div>
    </button>
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
    ? Object.values(flat).filter((l): l is LessonData => !!l && candidates.includes(l.category)).sort((a, b) => a.id - b.id)
    : []

  const totalLessons = courses.length > 0
    ? courses.reduce((acc, c) => acc + c.lessonIds.length, 0)
    : fallbackLessons.length
  const completedCount = courses.length > 0
    ? courses.flatMap(c => c.lessonIds).filter(id => completed.has(`lesson-${id}`)).length
    : fallbackLessons.filter(l => completed.has(`lesson-${l.id}`)).length

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <Header title={label} onBack={onBack} />
      <div style={{ padding: '0 20px 14px', fontSize: 13, color: v3.color.text2 }}>
        {courses.length > 0 ? `${courses.length}コース · ` : ''}{totalLessons}レッスン · {completedCount > 0 ? `${completedCount}/${totalLessons}完了` : '未着手'}
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* コース単位表示 */}
        {courses.map((course) => {
          const courseLessons = course.lessonIds.map(id => flat[id]).filter((l): l is LessonData => !!l)
          const courseCompleted = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
          const allDone = courseCompleted === course.lessonIds.length
          const firstUndone = courseLessons.find(l => !completed.has(`lesson-${l.id}`))

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
                {courseLessons.map((lesson, idx) => {
                  const isDone = completed.has(`lesson-${lesson.id}`)
                  const isNext = firstUndone?.id === lesson.id
                  return (
                    <button type="button" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
                      aria-label={`レッスン ${idx + 1}: ${lesson.title}${isDone ? ' (完了)' : isNext ? ' (次へ)' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${v3.color.line}` : 'none', background: isNext ? `${v3.color.accent}08` : 'transparent', border: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
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
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* コース未定義のカテゴリのフォールバック */}
        {fallbackLessons.map((lesson) => {
          const isDone = completed.has(`lesson-${lesson.id}`)
          return (
            <button type="button" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
              aria-label={`レッスン: ${lesson.title}${isDone ? ' (完了)' : ''}`}
              style={{ background: v3.color.card, borderRadius: 14, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'stretch', overflow: 'hidden', boxShadow: v3.shadow.card, border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
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
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ──────── パーソナルコース誘導バナー（トレーニング画面トップ） ────────
function PersonalCourseBanner({
  onOpenPersonalCourse,
  onOpenPlacementTest,
}: {
  onOpenPersonalCourse?: () => void
  onOpenPlacementTest?: () => void
}) {
  const course = loadPersonalCourse()
  const flat = getAllLessonsFlat()
  const completed = new Set(getCompletedLessons())

  // 診断未受検 → 「実力診断テスト」誘導カード
  if (!course) {
    if (!onOpenPlacementTest) return null
    return (
      <button
        type="button"
        onClick={onOpenPlacementTest}
        style={{
          background: v3.color.card,
          borderRadius: 16,
          padding: '14px 16px',
          boxShadow: v3.shadow.card,
          border: `1.5px dashed ${v3.color.accent}50`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: v3.color.accentSoft, color: v3.color.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>あなた専用コースを作成</div>
          <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2, lineHeight: 1.5 }}>
            実力診断（10問・約5分）で弱点を特定し、専用コースを自動生成します。
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    )
  }

  if (!onOpenPersonalCourse) return null

  const lessons = course.lessonIds.map(id => flat[id]).filter((l): l is LessonData => !!l)
  const completedCount = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
  const total = lessons.length || course.lessonIds.length
  const allDone = total > 0 && completedCount >= total
  const weakest = course.axisOrder[0]

  return (
    <button
      type="button"
      onClick={onOpenPersonalCourse}
      style={{
        background: `linear-gradient(135deg, ${v3.color.accent}f5, ${v3.color.accent}c0)`,
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: v3.shadow.card,
        cursor: 'pointer',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: 6 }}>YOUR COURSE</div>
        {allDone && (
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', background: 'rgba(255,255,255,0.22)', padding: '2px 8px', borderRadius: 6 }}>完了</div>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.35, marginBottom: 4 }}>{course.title}</div>
      <div style={{ fontSize: 12, opacity: 0.92, lineHeight: 1.55, marginBottom: 10 }}>
        {weakest ? `「${axisLabel(weakest).label}」を最優先に` : '弱点を最優先に'} ・ {total}レッスン構成
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(completedCount / Math.max(1, total)) * 100}%`, background: '#fff', borderRadius: 2, transition: 'width .3s' }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{completedCount}/{total}</div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.95 }}>
          {allDone ? 'もう一度進める' : completedCount > 0 ? '続きから進める' : 'コースを進める'}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </button>
  )
}

