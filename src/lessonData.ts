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
  /**
   * visual に渡す props（任意）。
   *
   * Visual コンポーネントは default 値を持っており、`visualProps` が未指定なら
   * default 表示のままになる。レッスンごとに内容を切り替えて Visual を multi-lesson
   * 共有したい場合は、対象 Visual の Props 型に合わせて key/value を埋める。
   *
   * 例:
   *   visual: 'ThreePillarsDiagram',
   *   visualProps: {
   *     sectionLabel: 'ソクラテスの問答法 — 3 つのステップ',
   *     pillars: [
   *       { title: '主張を聞く', body: '相手の前提を引き出す' },
   *       { title: '反例を挙げる', body: '矛盾を提示する' },
   *       { title: '再定義する', body: 'より正しい答えに迫る' },
   *     ],
   *   }
   *
   * 各 Visual の Props スキーマは `src/visuals/<Name>Visual.tsx` の JSDoc 参照。
   * `visualProps` を渡しても、Visual 側が未対応のフィールドは無視される。
   */
  visualProps?: Record<string, unknown>
  /**
   * visual の直後に挿入される「まとめ／応用」テキスト（80-150 字目安）。
   * visual で得たイメージを言語化して定着させる役割。
   * step.visual が設定されていない場合は無視される。
   * lessonSlides.ts の convertLessonToSlides で `concept` スライド（tag: 'まとめ'）として展開される。
   */
  outro?: string
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

import { getLocale } from './i18n'

// ============================================================================
// LR-20: レッスンデータの遅延ロード（コード分割）
// ----------------------------------------------------------------------------
// 以前は 34 カテゴリ × ja/en = 69 個のレッスンマップを「静的 import」で初期
// バンドルに同梱していた（レッスン系チャンクだけで ~2MB）。
//
// 本実装では:
//   1. 各レッスンマップを動的 import() に変更 → Vite が個別チャンクに分割し、
//      初期エントリ（AppV3 / index）から外れる。
//   2. getLocale() の言語のレッスンだけをロードする（未使用言語は読み込まない）。
//   3. 起動時に loadAllLessons() を一度だけ await して全カテゴリを並列ロードし、
//      module レベルのキャッシュに展開する。これにより allLessons[id] /
//      getAllLessonsFlat() の「同期 API」は従来どおり維持される（呼び出し側の
//      変更ゼロ）。ロード完了は AppV3 / App の boot ゲートで保証する。
//
// locale 切り替えは setLocale() が window.location.reload() を行うため、
// 1 セッション中に locale が変わることはない。よって常に「現在の locale の
// レッスンのみ」をメモリに保持すれば足りる。
// ============================================================================

type LessonMap = Record<number, LessonData>
type MapLoader = () => Promise<LessonMap>

