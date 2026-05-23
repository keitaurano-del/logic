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
