export type QuizOption = {
  label: string
  correct: boolean
}

export type QuizStep = {
  type: 'quiz'
  question: string
  options: QuizOption[]
  explanation: string
}

export type ExplainStep = {
  type: 'explain'
  title: string
  content: string
  visual?: string
}

// SCRUM-新: 思考系ステップタイプ
// type: 'think' — 自由記述思考問題
// type: 'case'  — ケース問題（段階情報開示）

export type ThinkStep = {
  type: 'think'
  question: string           // 考えてほしい問い
  hint?: string              // 考えるヒント（任意）
  modelAnswer: string        // モデル解答（「答えを見る」で開示）
  points: string[]           // 考え方のポイント
}

export type CasePhase = {
  info: string               // 開示される情報
  question: string           // この時点での問い
  options: { label: string; correct: boolean; feedback: string }[]
}

export type CaseStep = {
  type: 'case'
  title: string              // ケースタイトル
  situation: string          // 初期状況説明
  phases: CasePhase[]        // 段階的に展開するフェーズ
  conclusion: string         // 最終フレームワーク・まとめ
}

export type LessonStep = QuizStep | ExplainStep | ThinkStep | CaseStep

export type LessonData = {
  id: number
  title: string
  category: string
  steps: LessonStep[]
}

import { logicLessonMap } from './logicLessons'
import { logicLessonMapEn } from './logicLessonsEn'
import { getLocale } from './i18n'
import { caseLessonMap } from './caseLessons'
import { caseLessonMapEn } from './caseLessonsEn'
import { criticalLessonMap } from './criticalLessons'
import { criticalLessonMapEn } from './criticalLessonsEn'
import { hypothesisLessonMap } from './hypothesisLessons'
import { hypothesisLessonMapEn } from './hypothesisLessonsEn'
import { problemSettingLessonMap } from './problemSettingLessons'
import { problemSettingLessonMapEn } from './problemSettingLessonsEn'
import { designThinkingLessonMap } from './designThinkingLessons'
import { designThinkingLessonMapEn } from './designThinkingLessonsEn'
import { lateralThinkingLessonMap } from './lateralThinkingLessons'
import { lateralThinkingLessonMapEn } from './lateralThinkingLessonsEn'
import { analogyThinkingLessonMap } from './analogyThinkingLessons'
import { analogyThinkingLessonMapEn } from './analogyThinkingLessonsEn'
import { systemsThinkingLessonMap } from './systemsThinkingLessons'
import { systemsThinkingLessonMapEn } from './systemsThinkingLessonsEn'
import { proposalLessonMap } from './proposalLessons'
import { proposalLessonMapEn } from './proposalLessonsEn'
import { proposalCourseLessonMap } from './proposalCourseLessons'
import { proposalCourseLessonMapEn } from './proposalCourseLessonsEn'
import { philosophyLessonMap } from './philosophyLessons'
import { philosophyLessonMapEn } from './philosophyLessonsEn'
import { easternPhilosophyLessonMap } from './easternPhilosophyLessons'
import { easternPhilosophyLessonMapEn } from './easternPhilosophyLessonsEn'
import { clientWorkLessonMap } from './clientWorkLessons'
import { clientWorkLessonMapEn } from './clientWorkLessonsEn'
import { catchupLessonMap } from './catchupLessons'
import { catchupLessonMapEn } from './catchupLessonsEn'
import { fermiLessonMap } from './fermiLessons'
import { fermiLessonMapEn } from './fermiLessonsEn'
import { extraLessonMap } from './extraLessons'
import { extraLessonMapEn } from './extraLessonsEn'
import { strategyLessonMap } from './strategyLessons'
import { strategyLessonMapEn } from './strategyLessonsEn'
import { numeracyLessonMap } from './numeracyLessons'
import { numeracyLessonMapEn } from './numeracyLessonsEn'
import { peakPerformanceLessonMap } from './peakPerformanceLessons'
import { peakPerformanceLessonMapEn } from './peakPerformanceLessonsEn'

// 全レッスンマップを locale で切り替える。en 版が存在するカテゴリは
// 英訳済みマップを、それ以外は ja 版にフォールバック (transitional)。
const _pickByLocale = <T>(ja: T, en: T): T => (getLocale() === 'en' ? en : ja)

// ロケールが変わるたびに再構築する以外は同じマージ結果を使い回す。
// Proxy / getAllLessonsFlat のホットパスで毎回 spread するのを避ける。
let _cachedMerged: Record<number, LessonData> | null = null
let _cachedLocale: string | null = null
function _getMergedLessons(): Record<number, LessonData> {
  const locale = getLocale()
  if (_cachedMerged && _cachedLocale === locale) return _cachedMerged
  _cachedMerged = {
    ..._pickByLocale(logicLessonMap, logicLessonMapEn),
    ..._pickByLocale(caseLessonMap, caseLessonMapEn),
    ..._pickByLocale(criticalLessonMap, criticalLessonMapEn),
    ..._pickByLocale(hypothesisLessonMap, hypothesisLessonMapEn),
    ..._pickByLocale(problemSettingLessonMap, problemSettingLessonMapEn),
    ..._pickByLocale(designThinkingLessonMap, designThinkingLessonMapEn),
    ..._pickByLocale(lateralThinkingLessonMap, lateralThinkingLessonMapEn),
    ..._pickByLocale(analogyThinkingLessonMap, analogyThinkingLessonMapEn),
    ..._pickByLocale(systemsThinkingLessonMap, systemsThinkingLessonMapEn),
    ..._pickByLocale(proposalLessonMap, proposalLessonMapEn),
    ..._pickByLocale(proposalCourseLessonMap, proposalCourseLessonMapEn),
    ..._pickByLocale(philosophyLessonMap, philosophyLessonMapEn),
    ..._pickByLocale(easternPhilosophyLessonMap, easternPhilosophyLessonMapEn),
    ..._pickByLocale(clientWorkLessonMap, clientWorkLessonMapEn),
    ..._pickByLocale(catchupLessonMap, catchupLessonMapEn),
    ..._pickByLocale(fermiLessonMap, fermiLessonMapEn),
    ..._pickByLocale(extraLessonMap, extraLessonMapEn),
    ..._pickByLocale(strategyLessonMap, strategyLessonMapEn),
    ..._pickByLocale(numeracyLessonMap, numeracyLessonMapEn),
    ..._pickByLocale(peakPerformanceLessonMap, peakPerformanceLessonMapEn),
  }
  _cachedLocale = locale
  return _cachedMerged
}

export const allLessons: Record<number, LessonData> = new Proxy({} as Record<number, LessonData>, {
  get(_t, prop) {
    return _getMergedLessons()[prop as unknown as number]
  },
  has(_t, prop) {
    return prop in _getMergedLessons()
  },
})

// Proxyは Object.values() で列挙できないため、フラットな Map を返すヘルパー
export function getAllLessonsFlat(): Record<number, LessonData> {
  return _getMergedLessons()
}