// カテゴリごとの動的ローダー。[ja, en] のペアで保持し、getLocale() に応じて
// 片方だけを呼び出す。en 版が存在しないカテゴリは ja を en にもフォールバック。
const _loaders: Array<[ja: MapLoader, en: MapLoader]> = [
  [() => import('./logicLessons').then(m => m.logicLessonMap), () => import('./logicLessonsEn').then(m => m.logicLessonMapEn)],
  [() => import('./caseLessons').then(m => m.caseLessonMap), () => import('./caseLessonsEn').then(m => m.caseLessonMapEn)],
  [() => import('./criticalLessons').then(m => m.criticalLessonMap), () => import('./criticalLessonsEn').then(m => m.criticalLessonMapEn)],
  [() => import('./hypothesisLessons').then(m => m.hypothesisLessonMap), () => import('./hypothesisLessonsEn').then(m => m.hypothesisLessonMapEn)],
  [() => import('./problemSettingLessons').then(m => m.problemSettingLessonMap), () => import('./problemSettingLessonsEn').then(m => m.problemSettingLessonMapEn)],
  [() => import('./issueLessons').then(m => m.issueLessonMap), () => import('./issueLessonsEn').then(m => m.issueLessonMapEn)],
  [() => import('./designThinkingLessons').then(m => m.designThinkingLessonMap), () => import('./designThinkingLessonsEn').then(m => m.designThinkingLessonMapEn)],
  [() => import('./lateralThinkingLessons').then(m => m.lateralThinkingLessonMap), () => import('./lateralThinkingLessonsEn').then(m => m.lateralThinkingLessonMapEn)],
  [() => import('./analogyThinkingLessons').then(m => m.analogyThinkingLessonMap), () => import('./analogyThinkingLessonsEn').then(m => m.analogyThinkingLessonMapEn)],
  [() => import('./systemsThinkingLessons').then(m => m.systemsThinkingLessonMap), () => import('./systemsThinkingLessonsEn').then(m => m.systemsThinkingLessonMapEn)],
  [() => import('./proposalLessons').then(m => m.proposalLessonMap), () => import('./proposalLessonsEn').then(m => m.proposalLessonMapEn)],
  [() => import('./proposalCourseLessons').then(m => m.proposalCourseLessonMap), () => import('./proposalCourseLessonsEn').then(m => m.proposalCourseLessonMapEn)],
  [() => import('./philosophyLessons').then(m => m.philosophyLessonMap), () => import('./philosophyLessonsEn').then(m => m.philosophyLessonMapEn)],
  [() => import('./easternPhilosophyLessons').then(m => m.easternPhilosophyLessonMap), () => import('./easternPhilosophyLessonsEn').then(m => m.easternPhilosophyLessonMapEn)],
  [() => import('./clientWorkLessons').then(m => m.clientWorkLessonMap), () => import('./clientWorkLessonsEn').then(m => m.clientWorkLessonMapEn)],
  [() => import('./feedbackCaseLessons').then(m => m.feedbackCaseLessonMap), () => import('./feedbackCaseLessonsEn').then(m => m.feedbackCaseLessonMapEn)],
  [() => import('./catchupLessons').then(m => m.catchupLessonMap), () => import('./catchupLessonsEn').then(m => m.catchupLessonMapEn)],
  [() => import('./fermiLessons').then(m => m.fermiLessonMap), () => import('./fermiLessonsEn').then(m => m.fermiLessonMapEn)],
  [() => import('./fermiLessonsPattern').then(m => m.fermiLessonMapPattern), () => import('./fermiLessonsPatternEn').then(m => m.fermiLessonMapPatternEn)],
  [() => import('./fermiLessonsPractice').then(m => m.fermiLessonMapPractice), () => import('./fermiLessonsPracticeEn').then(m => m.fermiLessonMapPracticeEn)],
  [() => import('./extraLessons').then(m => m.extraLessonMap), () => import('./extraLessonsEn').then(m => m.extraLessonMapEn)],
  [() => import('./strategyLessons').then(m => m.strategyLessonMap), () => import('./strategyLessonsEn').then(m => m.strategyLessonMapEn)],
  [() => import('./numeracyLessons').then(m => m.numeracyLessonMap), () => import('./numeracyLessonsEn').then(m => m.numeracyLessonMapEn)],
  [() => import('./peakPerformanceLessons').then(m => m.peakPerformanceLessonMap), () => import('./peakPerformanceLessonsEn').then(m => m.peakPerformanceLessonMapEn)],
  // 体力デザインコース（lessonId 440-444）
  [() => import('./staminaLessons').then(m => m.staminaLessonMap), () => import('./staminaLessonsEn').then(m => m.staminaLessonMapEn)],
  [() => import('./whyWhyLessons').then(m => m.whyWhyLessonMap), () => import('./whyWhyLessonsEn').then(m => m.whyWhyLessonMapEn)],
  // 就職・転職コース群（ja 版のみ、en も同じ ja を一時的に使用）
  [() => import('./careerResumeLessons').then(m => m.careerResumeLessonMap), () => import('./careerResumeLessons').then(m => m.careerResumeLessonMap)],
  [() => import('./careerSpiLessons').then(m => m.careerSpiLessonMap), () => import('./careerSpiLessons').then(m => m.careerSpiLessonMap)],
  [() => import('./careerTamatebakoLessons').then(m => m.careerTamatebakoLessonMap), () => import('./careerTamatebakoLessons').then(m => m.careerTamatebakoLessonMap)],
  [() => import('./careerInterviewLessons').then(m => m.careerInterviewLessonMap), () => import('./careerInterviewLessons').then(m => m.careerInterviewLessonMap)],
  [() => import('./careerSalaryLessons').then(m => m.careerSalaryLessonMap), () => import('./careerSalaryLessons').then(m => m.careerSalaryLessonMap)],
  // 認知科学コース群
  [() => import('./cognitiveLessons').then(m => m.cognitiveLessonMap), () => import('./cognitiveLessonsEn').then(m => m.cognitiveLessonMapEn)],
  // ドキュメンテーションコース
  [() => import('./documentationLessons').then(m => m.documentationLessonMap), () => import('./documentationLessonsEn').then(m => m.documentationLessonMapEn)],
  // 構造化リスニングコース（ja のみ、en は ja を一時的に使用）
  [() => import('./listeningLessons').then(m => m.listeningLessonMap), () => import('./listeningLessons').then(m => m.listeningLessonMap)],
  // ADHD レバレッジコース（en は専用英訳あり）
  [() => import('./adhdLeverageLessons').then(m => m.adhdLeverageLessonMap), () => import('./adhdLeverageLessonsEn').then(m => m.adhdLeverageLessonMapEn)],
  // 「今に集中する」コース（マインドフルネス + 注意の技術）
  [() => import('./focusLessons').then(m => m.focusLessonMap), () => import('./focusLessonsEn').then(m => m.focusLessonMapEn)],
  // ロジカルライティングコース
  [() => import('./logicalWritingLessons').then(m => m.logicalWritingLessonMap), () => import('./logicalWritingLessonsEn').then(m => m.logicalWritingLessonMapEn)],
]

