/**
 * RoadmapScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.2
 * モックアップ: lv3-courses.html
 */
import { useState, useMemo, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { Header } from '../components/platform/Header'
import { ActionSheet } from '../components/ActionSheet'
import { LessonThumbnail } from '../components/LessonThumbnail'
import { TtsPopover } from '../components/TtsPopover'
import * as tts from '../ttsService'
import { startCoursePlay } from '../ttsCoursePlay'

function LessonImage({ lessonId, size }: { lessonId: number; size: number }) {
  const [failed, setFailed] = useState(false)
  const handleError = useCallback(() => setFailed(true), [])
  if (failed) return <LessonThumbnail lessonId={lessonId} size={size} />
  return (
    <img
      src={`/images/v3/lesson-${lessonId}.webp`}
      alt=""
      loading="lazy"
      onError={handleError}
      style={{ width: size, height: size, objectFit: 'cover', display: 'block' }}
    />
  )
}
import LessonIcon from '../LessonIcon'
import { BookmarkIcon, BookmarkFilledIcon, ChevronDownIcon, ChevronRightIcon, SparklesIcon, TrashIcon, SearchIcon } from '../icons'
import { aiSearch, type ResolvedAiHit } from '../aiSearch'
import { getAllLessonsFlat } from '../lessonData'
import type { LessonData } from '../lessonData'
import { getCompletedLessons } from '../stats'
import { getAllCompletionCounts } from '../db/completionCountDb'
import { CompletionBadge } from '../components/CompletionBadge'
import { getCoursesByCategory, getCoursesByGroup, getPinnedCourses, COURSES, COURSE_GROUPS, type Course } from '../courseData'
import { courseProgress } from '../courseProgress'
import { loadPersonalCourse, axisLabel } from '../placementData'
import { isSaved, toggleSaved } from '../savedItemsStore'
import { loadCustomCourses, deleteCustomCourse, type CustomCourse } from '../customCourseStore'
import { CustomCourseSheet } from '../components/CustomCourseSheet'
import { t, getLocale } from '../i18n'

// レベル文字列（データ値）→ 表示用の翻訳キー
function levelLabel(level: string): string {
  if (level === '初級') return t('roadmap.levelBeginner')
  if (level === '中級') return t('roadmap.levelIntermediate')
  if (level === '上級') return t('roadmap.levelAdvanced')
  return level
}


const IMG = '/images/v3'

// 「あなた専用コース」セクションを他カテゴリと同じ collapsedGroups 開閉機構に乗せるための擬似グループID。
// 既存カテゴリ（COURSE_GROUPS）の id や pinned グループ（'pinned-fermi'）と衝突しない値にする。
const CUSTOM_COURSE_GROUP_ID = 'custom-courses'

// ──────── カテゴリ別ビジュアル（アイコン・色・画像） ────────
type CategoryVisual = {
  icon: ReactNode
  iconBg: string
  image: string
  routeKey: string  // CategoryDetailView へ渡す識別子
}

const CATEGORY_VISUAL: Record<string, CategoryVisual> = {
  'ロジカルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>,
    iconBg: 'rgba(108,142,245,.14)',
    image: `${IMG}/course-logic-01.png`,
    routeKey: 'logic',
  },
  'クリティカルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    iconBg: 'rgba(248,113,113,.14)',
    image: `${IMG}/lesson-critical-thinking.png`,
    routeKey: 'critical',
  },
  '仮説思考': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
    iconBg: 'rgba(251,191,36,.14)',
    image: `${IMG}/lesson-hypothesis.png`,
    routeKey: 'hypothesis',
  },
  '課題設定': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    iconBg: 'rgba(52,211,153,.14)',
    image: `${IMG}/lesson-issue-setting.png`,
    routeKey: 'problem-setting',
  },
  '論点設定': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="11" y1="7" x2="11" y2="11"/><line x1="11" y1="11" x2="15" y2="11"/><line x1="16" y1="16" x2="21" y2="21"/></svg>,
    iconBg: 'rgba(52,211,153,.14)',
    image: `${IMG}/course-issue-01.png`,
    routeKey: 'issue-setting',
  },
  'デザインシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    iconBg: 'rgba(96,165,250,.14)',
    image: `${IMG}/lesson-design-thinking.png`,
    routeKey: 'design-thinking',
  },
  'ラテラルシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    iconBg: 'rgba(167,139,250,.14)',
    image: `${IMG}/lesson-lateral-thinking.png`,
    routeKey: 'lateral',
  },
  'アナロジー思考': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>,
    iconBg: 'rgba(244,114,182,.14)',
    image: `${IMG}/lesson-analogy.png`,
    routeKey: 'analogy',
  },
  'システムシンキング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    iconBg: 'rgba(45,212,191,.14)',
    image: `${IMG}/lesson-systems-thinking.png`,
    routeKey: 'systems',
  },
  'なぜなぜ分析': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v4M12 10v4M12 17v4"/><circle cx="12" cy="8.5" r="1.5" fill="#34D399"/><circle cx="12" cy="15.5" r="1.5" fill="#34D399"/></svg>,
    iconBg: 'rgba(52,211,153,.14)',
    image: `${IMG}/course-whywhy-01.png`,
    routeKey: 'whywhy',
  },
  '提案・伝える技術': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--warm)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    iconBg: 'rgba(244,162,97,.14)',
    image: `${IMG}/lesson-proposal.png`,
    routeKey: 'proposal',
  },
  '提案書作成': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    iconBg: 'rgba(251,146,60,.14)',
    image: `${IMG}/course-proposal-01.png`,
    routeKey: '提案書作成',
  },
  '哲学・思考の原理': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10" strokeDasharray="4 3"/></svg>,
    iconBg: 'rgba(196,181,253,.14)',
    image: `${IMG}/course-philosophy-01.png`,
    routeKey: 'philosophy',
  },
  '東洋思想': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD566" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 5 5 0 0 1 0-10 5 5 0 0 0 0-10z"/><circle cx="12" cy="7" r="1" fill="#FFD566"/><circle cx="12" cy="17" r="1" fill="#FFD566"/></svg>,
    iconBg: 'rgba(255,213,102,.14)',
    image: `${IMG}/course-eastern-01.png`,
    routeKey: '東洋思想',
  },
  'クライアントワーク': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A3C" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    iconBg: 'rgba(196,154,60,.14)',
    image: `${IMG}/course-client-01.png`,
    routeKey: 'クライアントワーク',
  },
  'ケース面接': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--warm)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    iconBg: 'rgba(244,162,97,.14)',
    image: `${IMG}/course-case-01.png`,
    routeKey: 'case',
  },
  '経営戦略': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAEFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 21V10l5 3V10l5 3V10l5 3v8z"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
    iconBg: 'rgba(122,174,255,.14)',
    image: `${IMG}/course-strategy-01.png`,
    routeKey: '経営戦略',
  },
  'フェルミ推定': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    iconBg: 'rgba(108,142,245,.14)',
    image: `${IMG}/fermi-card.png`,
    routeKey: 'フェルミ推定',
  },
  '数値感覚': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAEFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
    iconBg: 'rgba(122,174,255,.14)',
    image: `${IMG}/course-numeracy-01.png`,
    routeKey: 'numeracy',
  },
  'ピークパフォーマンス習慣': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5BB97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h3l3-8 4 16 3-8h5"/></svg>,
    iconBg: 'rgba(91,185,126,.14)',
    image: `${IMG}/course-thinking.webp`,
    routeKey: 'ピークパフォーマンス習慣',
  },
  '履歴書・職務経歴書': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    iconBg: 'rgba(108,142,245,.14)',
    image: `${IMG}/course-proposal-01.png`,
    routeKey: '履歴書・職務経歴書',
  },
  'SPI対策': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAEFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    iconBg: 'rgba(122,174,255,.14)',
    image: `${IMG}/course-numeracy-01.png`,
    routeKey: 'SPI対策',
  },
  '玉手箱対策': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/><line x1="12" y1="13" x2="12" y2="17"/></svg>,
    iconBg: 'rgba(251,191,36,.14)',
    image: `${IMG}/course-numeracy-01.png`,
    routeKey: '玉手箱対策',
  },
  '面接対策': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--warm)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
    iconBg: 'rgba(244,162,97,.14)',
    image: `${IMG}/course-case-01.png`,
    routeKey: '面接対策',
  },
  '給与交渉・退職実務': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A3C" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    iconBg: 'rgba(196,154,60,.14)',
    image: `${IMG}/course-strategy-01.png`,
    routeKey: '給与交渉・退職実務',
  },
  '認知科学': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></svg>,
    iconBg: 'rgba(167,139,250,.14)',
    image: `${IMG}/course-cognitive-01.png`,
    routeKey: 'cognitive',
  },
  'ドキュメンテーション': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>,
    iconBg: 'rgba(96,165,250,.14)',
    image: `${IMG}/course-documentation-01.png`,
    routeKey: 'documentation',
  },
  '構造化リスニング': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22B8CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    iconBg: 'rgba(34,184,207,.14)',
    image: `${IMG}/course-listening-01.png`,
    routeKey: '構造化リスニング',
  },
  'ロジカルライティング': {
    // 落ち着いた紺 (#3A5BC4) で「文章を書く」紺色のインク・万年筆を象徴
    // ペン先 + 罫線アイコン。
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A5BC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
    iconBg: 'rgba(58,91,196,.14)',
    image: `${IMG}/course-logical-writing-01.png`,
    routeKey: 'ロジカルライティング',
  },
  'ADHDレバレッジ': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    iconBg: 'rgba(232,121,249,.14)',
    image: `${IMG}/course-adhd-leverage-01.png`,
    routeKey: 'ADHDレバレッジ',
  },
  '集中の技術': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#14B8A6"/></svg>,
    iconBg: 'rgba(20,184,166,.14)',
    image: `${IMG}/course-focus-now-01.png`,
    routeKey: '集中の技術',
  },
  '体力デザイン': {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5BB97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 6.5h2v11h-2zM15.5 6.5h2v11h-2zM3.5 9.5h1.5v5H3.5zM19 9.5h1.5v5H19zM8.5 12h7"/></svg>,
    iconBg: 'rgba(91,185,126,.14)',
    image: `${IMG}/course-peak-performance-01.png`,
    routeKey: '体力デザイン',
  },
}

