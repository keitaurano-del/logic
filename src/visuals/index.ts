import type { ComponentType, ReactElement } from 'react'
import { createElement } from 'react'

/**
 * Visual に渡す props の型。
 *
 * 各 Visual コンポーネントが個別に Props 型を持っている（例: `ThreePillarsProps`）が、
 * registry 側ではすべて `Record<string, unknown>` として扱い、コンポーネント側の
 * default 値で未指定フィールドを補完する設計。lesson データ側は対象 Visual の
 * JSDoc / Props 型を見て必要な key を埋める。
 */
export type VisualProps = Record<string, unknown>
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
import { IcebergModelVisual } from './IcebergModelVisual'
import { SystemArchetypeVisual } from './SystemArchetypeVisual'
import { CausalLoopDiagramVisual } from './CausalLoopDiagramVisual'
import { EmpathyMapVisual } from './EmpathyMapVisual'
import { JtbdVisual } from './JtbdVisual'
import { DesignThinkingCycleVisual } from './DesignThinkingCycleVisual'
import { HypothesisFlowVisual } from './HypothesisFlowVisual'
import { MvpTestDesignVisual } from './MvpTestDesignVisual'
// Phase 1: whyWhy 系 v3 移植
import { WhyWhySymptomVsRootVisual } from './WhyWhySymptomVsRootVisual'
import { WhyWhyChainVisual } from './WhyWhyChainVisual'
import { WhyWhyVsLogicTreeVisual } from './WhyWhyVsLogicTreeVisual'
import { WhyWhyToyotaVisual } from './WhyWhyToyotaVisual'
import { WhyWhyStopRuleVisual } from './WhyWhyStopRuleVisual'
import { WhyWhyPitfallsVisual } from './WhyWhyPitfallsVisual'
import { WhyWhyParallelVisual } from './WhyWhyParallelVisual'
import { WhyWhyEvidenceVisual } from './WhyWhyEvidenceVisual'
// Phase 2: 超高優先 6 種
import { Two2MatrixVisual } from './Two2MatrixVisual'
import { FeedbackLoopVisual } from './FeedbackLoopVisual'
import { FermiFormulaVisual } from './FermiFormulaVisual'
import { MeceVennDiagram } from './MeceVennDiagram'
import { ThreePillarsVisual } from './ThreePillarsVisual'
import { GraphPitfallsVisual } from './GraphPitfallsVisual'
// Phase 3-B: 提案 / ラテラル / 戦略
import { ScrStructureVisual } from './ScrStructureVisual'
import { WhereWhyHowVisual } from './WhereWhyHowVisual'
import { ClaimReasonAssumptionVisual } from './ClaimReasonAssumptionVisual'
import { SixHatsVisual } from './SixHatsVisual'
import { ScamperVisual } from './ScamperVisual'
import { VerticalVsLateralVisual } from './VerticalVsLateralVisual'
import { TriadVisual } from './TriadVisual'
import { FiveForcesVisual } from './FiveForcesVisual'
import { VrioVisual } from './VrioVisual'
import { LeveragePointsVisual } from './LeveragePointsVisual'
// Phase 3-C: 数字 / フェルミ / その他
import { FermiStepsVisual } from './FermiStepsVisual'
import { MentalMathDecisionTreeVisual } from './MentalMathDecisionTreeVisual'
import { DistributionShapeVisual } from './DistributionShapeVisual'
import { ExponentialCurveVisual } from './ExponentialCurveVisual'
import { AbsoluteVsRelativeVisual } from './AbsoluteVsRelativeVisual'
import { TrolleyProblemVisual } from './TrolleyProblemVisual'
import { FallacyGridVisual } from './FallacyGridVisual'
import { CorrelationCausationVisual } from './CorrelationCausationVisual'
// Documentation course (lesson 721-726): 専用 Visual 5 種
import { GoodBadSlideVisual } from './GoodBadSlideVisual'
import { LayoutVisual } from './LayoutVisual'
import { TypographyVisual } from './TypographyVisual'
import { ColorPaletteVisual } from './ColorPaletteVisual'
import { ChartTypeGuideVisual } from './ChartTypeGuideVisual'
// Fermi expansion (Phase A): lesson 205 / 210 / 212 / 214 / 215 / 216
import { FermiBaseDataVisual } from './FermiBaseDataVisual'
import { FermiPatternMatrixVisual } from './FermiPatternMatrixVisual'
import { FermiAreaApproachVisual } from './FermiAreaApproachVisual'
import { FermiMacroMicroSplitVisual } from './FermiMacroMicroSplitVisual'
import { FermiDemandDivSupplyVisual } from './FermiDemandDivSupplyVisual'
import { FermiCrossCheckVisual } from './FermiCrossCheckVisual'
// ADHD leverage course (lesson 801 / 804): 2 種類のマトリクス系図解
import { IgnitionMapVisual } from './IgnitionMapVisual'
import { TraitEnvironmentMatrixVisual } from './TraitEnvironmentMatrixVisual'
// Listening course (lesson 730-736): 構造化リスニング 5 種
import { FactEmotionInterpretationVisual } from './FactEmotionInterpretationVisual'
import { SilenceTypesVisual } from './SilenceTypesVisual'
import { SPINStructureVisual } from './SPINStructureVisual'
import { BANTGridVisual } from './BANTGridVisual'
import { OneOnOneFlowVisual } from './OneOnOneFlowVisual'
// Phase 2-1: 新規図解部品 3 種（2026-05-26）
import { AnswerContrastDiagram } from './AnswerContrastDiagram'
import { NormalDistribution68Diagram } from './NormalDistribution68Diagram'
import { FalsePositiveGridDiagram } from './FalsePositiveGridDiagram'
// Phase 2-2: numeracy 数値系 3 種（2026-05-26）
import { ContributionWaterfallDiagram } from './ContributionWaterfallDiagram'
import { SimpsonsParadoxDiagram } from './SimpsonsParadoxDiagram'
import { RuleOf72Diagram } from './RuleOf72Diagram'

