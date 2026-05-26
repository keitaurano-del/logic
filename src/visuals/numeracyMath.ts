/**
 * Phase 2-2 numeracy 数値系部品の純ロジックヘルパー。
 *
 * コンポーネントファイル（*.tsx）は react-refresh の制約で component / 型以外を
 * export できないため、テスト可能な計算関数はこのモジュールに集約する。
 * すべて副作用なしの純関数。数値は割当先 numeracy 本文と一致させること。
 */

/* ── ContributionWaterfallDiagram ──────────────────────────── */

export type ContributionItem = {
  label: string
  /** 寄与度（パーセントポイント）。プラス寄与は正、マイナス寄与は負 */
  value: number
}

export type WaterfallStep = ContributionItem & {
  start: number
  end: number
  rising: boolean
}

export type WaterfallResult = {
  total: number
  steps: WaterfallStep[]
  max: number
  min: number
}

/**
 * items から waterfall の各バーの幾何情報を算出する。
 * total は寄与度の総和（小数誤差を避けて丸める）。
 */
export function computeWaterfall(items: ContributionItem[]): WaterfallResult {
  const total = items.reduce((acc, it) => acc + it.value, 0)
  let running = 0
  const steps: WaterfallStep[] = items.map((it) => {
    const start = running
    const end = running + it.value
    running = end
    return { ...it, start, end, rising: it.value >= 0 }
  })
  const highs = [0, total, ...steps.map((s) => Math.max(s.start, s.end))]
  const lows = [0, total, ...steps.map((s) => Math.min(s.start, s.end))]
  return {
    total: Math.round(total * 100) / 100,
    steps,
    max: Math.max(...highs),
    min: Math.min(...lows),
  }
}

/* ── SimpsonsParadoxDiagram ─────────────────────────────────── */

export type SimpsonCount = { num: number; denom: number }
export type SimpsonSegment = {
  name: string
  a: SimpsonCount
  b: SimpsonCount
}

/** 率（%）を小数1桁で算出。0 除算は 0 を返す。 */
export function rate(c: SimpsonCount): number {
  if (c.denom <= 0) return 0
  return Math.round((c.num / c.denom) * 1000) / 10
}

/** セグメントを合算した全体の {num, denom} を返す。 */
export function overall(segments: SimpsonSegment[], side: 'a' | 'b'): SimpsonCount {
  return segments.reduce(
    (acc, s) => ({ num: acc.num + s[side].num, denom: acc.denom + s[side].denom }),
    { num: 0, denom: 0 },
  )
}

/* ── RuleOf72Diagram ────────────────────────────────────────── */

/** rate と constant から倍化年数を算出（小数1桁丸め）。 */
export function doublingYears(rate: number, constant = 72): number {
  if (rate <= 0) return 0
  return Math.round((constant / rate) * 10) / 10
}
