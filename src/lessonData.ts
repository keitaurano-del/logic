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
import { criticalLessonMap } from './criticalLessons'
import { hypothesisLessonMap } from './hypothesisLessons'
import { problemSettingLessonMap } from './problemSettingLessons'
import { designThinkingLessonMap } from './designThinkingLessons'
import { lateralThinkingLessonMap } from './lateralThinkingLessons'
import { analogyThinkingLessonMap } from './analogyThinkingLessons'
import { systemsThinkingLessonMap } from './systemsThinkingLessons'
import { proposalLessonMap } from './proposalLessons'
import { proposalCourseLessonMap } from './proposalCourseLessons'
import { philosophyLessonMap } from './philosophyLessons'
import { easternPhilosophyLessonMap } from './easternPhilosophyLessons'
import { clientWorkLessonMap } from './clientWorkLessons'
import { catchupLessonMap } from './catchupLessons'
import { fermiLessonMap } from './fermiLessons'
import { extraLessonMap } from './extraLessons'
import { strategyLessonMap } from './strategyLessons'
import { numeracyLessonMap } from './numeracyLessons'

// Logic lessons swap by locale
const _activeLogicLessons = (): Record<number, LessonData> =>
  getLocale() === 'en' ? logicLessonMapEn : logicLessonMap

// ロケールが変わるたびに再構築する以外は同じマージ結果を使い回す。
// Proxy / getAllLessonsFlat のホットパスで毎回 spread するのを避ける。
let _cachedMerged: Record<number, LessonData> | null = null
let _cachedLocale: string | null = null
function _getMergedLessons(): Record<number, LessonData> {
  const locale = getLocale()
  if (_cachedMerged && _cachedLocale === locale) return _cachedMerged
  _cachedMerged = {
    ..._activeLogicLessons(),
    ...caseLessonMap,
    ...criticalLessonMap,
    ...hypothesisLessonMap,
    ...problemSettingLessonMap,
    ...designThinkingLessonMap,
    ...lateralThinkingLessonMap,
    ...analogyThinkingLessonMap,
    ...systemsThinkingLessonMap,
    ...proposalLessonMap,
    ...proposalCourseLessonMap,
    ...philosophyLessonMap,
    ...easternPhilosophyLessonMap,
    ...clientWorkLessonMap,
    ...catchupLessonMap,
    ...fermiLessonMap,
    ...extraLessonMap,
    ...strategyLessonMap,
    ...numeracyLessonMap,
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
