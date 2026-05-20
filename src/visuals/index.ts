import type { ComponentType, ReactElement } from 'react'
import { createElement } from 'react'
import { MecePatternsVisual } from './MecePatternsVisual'
import { LogicTreeVisual } from './LogicTreeVisual'
import { SoWhatVisual } from './SoWhatVisual'
import { PyramidVisual } from './PyramidVisual'
import { PrepVisual } from './PrepVisual'
import { CaseStudyVisual } from './CaseStudyVisual'
import { DeductionVisual } from './DeductionVisual'
import { InductionVisual } from './InductionVisual'
import { ContrapositiveVisual } from './ContrapositiveVisual'
import { AbstractionLadderVisual } from './AbstractionLadderVisual'

/**
 * visualId → Visual component の registry
 * lessonData.ts の step.visual で文字列指定された ID をここで解決する
 * 未登録の visualId は null を返し、レンダラー側で fallback 処理する
 */
export const visualRegistry: Record<string, ComponentType> = {
  MecePatternsDiagram: MecePatternsVisual,
  LogicTreeDiagram: LogicTreeVisual,
  SoWhatDiagram: SoWhatVisual,
  PyramidDiagram: PyramidVisual,
  PrepDiagram: PrepVisual,
  CaseStudyDiagram: CaseStudyVisual,
  DeductionDiagram: DeductionVisual,
  InductionDiagram: InductionVisual,
  ContrapositiveDiagram: ContrapositiveVisual,
  AbstractionLadderDiagram: AbstractionLadderVisual,
}

export function getVisualComponent(id: string): ComponentType | null {
  return visualRegistry[id] || null
}

/**
 * visualId に対応する component を ReactElement として返す。
 * 未登録なら null。レンダラー側で動的に component を取り扱わなくて済むよう、
 * createElement で要素化までこちらで完結させる。
 */
export function renderVisual(id: string): ReactElement | null {
  const Comp = visualRegistry[id]
  if (!Comp) return null
  return createElement(Comp)
}