const DEFAULT_VISUAL: CategoryVisual = {
  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  iconBg: 'rgba(108,142,245,.14)',
  image: `${IMG}/course-logic-01.png`,
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
const SUGGESTED_KEYWORDS_JA = ['MECE', '仮説思考', 'VRIO', '5フォース', 'ブルーオーシャン', 'デザインシンキング']
const SUGGESTED_KEYWORDS_EN = ['MECE', 'Hypothesis Thinking', 'VRIO', '5 Forces', 'Blue Ocean', 'Design Thinking']
function getSuggestedKeywords(): string[] {
  return getLocale() === 'en' ? SUGGESTED_KEYWORDS_EN : SUGGESTED_KEYWORDS_JA
}

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
      ? <mark key={i} style={{ background: 'color-mix(in srgb, var(--accent) 32%, transparent)', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>{p}</mark>
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
  onOpenReviewHub?: () => void
  /** AI カスタムコースを開く（コース一覧画面へ） */
  onOpenCustomCourse?: (courseId: string) => void
  /** アップグレード導線（課金画面へ） */
  onUpgrade?: () => void
  initialCategory?: string
  onBack?: () => void
}

export function RoadmapScreenV3(props: RoadmapScreenV3Props) {
  // 検索 UI は右上の虫眼鏡起点で開閉する（常時展開しない）
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilters, setLevelFilters] = useState<Set<LevelFilter>>(new Set())
  const [progressFilters, setProgressFilters] = useState<Set<ProgressFilter>>(new Set())
  const [formatFilters, setFormatFilters] = useState<Set<FormatFilter>>(new Set())
  const [sortOption, setSortOption] = useState<SortOption>('relevance')
  // 折りたたまれているグループの集合。初期は空 = 全カテゴリ展開。
  // 「閉じている方」を保持することで「初期=全展開」をデフォルトで表現する。
  // 「あなた専用コース」は常時表示が煩わしいとの要望（T-W）でデフォルト折りたたみにするため、
  // 初期集合にそのグループID（CUSTOM_COURSE_GROUP_ID）を含めておく。
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set([CUSTOM_COURSE_GROUP_ID]))
  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId)
      return next
    })
  }, [])
  // AI カスタムコース（あなた専用コース）
  const [customCourses, setCustomCourses] = useState<CustomCourse[]>(() => loadCustomCourses())
  const [showCustomSheet, setShowCustomSheet] = useState(false)
  const refreshCustomCourses = useCallback(() => setCustomCourses(loadCustomCourses()), [])
  const handleDeleteCustomCourse = useCallback((id: string) => {
    if (!confirm(t('customCourse.deleteConfirm'))) return
    deleteCustomCourse(id)
    setCustomCourses(loadCustomCourses())
  }, [])

  // 完了レッスン集合（コース一覧カードの進捗バー算出に使う）。
  // 一覧で全コース分を集計するため、ここで一度だけ Set 化して各カードに渡す。
  const completedLessons = useMemo(() => new Set(getCompletedLessons()), [])

  // 検索を閉じるときは入力・フィルタもリセットしてコース一覧に戻す
  // （フック呼び出し順を一定に保つため、early return より前に置く）
  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setLevelFilters(new Set())
    setProgressFilters(new Set())
    setFormatFilters(new Set())
  }, [])

  if (props.initialCategory) {
    return <CategoryDetailView category={props.initialCategory} onOpenLesson={props.onOpenLesson} onBack={props.onBack} />
  }

  const hasFilter = levelFilters.size + progressFilters.size + formatFilters.size > 0
  const showSearch = searchQuery.trim().length > 0 || hasFilter

  // 検索モード（虫眼鏡を押して開いた状態）
  if (searchOpen) {
    return (
      <SearchOverlay
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        levelFilters={levelFilters} setLevelFilters={setLevelFilters}
        progressFilters={progressFilters} setProgressFilters={setProgressFilters}
        formatFilters={formatFilters} setFormatFilters={setFormatFilters}
        sortOption={sortOption} setSortOption={setSortOption}
        showSearch={showSearch}
        onClose={closeSearch}
        onOpenLesson={props.onOpenLesson}
        onOpenCategory={props.onOpenCategory}
      />
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {props.onOpenReviewHub && (
            <button
              type="button"
              onClick={props.onOpenReviewHub}
              aria-label={t('roadmap.openReviewAria')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent-soft)',
                color: 'var(--brand)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 14px',
                fontSize: '0.8667rem', fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Noto Sans JP', sans-serif",
                minHeight: 36,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <polyline points="3 4 3 10 9 10" />
              </svg>
              {t('roadmap.openReview')}
            </button>
          )}
          {/* 検索（虫眼鏡）— タップで検索 UI を開く */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('roadmap.searchAria')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: `1px solid var(--border)`,
              cursor: 'pointer',
            }}
          >
            <SearchIcon width={18} height={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: '1.4667rem', fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em', whiteSpace: 'pre-line' }}>{t('roadmap.todayQuestion')}</div>
        </div>

        {/* 検索バー（常設）— タップで右上虫眼鏡と同じ検索オーバーレイを開く。発見性向上のため一覧トップに配置 */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={t('roadmap.searchBarAria')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '0.9333rem',
            minHeight: 48,
          }}
        >
          <SearchIcon width={18} height={18} aria-hidden />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('roadmap.searchBarPlaceholder')}
          </span>
        </button>

        {/* あなた専用コース（AI 生成）— 最上部。コースが無くても作成ボタンは表示 */}
        <CustomCourseSection
          courses={customCourses}
          collapsed={collapsedGroups.has(CUSTOM_COURSE_GROUP_ID)}
          onToggle={() => toggleGroup(CUSTOM_COURSE_GROUP_ID)}
          onCreate={() => setShowCustomSheet(true)}
          onOpen={(id) => props.onOpenCustomCourse?.(id)}
          onDelete={handleDeleteCustomCourse}
        />

        {/* パーソナルコース（診断結果から自動生成） */}
        <PersonalCourseBanner
          onOpenPersonalCourse={props.onOpenPersonalCourse}
          onOpenPlacementTest={props.onOpenPlacementTest}
        />

        {/* オート再生トグルは各コースカードのヘッドホンポップオーバー内に統合済み
            （重複を避けるため一覧トップの単独トグルは撤去）。 */}

        {/* ピン留め: pinned フラグ付きコース（フェルミ系）— トレーニングの最上位に表示 */}
        {(() => {
          const pinnedCourses = getPinnedCourses()
          if (pinnedCourses.length === 0) return null
          // 他カテゴリと同じ collapsedGroups の開閉メカニズムに含める（擬似グループID）
          const pinnedGroupId = 'pinned-fermi'
          const pinnedLabel = t('roadmap.pinnedFermiLabel')
          const collapsed = collapsedGroups.has(pinnedGroupId)
          const panelId = `course-group-${pinnedGroupId}`
          return (
            <div key="pinned-fermi" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => toggleGroup(pinnedGroupId)}
                aria-expanded={!collapsed}
                aria-controls={panelId}
                aria-label={collapsed ? t('roadmap.expandGroupAria', { group: pinnedLabel }) : t('roadmap.collapseGroupAria', { group: pinnedLabel })}
                style={{ padding: '8px 4px 0', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'inherit', font: 'inherit' }}
              >
                <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: 'var(--text-secondary)', display: 'inline-flex' }}>
                  {collapsed
                    ? <ChevronRightIcon width={18} height={18} />
                    : <ChevronDownIcon width={18} height={18} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '1.0667rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.005em' }}>{pinnedLabel}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>{t('roadmap.pinnedFermiDescription')}</span>
                </span>
              </button>
              {!collapsed && (
                <div id={panelId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {pinnedCourses.map(course => {
                    const v = CATEGORY_VISUAL[course.category] || DEFAULT_VISUAL
                    const cardImage = course.image || v.image
                    const cp = courseProgress(course, completedLessons)
                    return (
                      <CategoryCard
                        key={course.id}
                        name={course.title}
                        meta={t('roadmap.lessonCountAndLevel', { count: course.lessonIds.length, level: levelLabel(course.level) })}
                        image={cardImage}
                        progressDone={cp.done}
                        progressTotal={cp.total}
                        progressPercent={cp.percent}
                        onClick={() => props.onOpenCategory(v.routeKey)}
                        saveTarget={{
                          refId: v.routeKey,
                          title: course.title,
                          subtitle: course.category,
                          image: cardImage,
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* グループ別コース一覧 — 7グループ・全41コース（フェルミ系は pinned で最上段に別出しするので除外） */}
        {COURSE_GROUPS.map(group => {
          const groupCourses = getCoursesByGroup(group.id).filter(c => !c.pinned)
          if (groupCourses.length === 0) return null
          const collapsed = collapsedGroups.has(group.id)
          const panelId = `course-group-${group.id}`
          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={!collapsed}
                aria-controls={panelId}
                aria-label={collapsed ? t('roadmap.expandGroupAria', { group: group.label }) : t('roadmap.collapseGroupAria', { group: group.label })}
                style={{ padding: '8px 4px 0', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'inherit', font: 'inherit' }}
              >
                <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: 'var(--text-secondary)', display: 'inline-flex' }}>
                  {collapsed
                    ? <ChevronRightIcon width={18} height={18} />
                    : <ChevronDownIcon width={18} height={18} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '1.0667rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.005em' }}>{group.label}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>{group.description}</span>
                </span>
              </button>
              {!collapsed && (
                <div id={panelId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {groupCourses.map(course => {
                    const v = CATEGORY_VISUAL[course.category] || DEFAULT_VISUAL
                    const cardImage = course.image || v.image
                    const cp = courseProgress(course, completedLessons)
                    return (
                      <CategoryCard
                        key={course.id}
                        name={course.title}
                        meta={t('roadmap.lessonCountAndLevel', { count: course.lessonIds.length, level: levelLabel(course.level) })}
                        image={cardImage}
                        progressDone={cp.done}
                        progressTotal={cp.total}
                        progressPercent={cp.percent}
                        onClick={() => props.onOpenCategory(v.routeKey)}
                        saveTarget={{
                          refId: v.routeKey,
                          title: course.title,
                          subtitle: course.category,
                          image: cardImage,
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showCustomSheet && (
        <CustomCourseSheet
          onClose={() => { setShowCustomSheet(false); refreshCustomCourses() }}
          onSaved={(course) => {
            setShowCustomSheet(false)
            refreshCustomCourses()
            props.onOpenCustomCourse?.(course.id)
          }}
          onUpgrade={props.onUpgrade}
        />
      )}
    </div>
  )
}

// ──────── 検索オーバーレイ（虫眼鏡から開く検索 UI） ────────
function SearchOverlay(p: {
  searchQuery: string
  setSearchQuery: (s: string) => void
  levelFilters: Set<LevelFilter>; setLevelFilters: (s: Set<LevelFilter>) => void
  progressFilters: Set<ProgressFilter>; setProgressFilters: (s: Set<ProgressFilter>) => void
  formatFilters: Set<FormatFilter>; setFormatFilters: (s: Set<FormatFilter>) => void
  sortOption: SortOption; setSortOption: (s: SortOption) => void
  showSearch: boolean
  onClose: () => void
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
}) {
  // AI 検索の状態
  const [aiResults, setAiResults] = useState<ResolvedAiHit[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiQuery, setAiQuery] = useState('')   // AI 検索を実行したクエリ（結果の見出し用）
  const abortRef = useRef<AbortController | null>(null)

  const clearAi = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setAiResults(null)
    setAiError(null)
    setAiLoading(false)
    setAiQuery('')
  }, [])

  const runAiSearch = useCallback(async () => {
    const q = p.searchQuery.trim()
    if (!q) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setAiLoading(true)
    setAiError(null)
    setAiResults(null)
    setAiQuery(q)
    saveSearchHistory(q)
    try {
      const results = await aiSearch(q, ctrl.signal)
      if (ctrl.signal.aborted) return
      setAiResults(results)
    } catch (e) {
      if (ctrl.signal.aborted) return
      setAiError(e instanceof Error && e.message ? e.message : t('roadmap.aiSearchError'))
    } finally {
      if (!ctrl.signal.aborted) setAiLoading(false)
    }
  }, [p.searchQuery])

  // 入力が変わったら前回の AI 結果は破棄（ステイル防止）
  const onChangeQuery = useCallback((v: string) => {
    p.setSearchQuery(v)
    if (aiResults !== null || aiError !== null || aiLoading) clearAi()
  }, [p, aiResults, aiError, aiLoading, clearAi])

  const showingAi = aiLoading || aiError !== null || aiResults !== null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      {/* 検索ヘッダ: 戻る + 入力 */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={p.onClose}
          aria-label={t('roadmap.searchClose')}
          style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <input
            type="search"
            autoFocus
            aria-label={t('roadmap.searchAria')}
            placeholder={t('roadmap.searchPlaceholder')}
            value={p.searchQuery}
            onChange={e => onChangeQuery(e.target.value)}
            onBlur={() => saveSearchHistory(p.searchQuery)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void runAiSearch() } }}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 38px 10px 38px',
              borderRadius: 12,
              border: `1px solid var(--border)`,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9333rem', outline: 'none',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--text-secondary)', display: 'inline-flex' }} aria-hidden="true">
            <SearchIcon width={16} height={16} />
          </span>
          {p.searchQuery && (
            <button onClick={() => { p.setSearchQuery(''); clearAi() }} aria-label={t('roadmap.searchClear')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-secondary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* AI 検索ボタン */}
      <div style={{ padding: '0 16px 8px' }}>
        <button
          type="button"
          onClick={() => void runAiSearch()}
          disabled={!p.searchQuery.trim() || aiLoading}
          aria-label={t('roadmap.aiSearchAria')}
          style={{
            width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: (!p.searchQuery.trim() || aiLoading) ? 'var(--bg-card)' : 'var(--accent)',
            color: (!p.searchQuery.trim() || aiLoading) ? 'var(--text-muted)' : 'var(--accent-fg)',
            border: (!p.searchQuery.trim() || aiLoading) ? `1px solid var(--border)` : 'none',
            borderRadius: 12, padding: '10px 14px',
            fontSize: '0.8667rem', fontWeight: 700,
            cursor: (!p.searchQuery.trim() || aiLoading) ? 'default' : 'pointer',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          <SparklesIcon width={16} height={16} />
          {aiLoading ? t('roadmap.aiSearching') : t('roadmap.aiSearchButton')}
        </button>
      </div>

      {/* AI 検索結果 / ローディング / エラー */}
      {showingAi ? (
        <AiSearchPanel
          query={aiQuery}
          loading={aiLoading}
          error={aiError}
          results={aiResults}
          onRetry={() => void runAiSearch()}
          onOpenLesson={p.onOpenLesson}
          onOpenCategory={p.onOpenCategory}
        />
      ) : (
        <>
          {/* キーワード検索のフィルタ・ソート */}
          <FilterBar
            levelFilters={p.levelFilters} setLevelFilters={p.setLevelFilters}
            progressFilters={p.progressFilters} setProgressFilters={p.setProgressFilters}
            formatFilters={p.formatFilters} setFormatFilters={p.setFormatFilters}
            sortOption={p.sortOption} setSortOption={p.setSortOption}
            showSort={p.showSearch}
          />
          <SearchPanel
            query={p.searchQuery}
            levelFilters={p.levelFilters}
            progressFilters={p.progressFilters}
            formatFilters={p.formatFilters}
            sortOption={p.sortOption}
            onOpenLesson={p.onOpenLesson}
            onOpenCategory={p.onOpenCategory}
            onPickKeyword={(k) => onChangeQuery(k)}
          />
        </>
      )}
    </div>
  )
}

// ──────── AI 検索結果パネル ────────
function AiSearchPanel(p: {
  query: string
  loading: boolean
  error: string | null
  results: ResolvedAiHit[] | null
  onRetry: () => void
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
}) {
  if (p.loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9333rem' }}>
        {t('roadmap.aiSearching')}
      </div>
    )
  }
  if (p.error) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9333rem', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div>{t('roadmap.aiSearchError')}</div>
        <button type="button" onClick={p.onRetry}
          style={{ background: 'var(--accent-soft)', color: 'var(--brand)', border: 'none', borderRadius: 'var(--radius-pill)', padding: '8px 16px', fontSize: '0.8667rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {t('roadmap.aiSearchRetry')}
        </button>
      </div>
    )
  }
  const results = p.results ?? []
  if (results.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9333rem' }}>
        {t('roadmap.aiSearchEmpty')}
        <br /><span style={{ fontSize: '0.8rem' }}>{t('roadmap.searchQueryNotice', { q: p.query })}</span>
      </div>
    )
  }
  return (
    <div style={{ flex: 1, padding: '8px 16px 100px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
      <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', fontWeight: 600, padding: '0 2px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <SparklesIcon width={12} height={12} />
        {t('roadmap.aiResultsCount', { count: results.length })}
      </div>
      {results.map(r => r.kind === 'course'
        ? <AiCourseCard key={`ai-c-${r.course.id}`} course={r.course} reason={r.reason} onOpen={() => p.onOpenCategory(r.course.category)} />
        : <AiLessonCard key={`ai-l-${r.lesson.id}`} lesson={r.lesson} reason={r.reason} onOpen={() => p.onOpenLesson(r.lesson.id)} />
      )}
    </div>
  )
}

function AiCourseCard({ course, reason, onOpen }: { course: Course; reason: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      aria-label={t('roadmap.courseAria', { category: course.category, title: course.title, done: 0, total: course.lessonIds.length })}
      style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, border: `1px solid var(--border)`, color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,142,245,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7333rem', color: 'var(--brand)', fontWeight: 700, marginBottom: 2 }}>{t('roadmap.coursePrefix', { category: course.category })}</div>
        <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: reason ? 4 : 0, lineHeight: 1.3 }}>{course.title}</div>
        {reason && <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{reason}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" style={{ marginTop: 10, flexShrink: 0 }} aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}

function AiLessonCard({ lesson, reason, onOpen }: { lesson: LessonData; reason: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      aria-label={t('roadmap.lessonAria', { title: lesson.title })}
      style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,142,245,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
        <LessonIcon id={lesson.id} action="lesson" size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{lesson.category}</div>
        <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: reason ? 4 : 0, lineHeight: 1.3 }}>{lesson.title}</div>
        {reason && <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{reason}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" style={{ marginTop: 10, flexShrink: 0 }} aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}

// ──────── あなた専用コース（AI生成）セクション ────────
// 他カテゴリ（COURSE_GROUPS）と同じ collapsedGroups 開閉機構に乗せる（T-W）。
// 開閉トグル UI・アイコン（ChevronDown/Right）・aria 文言（expand/collapseGroupAria）は
// 既存カテゴリのヘッダと共通のものを流用し、新規開閉ロジック・新規 i18n は増やさない。
// デフォルト折りたたみ（collapsed=true）は呼び出し元の collapsedGroups 初期集合で表現する。
function CustomCourseSection({
  courses,
  collapsed,
  onToggle,
  onCreate,
  onOpen,
  onDelete,
}: {
  courses: CustomCourse[]
  collapsed: boolean
  onToggle: () => void
  onCreate: () => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}) {
  const label = t('customCourse.sectionTitle')
  const panelId = `course-group-${CUSTOM_COURSE_GROUP_ID}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 開閉トグル（他カテゴリと同じヘッダ UI）。コースが 0 件でもヘッダは表示する */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={panelId}
        aria-label={collapsed ? t('roadmap.expandGroupAria', { group: label }) : t('roadmap.collapseGroupAria', { group: label })}
        style={{ padding: '8px 4px 0', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'inherit', font: 'inherit' }}
      >
        <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: 'var(--text-secondary)', display: 'inline-flex' }}>
          {collapsed
            ? <ChevronRightIcon width={18} height={18} />
            : <ChevronDownIcon width={18} height={18} />}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '1.0667rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.005em' }}>{label}</span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>{t('customCourse.sectionDesc')}</span>
        </span>
      </button>

      {!collapsed && (
        <div id={panelId} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map(course => (
              <div
                key={course.id}
                style={{ display: 'flex', alignItems: 'stretch', background: 'var(--bg-card)', borderRadius: 14, overflow: 'hidden', border: `1.5px solid color-mix(in srgb, var(--brand) 18%, transparent)`, boxShadow: 'var(--shadow-v3-card-inset)' }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(course.id)}
                  aria-label={t('customCourse.openAria', { title: course.title })}
                  style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `color-mix(in srgb, var(--brand) 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                    <SparklesIcon width={18} height={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{t('customCourse.previewLessons', { count: course.lessonIds.length })}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(course.id)}
                  aria-label={t('customCourse.deleteAria')}
                  style={{ flexShrink: 0, width: 44, background: 'transparent', border: 'none', borderLeft: `1px solid var(--border)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
          )}

      {/* 作成ボタン（コースの有無に関わらず、展開時は常に表示） */}
      <button
        type="button"
        onClick={onCreate}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: courses.length > 0 ? 'var(--bg-card)' : 'var(--accent)', color: courses.length > 0 ? 'var(--brand)' : 'var(--accent-fg)', border: courses.length > 0 ? `1px dashed color-mix(in srgb, var(--brand) 40%, transparent)` : 'none', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', boxShadow: courses.length > 0 ? 'none' : 'var(--shadow-v3-hero)' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: courses.length > 0 ? `color-mix(in srgb, var(--brand) 10%, transparent)` : 'color-mix(in srgb, var(--accent-fg) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: courses.length > 0 ? 'var(--brand)' : 'var(--accent-fg)' }}>
          <SparklesIcon width={18} height={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9333rem', fontWeight: 800, lineHeight: 1.25 }}>{t('customCourse.createButton')}</div>
          <div style={{ fontSize: '0.7333rem', opacity: courses.length > 0 ? 0.75 : 0.9, marginTop: 3, lineHeight: 1.4 }}>{t('customCourse.createButtonDesc')}</div>
        </div>
      </button>
        </div>
      )}
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
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const sortItems: { id: SortOption; label: string }[] = [
    { id: 'relevance', label: t('roadmap.sortRelevance') },
    { id: 'level', label: t('roadmap.sortLevel') },
    { id: 'id', label: t('roadmap.sortId') },
  ]
  const sortLabel = sortItems.find(s => s.id === p.sortOption)?.label ?? t('roadmap.sortLabel')
  return (
    <div style={{ padding: '0 16px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {(['初級', '中級', '上級'] as LevelFilter[]).map(l => (
          <Pill key={l} active={p.levelFilters.has(l)} onClick={() => toggle(p.levelFilters, l, p.setLevelFilters)} label={levelLabel(l)} />
        ))}
        <Pill active={p.progressFilters.has('todo')} onClick={() => toggle(p.progressFilters, 'todo', p.setProgressFilters)} label={t('roadmap.filterTodo')} />
        <Pill active={p.progressFilters.has('done')} onClick={() => toggle(p.progressFilters, 'done', p.setProgressFilters)} label={t('roadmap.filterDone')} />
        <Pill active={p.formatFilters.has('quiz')} onClick={() => toggle(p.formatFilters, 'quiz', p.setFormatFilters)} label={t('roadmap.filterQuiz')} />
        <Pill active={p.formatFilters.has('think')} onClick={() => toggle(p.formatFilters, 'think', p.setFormatFilters)} label={t('roadmap.filterThink')} />
        <Pill active={p.formatFilters.has('case')} onClick={() => toggle(p.formatFilters, 'case', p.setFormatFilters)} label={t('roadmap.filterCase')} />
      </div>
      {p.showSort && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setSortSheetOpen(true)}
            aria-haspopup="dialog"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: `1px solid ${'var(--border)'}`, borderRadius: 8, padding: '4px 10px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {sortLabel}
            <span aria-hidden="true" style={{ fontSize: '0.6667rem', opacity: 0.7 }}>▾</span>
          </button>
          <ActionSheet
            open={sortSheetOpen}
            title={t('roadmap.sortLabel')}
            items={sortItems.map(s => ({ id: s.id, label: s.label }))}
            onSelect={(id) => { p.setSortOption(id as SortOption); setSortSheetOpen(false) }}
            onCancel={() => setSortSheetOpen(false)}
          />
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
        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
        background: active ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--bg-card)',
        color: active ? 'var(--brand)' : 'var(--text-secondary)',
        fontSize: '0.8rem', fontWeight: 600,
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
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('roadmap.recentSearches')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.map(h => (
                <Pill key={h} active={false} onClick={() => p.onPickKeyword(h)} label={h} />
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('roadmap.suggestedKeywords')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {getSuggestedKeywords().map(k => (
              <Pill key={k} active={false} onClick={() => p.onPickKeyword(k)} label={k} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9333rem' }}>
        {hasQuery ? t('roadmap.noLessonsFound') : t('roadmap.noResults')}
        {hasQuery && (<><br /><span style={{ fontSize: '0.8rem' }}>{t('roadmap.searchQueryNotice', { q: p.query })}</span></>)}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: '8px 16px 100px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
      <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', fontWeight: 600, padding: '0 2px' }}>
        {t('roadmap.resultsCount', { count: results.length })}
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
      aria-label={t('roadmap.courseAria', { category: c.category, title: c.title, done: result.doneCount, total: result.totalCount })}
      style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${'var(--border)'}`, color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7333rem', color: 'var(--brand)', fontWeight: 700, marginBottom: 2 }}>{t('roadmap.coursePrefix', { category: c.category })}</div>
        <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, lineHeight: 1.3 }}>
          <Highlight text={c.title} query={query} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t('roadmap.courseDoneSummary', { level: levelLabel(c.level), done: result.doneCount, total: result.totalCount })}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}

function LessonResultCard({ result, query, onOpen }: { result: LessonResult; query: string; onOpen: () => void }) {
  const l = result.lesson
  const courseTitle = result.course?.title
  return (
    <button type="button" onClick={onOpen}
      aria-label={courseTitle ? t('roadmap.lessonAriaWithCourse', { title: l.title, course: courseTitle }) : t('roadmap.lessonAria', { title: l.title })}
      style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
        <LessonIcon id={l.id} action="lesson" size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          {result.level && (
            <span style={{ fontSize: '0.6667rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: result.level === '初級' ? 'rgba(52,211,153,.18)' : result.level === '中級' ? 'rgba(251,191,36,.18)' : 'rgba(248,113,113,.18)', color: result.level === '初級' ? '#34D399' : result.level === '中級' ? '#FBBF24' : 'var(--md-sys-color-error)' }}>{levelLabel(result.level)}</span>
          )}
          {result.status === 'done' && (
            <span style={{ fontSize: '0.6667rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'color-mix(in srgb, var(--accent) 18%, transparent)', color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {t('roadmap.doneBadge')}
            </span>
          )}
          <span style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)' }}>{l.category}{courseTitle ? ` · ${courseTitle}` : ''}</span>
        </div>
        <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: result.snippet ? 4 : 0, lineHeight: 1.3 }}>
          <Highlight text={l.title} query={query} />
        </div>
        {result.snippet && (
          <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <Highlight text={result.snippet} query={query} />
          </div>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" style={{ marginTop: 10, flexShrink: 0 }} aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}




const CATEGORY_ID_TO_NAMES: Record<string, string[]> = {
  logic: ['ロジカルシンキング', 'Logical Thinking'],
  case: ['ケース面接'],
  critical: ['クリティカルシンキング'],
  hypothesis: ['仮説思考'],
  'problem-setting': ['課題設定'],
  'issue-setting': ['論点設定'],
  'design-thinking': ['デザインシンキング'],
  lateral: ['ラテラルシンキング'],
  analogy: ['アナロジー思考'],
  systems: ['システムシンキング'],
  whywhy: ['なぜなぜ分析'],
  proposal: ['提案・伝える技術'],
  '提案書作成': ['提案書作成'],
  philosophy: ['哲学・思考の原理', 'philosophy'],
  '東洋思想': ['東洋思想'],
  'クライアントワーク': ['クライアントワーク'],
  'フェルミ推定': ['フェルミ推定'],
  numeracy: ['数値感覚', 'Numeracy'],
  '経営戦略': ['経営戦略', 'strategy'],
  'ピークパフォーマンス習慣': ['ピークパフォーマンス習慣', 'Peak Performance Habits'],
  cognitive: ['認知科学', 'Cognitive Science'],
  documentation: ['ドキュメンテーション', 'Documentation'],
  '構造化リスニング': ['構造化リスニング'],
  'ロジカルライティング': ['ロジカルライティング', 'Logical Writing'],
  'ADHDレバレッジ': ['ADHDレバレッジ'],
  '集中の技術': ['集中の技術'],
  '体力デザイン': ['体力デザイン', 'Stamina Design'],
}

// カテゴリID（ルートキー）→ 表示用ラベルを翻訳キー経由で解決
const CATEGORY_LABEL_KEY: Record<string, string> = {
  logic: 'category.logical',
  case: 'category.case',
  critical: 'category.critical',
  hypothesis: 'category.hypothesis',
  'problem-setting': 'category.problemSetting',
  'issue-setting': 'category.issueSetting',
  'design-thinking': 'category.designThinking',
  lateral: 'category.lateral',
  analogy: 'category.analogy',
  systems: 'category.systems',
  whywhy: 'category.whyWhy',
  proposal: 'category.proposal',
  '提案書作成': 'category.proposalWriting',
  philosophy: 'category.philosophy',
  '東洋思想': 'category.eastern',
  'クライアントワーク': 'category.clientWork',
  'フェルミ推定': 'category.fermi',
  numeracy: 'category.numeracy',
  '経営戦略': 'category.strategy',
  'ピークパフォーマンス習慣': 'category.peakPerformance',
  '履歴書・職務経歴書': 'category.careerResume',
  'SPI対策': 'category.careerSpi',
  '玉手箱対策': 'category.careerTamatebako',
  '面接対策': 'category.careerInterview',
  '給与交渉・退職実務': 'category.careerSalary',
  cognitive: 'category.cognitive',
  documentation: 'category.documentation',
  '構造化リスニング': 'category.listening',
  'ロジカルライティング': 'category.logicalWriting',
  'ADHDレバレッジ': 'category.adhdLeverage',
  '集中の技術': 'category.focus',
  '体力デザイン': 'category.stamina',
}

// カテゴリID → courseData が保持する日本語データ値（検索キー用）
const CATEGORY_DATA_LABEL: Record<string, string> = {
  logic: 'ロジカルシンキング',
  case: 'ケース面接',
  critical: 'クリティカルシンキング',
  hypothesis: '仮説思考',
  'problem-setting': '課題設定',
  'issue-setting': '論点設定',
  'design-thinking': 'デザインシンキング',
  lateral: 'ラテラルシンキング',
  analogy: 'アナロジー思考',
  systems: 'システムシンキング',
  whywhy: 'なぜなぜ分析',
  proposal: '提案・伝える技術',
  '提案書作成': '提案書作成',
  philosophy: '哲学・思考の原理',
  '東洋思想': '東洋思想',
  'クライアントワーク': 'クライアントワーク',
  'フェルミ推定': 'フェルミ推定',
  numeracy: '数値感覚',
  '経営戦略': '経営戦略',
  cognitive: '認知科学',
  documentation: 'ドキュメンテーション',
  '構造化リスニング': '構造化リスニング',
  'ロジカルライティング': 'ロジカルライティング',
  'ADHDレバレッジ': 'ADHDレバレッジ',
  '集中の技術': '集中の技術',
  '体力デザイン': '体力デザイン',
}

function categoryLabel(category: string): string {
  const key = CATEGORY_LABEL_KEY[category]
  return key ? t(key) : category
}


function CategoryCard({ name, meta, progressDone, progressTotal, progressPercent, onClick, image, saveTarget }: {
  name: string
  meta: string
  progressDone?: number
  progressTotal?: number
  progressPercent?: number
  onClick: () => void
  image?: string
  saveTarget?: { refId: string; title: string; subtitle?: string; image?: string }
}) {
  const [saved, setSaved] = useState<boolean>(() => saveTarget ? isSaved('course', saveTarget.refId) : false)

  // 進捗バーを出すのは done/total/percent が揃っているコースカードのみ。
  const hasProgress = typeof progressPercent === 'number' && typeof progressTotal === 'number' && progressTotal > 0
  const pct = hasProgress ? progressPercent! : 0
  const done = progressDone ?? 0
  const total = progressTotal ?? 0
  const allDone = hasProgress && pct >= 100
  const started = hasProgress && pct > 0
  const progressAria = hasProgress
    ? t('roadmap.coursePercentAria', { percent: pct, done, total })
    : ''

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="cat-tile" onClick={onClick}
        aria-label={`${name}: ${meta}`}
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-v3-card-inset)', display: 'flex', flexDirection: 'column', border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', padding: 0, width: '100%' }}>
        {image && (
          <div style={{ width: '100%', aspectRatio: '2 / 1', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
            <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
        )}
        <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8667rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, lineHeight: 1.3 }}>{name}</div>
            <div style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{meta}</div>
          </div>
          {hasProgress && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={progressAria}
                style={{ height: 4, background: `color-mix(in srgb, var(--text-muted) 13%, transparent)`, borderRadius: 2, overflow: 'hidden' }}
              >
                <div style={{ height: '100%', width: `${pct}%`, background: allDone ? 'var(--success-bright)' : 'var(--brand)', borderRadius: 2, transition: 'width .3s' }} />
              </div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '0.7333rem', fontWeight: 700, color: allDone ? 'var(--success-bright)' : 'var(--brand)' }}>
                {started ? t('roadmap.coursePercentComplete', { percent: pct }) : t('roadmap.detailNotStarted')}
              </div>
            </div>
          )}
        </div>
      </button>
      {saveTarget && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            const next = toggleSaved({
              type: 'course',
              refId: saveTarget.refId,
              title: saveTarget.title,
              subtitle: saveTarget.subtitle,
              image: saveTarget.image,
            })
            setSaved(next)
          }}
          aria-label={saved ? t('roadmap.unsaveCourseAria') : t('roadmap.saveCourseAria')}
          aria-pressed={saved}
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(8,33,33,0.55)',
            backdropFilter: 'blur(6px)',
            border: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: saved ? 'var(--brand)' : '#fff',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 2,
          }}
        >
          {saved ? <BookmarkFilledIcon width={14} height={14} /> : <BookmarkIcon width={14} height={14} />}
        </button>
      )}
    </div>
  )
}

function CategoryDetailView({ category, onOpenLesson, onBack }: { category: string; onOpenLesson: (id: number) => void; onBack?: () => void }) {
  const flat = getAllLessonsFlat()
  const completed = new Set(getCompletedLessons())
  const completionCounts = getAllCompletionCounts()
  // courseData の category は日本語データ値で保持されているため、検索用には JP ラベルが必要
  const dataLabel = CATEGORY_DATA_LABEL[category] || category
  const headerLabel = categoryLabel(category)
  const courses = getCoursesByCategory(dataLabel)

  // コースが定義されていないカテゴリはフォールバック表示
  const candidates = CATEGORY_ID_TO_NAMES[category] || [dataLabel, category]
  const fallbackLessons = courses.length === 0
    ? Object.values(flat).filter((l): l is LessonData => !!l && candidates.includes(l.category)).sort((a, b) => a.id - b.id)
    : []

  const totalLessons = courses.length > 0
    ? courses.reduce((acc, c) => acc + c.lessonIds.length, 0)
    : fallbackLessons.length
  const completedCount = courses.length > 0
    ? courses.flatMap(c => c.lessonIds).filter(id => completed.has(`lesson-${id}`)).length
    : fallbackLessons.filter(l => completed.has(`lesson-${l.id}`)).length

  // このカテゴリ画面のヘッドホン =「コースを再生」。
  // カテゴリ内の全コースのレッスンをスライド順に読み上げ、各レッスンの末尾で
  // 次のレッスンへ自動遷移する（コース間の連鎖は同カテゴリ内に限る）。
  // 起点でコース再生セッションを張り、最初のレッスンを読み上げモードで開く。
  const coursePlayLessonIds = courses.length > 0
    ? courses.flatMap(c => c.lessonIds)
    : fallbackLessons.map(l => l.id)
  const coursePlaySupported = tts.isSupported() && coursePlayLessonIds.length > 0
  const handleCoursePlay = () => {
    if (!coursePlaySupported) return
    const firstId = startCoursePlay(coursePlayLessonIds)
    if (firstId != null) onOpenLesson(firstId)
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      <Header title={headerLabel} onBack={onBack} />
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', minWidth: 0 }}>
          {courses.length > 0 ? t('roadmap.detailCourseCount', { count: courses.length }) : ''}{t('roadmap.detailLessonCount', { count: totalLessons })} · {completedCount > 0 ? t('roadmap.detailCompleted', { done: completedCount, total: totalLessons }) : t('roadmap.detailNotStarted')}
        </div>
        {coursePlaySupported && (
          <TtsPopover
            lang={getLocale() === 'ja' ? 'ja-JP' : 'en-US'}
            playing={false}
            onTogglePlay={handleCoursePlay}
            iconSize={20}
            buttonStyle={{ width: 44, height: 44 }}
          />
        )}
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* コース単位表示 */}
        {courses.map((course) => {
          const courseLessons = course.lessonIds.map(id => flat[id]).filter((l): l is LessonData => !!l)
          const courseCompleted = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
          const allDone = courseCompleted === course.lessonIds.length
          const firstUndone = courseLessons.find(l => !completed.has(`lesson-${l.id}`))

          return (
            <div key={course.id} style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
              {/* コースヘッダー画像 */}
              {course.image && (
                <div style={{ width: '100%', aspectRatio: '2 / 1', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                  <img src={course.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
              {/* コースヘッダー */}
              <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.6667rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.06em', background: `color-mix(in srgb, var(--text-muted) 8%, transparent)`, borderRadius: 6, padding: '2px 7px' }}>
                    {course.category}
                  </div>
                  <div style={{ fontSize: '0.6667rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '.08em', background: 'var(--accent-soft)', borderRadius: 6, padding: '2px 7px' }}>
                    {course.level}
                  </div>
                  {allDone && (
                    <div style={{ fontSize: '0.6667rem', fontWeight: 700, color: 'var(--success-bright)', background: 'color-mix(in srgb, var(--success-bright) 9%, transparent)', borderRadius: 6, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                      {t('roadmap.doneBadge')}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '1.0667rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{course.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{course.description}</div>
                {/* プログレスバー */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)' }}>{t('roadmap.detailLessonCount', { count: course.lessonIds.length })}</div>
                    <div style={{ fontSize: '0.7333rem', color: 'var(--brand)', fontWeight: 600 }}>{courseCompleted}/{course.lessonIds.length}</div>
                  </div>
                  <div style={{ height: 4, background: `color-mix(in srgb, var(--text-muted) 13%, transparent)`, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(courseCompleted / course.lessonIds.length) * 100}%`, background: allDone ? 'var(--success-bright)' : 'var(--brand)', borderRadius: 2, transition: 'width .3s' }} />
                  </div>
                </div>
              </div>

              {/* レッスン一覧 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {courseLessons.map((lesson, idx) => {
                  const isDone = completed.has(`lesson-${lesson.id}`)
                  const isNext = firstUndone?.id === lesson.id
                  const completionCount = completionCounts[`lesson-${lesson.id}`] ?? 0
                  return (
                    <button type="button" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
                      aria-label={isDone
                        ? t('roadmap.lessonAriaInCourseDone', { n: idx + 1, title: lesson.title })
                        : isNext
                          ? t('roadmap.lessonAriaInCourseNext', { n: idx + 1, title: lesson.title })
                          : t('roadmap.lessonAriaInCourse', { n: idx + 1, title: lesson.title })}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${'var(--border)'}` : 'none', background: isNext ? `color-mix(in srgb, var(--brand) 3%, transparent)` : 'transparent', border: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
                      {/* ステップ番号 or 完了バッジ (回数に応じて表示が変化) */}
                      {isDone ? (
                        <CompletionBadge count={completionCount || 1} size={28} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isNext ? `color-mix(in srgb, var(--brand) 13%, transparent)` : `color-mix(in srgb, var(--text-muted) 9%, transparent)`, border: isNext ? `1.5px solid ${'var(--brand)'}` : 'none' }}>
                          <span style={{ fontSize: '0.7333rem', fontWeight: 700, color: isNext ? 'var(--brand)' : 'var(--text-muted)' }}>{idx + 1}</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9333rem', fontWeight: isNext ? 700 : 600, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.3 }}>{lesson.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {t('roadmap.stepCount', { count: lesson.steps?.length ?? 0 })}
                          {isDone && completionCount >= 2 && (
                            <span style={{ marginLeft: 8, color: 'var(--brand)', fontWeight: 700 }}>
                              {t('completed.timesDone', { n: String(Math.min(completionCount, 99)) })}
                            </span>
                          )}
                        </div>
                      </div>
                      {isNext && !isDone && (
                        <div style={{ fontSize: '0.6667rem', fontWeight: 700, color: 'var(--brand)', background: 'var(--accent-soft)', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>{t('roadmap.nextLabel')}</div>
                      )}
                      {!isDone && !isNext && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
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
          const completionCount = completionCounts[`lesson-${lesson.id}`] ?? 0
          return (
            <button type="button" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}
              aria-label={isDone ? t('roadmap.lessonAriaDone', { title: lesson.title }) : t('roadmap.lessonAria', { title: lesson.title })}
              style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'stretch', overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)', border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
              <div style={{ width: 80, height: 80, flexShrink: 0, overflow: 'hidden', borderRadius: '14px 0 0 14px' }}><LessonImage lessonId={lesson.id} size={80} /></div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>{lesson.title}</div>
                  <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)' }}>
                    {t('roadmap.stepCount', { count: lesson.steps?.length ?? 0 })}
                    {isDone && completionCount >= 2 && (
                      <span style={{ marginLeft: 8, color: 'var(--brand)', fontWeight: 700 }}>
                        {t('completed.timesDone', { n: String(Math.min(completionCount, 99)) })}
                      </span>
                    )}
                  </div>
                </div>
                {isDone ? (
                  <CompletionBadge count={completionCount || 1} size={26} />
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `color-mix(in srgb, var(--text-muted) 13%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
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
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: '14px 16px',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: `1.5px dashed color-mix(in srgb, var(--brand) 31%, transparent)`,
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
          background: 'var(--accent-soft)', color: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('roadmap.personalCreateTitle')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
            {t('roadmap.personalCreateDesc')}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
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
        background: `linear-gradient(135deg, color-mix(in srgb, var(--brand) 96%, transparent), color-mix(in srgb, var(--brand) 75%, transparent))`,
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-v3-card-inset)',
        cursor: 'pointer',
        color: 'var(--accent-fg)',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: '0.6667rem', fontWeight: 800, letterSpacing: '.1em', background: 'rgba(10,31,77,0.14)', padding: '2px 8px', borderRadius: 6 }}>{t('roadmap.personalBadge')}</div>
        {allDone && (
          <div style={{ fontSize: '0.6667rem', fontWeight: 800, letterSpacing: '.1em', background: 'rgba(10,31,77,0.18)', padding: '2px 8px', borderRadius: 6 }}>{t('roadmap.personalDoneBadge')}</div>
        )}
      </div>
      <div style={{ fontSize: '1.0667rem', fontWeight: 800, lineHeight: 1.35, marginBottom: 4 }}>{course.title}</div>
      <div style={{ fontSize: '0.8rem', lineHeight: 1.55, marginBottom: 10 }}>
        {weakest ? t('roadmap.personalSubtitleWeak', { axis: axisLabel(weakest).label, total }) : t('roadmap.personalSubtitleDefault', { total })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(10,31,77,0.20)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(completedCount / Math.max(1, total)) * 100}%`, background: 'var(--accent-fg)', borderRadius: 2, transition: 'width .3s' }} />
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{completedCount}/{total}</div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
          {allDone ? t('roadmap.personalCtaRedo') : completedCount > 0 ? t('roadmap.personalCtaContinue') : t('roadmap.personalCtaStart')}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </button>
  )
}

