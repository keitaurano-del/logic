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

export type LessonStep = QuizStep | ExplainStep

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

// Logic lessons swap by locale
const _activeLogicLessons = (): Record<number, LessonData> =>
  getLocale() === 'en' ? logicLessonMapEn : logicLessonMap

export const allLessons: Record<number, LessonData> = new Proxy({} as Record<number, LessonData>, {
  get(_t, prop) {
    const base: Record<number, LessonData> = {
      ..._activeLogicLessons(),
      ...caseLessonMap,
      ...criticalLessonMap,
      ...hypothesisLessonMap,
      ...problemSettingLessonMap,
      ...designThinkingLessonMap,
      ...lateralThinkingLessonMap,
      ...analogyThinkingLessonMap,
      ...systemsThinkingLessonMap,
    }
    return base[prop as unknown as number]
  },
  has(_t, prop) {
    const base: Record<number, LessonData> = {
      ..._activeLogicLessons(), ...caseLessonMap, ...criticalLessonMap,
      ...hypothesisLessonMap, ...problemSettingLessonMap, ...designThinkingLessonMap,
      ...lateralThinkingLessonMap, ...analogyThinkingLessonMap, ...systemsThinkingLessonMap,
    }
    return prop in base
  },
})

// Proxyは Object.values() で列挙できないため、フラットな Map を返すヘルパー
export function getAllLessonsFlat(): Record<number, LessonData> {
  return {
    ..._activeLogicLessons(),
    ...caseLessonMap,
    ...criticalLessonMap,
    ...hypothesisLessonMap,
    ...problemSettingLessonMap,
    ...designThinkingLessonMap,
    ...lateralThinkingLessonMap,
    ...analogyThinkingLessonMap,
    ...systemsThinkingLessonMap,
  }
}
