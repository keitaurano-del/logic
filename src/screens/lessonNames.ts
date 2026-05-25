/**
 * src/screens/lessonNames.ts
 *
 * 「完了レッスン key」「useStudyTimer の activity key」から
 * 人間向け表示名・カテゴリ名を解決する共有ユーティリティ。
 *
 * CompletedLessonsScreen と StudyTimeScreen の両方から参照する。
 * 元実装は CompletedLessonsScreen.tsx 内にハードコードされていたものを抽出。
 */

import { allLessons } from '../lessonData'
import { t } from '../i18n'

// 内部カテゴリキー（日本語固定） → i18n キー
export const CATEGORY_LABEL_KEY: Record<string, string> = {
  'ロジカルシンキング': 'category.logical',
  'ケース面接': 'category.case',
  'クリティカルシンキング': 'category.critical',
  '仮説思考': 'category.hypothesis',
  '課題設定': 'category.problemSetting',
  '論点設定': 'category.issueSetting',
  'デザインシンキング': 'category.designThinking',
  'ラテラルシンキング': 'category.lateral',
  'アナロジー思考': 'category.analogy',
  'システムシンキング': 'category.systems',
  '構造化リスニング': 'category.listening',
  'ロジカルライティング': 'category.logicalWriting',
  'ADHDレバレッジ': 'category.adhdLeverage',
  'なぜなぜ分析': 'category.whyWhy',
  '数値感覚': 'category.numeracy',
  'ピークパフォーマンス習慣': 'category.peakPerformance',
  '集中の技術': 'category.focus',
  'フェルミ推定': 'category.fermi',
  '履歴書・職務経歴書': 'category.careerResume',
  'SPI対策': 'category.careerSpi',
  '玉手箱対策': 'category.careerTamatebako',
  '面接対策': 'category.careerInterview',
  '給与交渉・退職実務': 'category.careerSalary',
  '認知科学': 'category.cognitive',
  'ドキュメンテーション': 'category.documentation',
  'AI練習': 'completed.cat.aiPractice',
  'デイリー': 'completed.cat.daily',
  'ジャーナル': 'completed.cat.journal',
  '復習': 'completed.cat.review',
  'テスト': 'completed.cat.test',
}

export function categoryLabel(cat: string): string {
  const key = CATEGORY_LABEL_KEY[cat]
  return key ? t(key) : cat
}

const SPECIAL_NAME_KEY: Record<string, string> = {
  'fermi': 'completed.specialName.fermi',
  'daily-problem': 'completed.specialName.daily',
  'flashcards': 'completed.specialName.flashcards',
  'placement-test': 'completed.specialName.placementTest',
  'journal': 'completed.specialName.journal',
  'ai_problem': 'completed.specialName.aiProblem',
  'daily_problem': 'completed.specialName.daily',
  'flashcard': 'completed.specialName.flashcards',
}

export interface LessonMeta { name: string; category: string }

// 完了 key の固定マッピング。レッスンタイトルは可能なら allLessons 経由で動的解決する。
// （allLessons は i18n ロケールで自動切り替えされる）
export const LESSON_META_MAP: Record<string, LessonMeta> = {
  'fermi':          { name: 'フェルミ推定',      category: 'AI練習' },
  'daily-problem':  { name: '今日の問題',        category: 'デイリー' },
  'flashcards':     { name: 'フラッシュカード',  category: '復習' },
  'placement-test': { name: '実力診断テスト',    category: 'テスト' },
  'journal':        { name: 'ジャーナル',        category: 'ジャーナル' },
  'ai_problem':     { name: 'AI 問題演習',       category: 'AI練習' },
  'daily_problem':  { name: '今日の問題',        category: 'デイリー' },
  'flashcard':      { name: 'フラッシュカード',  category: '復習' },
}

/**
 * key からレッスン表示名を解決。
 *
 * 入力 key は以下のいずれかを想定:
 *   - "lesson-23"          completion key (recordCompletion 経由)
 *   - "lesson:23"          useStudyTimer の activity_type:activity_id 形式
 *   - "fermi" / "fermi:..." 等の特殊 key
 *   - "ai-problem-<id>"    AI 生成問題（id は表示せず "AI 問題演習" にまとめる）
 */
export function resolveLessonName(key: string): string {
  // useStudyTimer 形式: "lesson:23" / "fermi:default" を正規化
  if (key.includes(':')) {
    const [type, id] = key.split(':', 2)
    if (type === 'lesson' && id) {
      const lid = Number(id)
      if (Number.isFinite(lid) && allLessons[lid]?.title) return allLessons[lid].title
    }
    const sp = SPECIAL_NAME_KEY[type]
    if (sp) return t(sp)
    const meta = LESSON_META_MAP[type]
    if (meta) return meta.name
    return type
  }

  // "lesson-23" → allLessons[23]
  const m = /^lesson-(\d+)$/.exec(key)
  if (m) {
    const id = Number(m[1])
    return allLessons[id]?.title ?? `Lesson ${id}`
  }

  // AI 問題（id 部分は表示しない）
  if (/^ai-problem-/.test(key)) return t('completed.specialName.aiProblem')

  const sp = SPECIAL_NAME_KEY[key]
  if (sp) return t(sp)

  const meta = LESSON_META_MAP[key]
  if (meta) return meta.name

  return key
}

/**
 * key からカテゴリを解決。未知のものはフォールバック文字列を返す。
 */
export function resolveCategory(key: string): string {
  if (key.includes(':')) {
    const [type, id] = key.split(':', 2)
    if (type === 'lesson' && id) {
      const lid = Number(id)
      const cat = allLessons[lid]?.category
      if (cat) return cat
    }
    const meta = LESSON_META_MAP[type]
    if (meta) return meta.category
    return type
  }

  const m = /^lesson-(\d+)$/.exec(key)
  if (m) {
    const id = Number(m[1])
    const cat = allLessons[id]?.category
    if (cat) return cat
  }

  if (/^ai-problem-/.test(key)) return 'AI練習'

  const meta = LESSON_META_MAP[key]
  if (meta) return meta.category

  return t('completed.fallbackCategory')
}