/**
 * visualId → Visual component の registry
 * lessonData.ts の step.visual で文字列指定された ID をここで解決する
 * 未登録の visualId は null を返し、レンダラー側で fallback 処理する
 *
 * 各 Visual は個別の Props 型（例: `ThreePillarsProps`）を持つが、registry 側では
 * 一律 `ComponentType<any>` として扱う。`renderVisual` から渡される props は
 * 上位の lesson データで `step.visualProps: Record<string, unknown>` として宣言され、
 * Visual 側の default 値とマージされる設計のため、ここで個別 Props を強制すると
 * 各 Visual の Props 型の contravariance 問題で型互換にできない。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry は各 Visual の Props 型を吸収する必要あり
export const visualRegistry: Record<string, ComponentType<any>> = {
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
  IcebergModelDiagram: IcebergModelVisual,
  SystemArchetypeDiagram: SystemArchetypeVisual,
  CausalLoopDiagram: CausalLoopDiagramVisual,
  EmpathyMapDiagram: EmpathyMapVisual,
  JtbdDiagram: JtbdVisual,
  DesignThinkingCycleDiagram: DesignThinkingCycleVisual,
  HypothesisFlowDiagram: HypothesisFlowVisual,
  MvpTestDesignDiagram: MvpTestDesignVisual,
  // Phase 1: whyWhy 系
  WhyWhySymptomVsRootDiagram: WhyWhySymptomVsRootVisual,
  WhyWhyChainDiagram: WhyWhyChainVisual,
  WhyWhyVsLogicTreeDiagram: WhyWhyVsLogicTreeVisual,
  WhyWhyToyotaDiagram: WhyWhyToyotaVisual,
  WhyWhyStopRuleDiagram: WhyWhyStopRuleVisual,
  WhyWhyPitfallsDiagram: WhyWhyPitfallsVisual,
  WhyWhyParallelDiagram: WhyWhyParallelVisual,
  WhyWhyEvidenceDiagram: WhyWhyEvidenceVisual,
  // Phase 2: 超高優先
  Two2MatrixDiagram: Two2MatrixVisual,
  FeedbackLoopDiagram: FeedbackLoopVisual,
  FermiFormulaDiagram: FermiFormulaVisual,
  MeceVennDiagram: MeceVennDiagram,
  ThreePillarsDiagram: ThreePillarsVisual,
  GraphPitfallsDiagram: GraphPitfallsVisual,
  // Phase 3-B
  ScrStructureDiagram: ScrStructureVisual,
  WhereWhyHowDiagram: WhereWhyHowVisual,
  ClaimReasonAssumptionDiagram: ClaimReasonAssumptionVisual,
  SixHatsDiagram: SixHatsVisual,
  ScamperDiagram: ScamperVisual,
  VerticalVsLateralDiagram: VerticalVsLateralVisual,
  TriadDiagram: TriadVisual,
  FiveForcesDiagram: FiveForcesVisual,
  VrioDiagram: VrioVisual,
  LeveragePointsDiagram: LeveragePointsVisual,
  // Phase 3-C
  FermiStepsDiagram: FermiStepsVisual,
  MentalMathDecisionTreeDiagram: MentalMathDecisionTreeVisual,
  DistributionShapeDiagram: DistributionShapeVisual,
  ExponentialCurveDiagram: ExponentialCurveVisual,
  AbsoluteVsRelativeDiagram: AbsoluteVsRelativeVisual,
  TrolleyProblemDiagram: TrolleyProblemVisual,
  FallacyGridDiagram: FallacyGridVisual,
  CorrelationCausationDiagram: CorrelationCausationVisual,
  // Documentation course
  GoodBadSlideDiagram: GoodBadSlideVisual,
  LayoutDiagram: LayoutVisual,
  TypographyDiagram: TypographyVisual,
  ColorPaletteDiagram: ColorPaletteVisual,
  ChartTypeGuideDiagram: ChartTypeGuideVisual,
  // Fermi expansion (Phase A)
  FermiBaseDataDiagram: FermiBaseDataVisual,
  FermiPatternMatrixDiagram: FermiPatternMatrixVisual,
  FermiAreaApproachDiagram: FermiAreaApproachVisual,
  FermiMacroMicroSplitDiagram: FermiMacroMicroSplitVisual,
  FermiDemandDivSupplyDiagram: FermiDemandDivSupplyVisual,
  FermiCrossCheckDiagram: FermiCrossCheckVisual,
  // ADHD leverage course
  IgnitionMapDiagram: IgnitionMapVisual,
  TraitEnvironmentMatrixDiagram: TraitEnvironmentMatrixVisual,
  // Listening course (lesson 730-736)
  FactEmotionInterpretationDiagram: FactEmotionInterpretationVisual,
  SilenceTypesDiagram: SilenceTypesVisual,
  SPINStructureDiagram: SPINStructureVisual,
  BANTGridDiagram: BANTGridVisual,
  OneOnOneFlowDiagram: OneOnOneFlowVisual,
  // Phase 2-1: 新規図解部品（2026-05-26）
  AnswerContrastDiagram: AnswerContrastDiagram,
  NormalDistribution68Diagram: NormalDistribution68Diagram,
  FalsePositiveGridDiagram: FalsePositiveGridDiagram,
  // Phase 2-2: numeracy 数値系（2026-05-26）
  ContributionWaterfallDiagram: ContributionWaterfallDiagram,
  SimpsonsParadoxDiagram: SimpsonsParadoxDiagram,
  RuleOf72Diagram: RuleOf72Diagram,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry の Comp 型に揃える
export function getVisualComponent(id: string): ComponentType<any> | null {
  return visualRegistry[id] || null
}

/**
 * visualId に対応する component を ReactElement として返す。
 * 未登録なら null。レンダラー側で動的に component を取り扱わなくて済むよう、
 * createElement で要素化までこちらで完結させる。
 *
 * 第 2 引数 `props` で Visual 内容を差し替えできる。未指定なら各 Visual の default
 * 値が使われ、後方互換が保たれる（既存の `renderVisual(id)` 呼び出しはそのまま）。
 * lesson データ側は `step.visualProps` で props を埋め、`lessonSlides.ts` 経由で
 * ここへ渡される。
 */
export function renderVisual(id: string, props?: VisualProps): ReactElement | null {
  const Comp = visualRegistry[id]
  if (!Comp) return null
  return createElement(Comp, props ?? {})
}