// 現在の locale でロード済みのマージ済みマップ。
let _cachedMerged: LessonMap | null = null
let _cachedLocale: string | null = null
// 進行中の読み込み Promise（多重起動を防ぐ）。
let _loadPromise: Promise<LessonMap> | null = null
let _loadPromiseLocale: string | null = null

/**
 * 現在の locale の全レッスンカテゴリを並列で動的 import し、module レベルの
 * キャッシュ（_cachedMerged）に展開する。冪等で、同一 locale の同時呼び出しは
 * 同じ Promise を共有する。
 *
 * 起動時（AppV3 / App の boot ゲート）で一度 await すれば、以降の
 * allLessons[id] / getAllLessonsFlat() は従来どおり同期で正しい値を返す。
 */
export async function loadAllLessons(): Promise<LessonMap> {
  const locale = getLocale()
  if (_cachedMerged && _cachedLocale === locale) return _cachedMerged
  if (_loadPromise && _loadPromiseLocale === locale) return _loadPromise

  const isEn = locale === 'en'
  _loadPromiseLocale = locale
  _loadPromise = (async () => {
    const maps = await Promise.all(_loaders.map(([ja, en]) => (isEn ? en : ja)()))
    const merged: LessonMap = {}
    for (const m of maps) Object.assign(merged, m)
    _cachedMerged = merged
    _cachedLocale = locale
    _loadPromise = null
    _loadPromiseLocale = null
    return merged
  })()
  return _loadPromise
}

/**
 * loadAllLessons() のエイリアス（呼び出し側で意図が明確になるよう別名で公開）。
 */
export const ensureLessonsLoaded = loadAllLessons

/** ロード済みかどうか（同期判定用）。 */
export function areLessonsLoaded(): boolean {
  return _cachedMerged !== null && _cachedLocale === getLocale()
}

// ロード前は空マップを返す（クラッシュさせない）。boot ゲートで loadAllLessons()
// を await 済みであることを前提とするが、未ロード時も undefined / 空配列を返す
// 安全な縮退動作にする。
const _EMPTY: LessonMap = {}
function _getMergedLessons(): LessonMap {
  if (_cachedMerged && _cachedLocale === getLocale()) return _cachedMerged
  return _EMPTY
}

export const allLessons: Record<number, LessonData> = new Proxy({} as Record<number, LessonData>, {
  get(_t, prop) {
    return _getMergedLessons()[prop as unknown as number]
  },
  has(_t, prop) {
    return prop in _getMergedLessons()
  },
})

// Proxyは Object.values() で列挙できないため、フラットな Map を返すヘルパー。
// ロード前は空オブジェクトを返す（boot ゲートでロード済みであることが前提）。
export function getAllLessonsFlat(): Record<number, LessonData> {
  return _getMergedLessons()
}
