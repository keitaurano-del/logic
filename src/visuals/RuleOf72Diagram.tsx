import './visuals-phase2-2.css'
import { doublingYears } from './numeracyMath'

/**
 * RuleOf72Diagram — 72 ÷ 年利 ＝ 倍化年数 の早見
 *
 * Phase 2-2 新規部品（2026-05-26）。numeracy「72の法則」step に割当。
 * 想定 visualId: 'RuleOf72Diagram'
 *
 * 構図:
 *   - 左: 年利 → 倍化年数の早見表（行ごとに rate と years）。years は 72 ÷ rate を自動計算
 *   - 右: 反比例カーブ（年利が上がるほど倍化年数が短くなる）。各行の点を曲線上に打つ
 *   - 上部に公式バッジ「72 ÷ 年利(%) ≒ 倍になる年数」
 *
 * design rationale:
 *   - 「反比例（年利↑ → 年数↓）」を表とカーブの両方で見せ、暗算公式の構造を直感化
 *   - years は props の rate から都度計算（72/rate）。捏造を防ぎ本文と必ず一致
 *   - カーブ・点は aria-hidden、各値は表テキストで担保（TTS / SR 対策）
 *   - 単色 brand 系で構成（優劣の意味色は不要な中立コンテンツ）
 *
 * Props（lesson データ側 `step.visualProps` で指定。未指定なら default）:
 *   sectionLabel?: string
 *   constant?: number      — 法則の定数（default 72）
 *   rows: { rate, years? }[]  — 年利(%)。years 省略時は constant/rate を自動算出
 *   rateLabel?: string / yearsLabel?: string  — 表ヘッダ
 *   formulaLabel?: string  — 公式バッジの文言
 *   hint?: string
 *
 * 数値の正確性:
 *   years を省略すれば constant ÷ rate を小数1桁で算出する。
 *   default は numeracy 本文と一致: 1%→72年, 2%→36年, 5%→14.4年, 6%→12年,
 *   8%→9年, 10%→7.2年, 12%→6年。
 */

export type RuleOf72Row = {
  /** 年利（%） */
  rate: number
  /** 倍化年数。省略時は constant / rate を自動計算 */
  years?: number
}

export type RuleOf72Props = {
  sectionLabel?: string
  constant?: number
  rows?: RuleOf72Row[]
  rateLabel?: string
  yearsLabel?: string
  formulaLabel?: string
  hint?: string
}

const DEFAULT_PROPS: Required<Omit<RuleOf72Props, 'rows'>> & { rows: RuleOf72Row[] } = {
  sectionLabel: '72の法則 早見',
  constant: 72,
  rows: [
    { rate: 1 },
    { rate: 2 },
    { rate: 5 },
    { rate: 6 },
    { rate: 8 },
    { rate: 10 },
    { rate: 12 },
  ],
  rateLabel: '年利',
  yearsLabel: '倍になる年数',
  formulaLabel: '72 ÷ 年利(%) ≒ 倍になる年数',
  hint: '年利が2倍になれば倍化年数は半分。反比例の関係を覚えておくと暗算が速くなります',
}

const VB_W = 150
const VB_H = 132
const PAD = 18

export function RuleOf72Diagram(props: RuleOf72Props = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULT_PROPS.sectionLabel
  const constant = props.constant ?? DEFAULT_PROPS.constant
  const rateLabel = props.rateLabel ?? DEFAULT_PROPS.rateLabel
  const yearsLabel = props.yearsLabel ?? DEFAULT_PROPS.yearsLabel
  const formulaLabel = props.formulaLabel ?? DEFAULT_PROPS.formulaLabel
  const hint = props.hint ?? DEFAULT_PROPS.hint
  const rawRows = props.rows && props.rows.length > 0 ? props.rows : DEFAULT_PROPS.rows

  const rows = rawRows.map((r) => ({
    rate: r.rate,
    years: r.years ?? doublingYears(r.rate, constant),
  }))

  // カーブ用スケール
  const maxRate = Math.max(...rows.map((r) => r.rate), 1)
  const maxYears = Math.max(...rows.map((r) => r.years), 1)
  const xOf = (rate: number) => PAD + (rate / maxRate) * (VB_W - PAD * 2)
  const yOf = (years: number) => PAD + (1 - years / maxYears) * (VB_H - PAD * 2)

  // 反比例カーブのなめらかな線（rate を細かくサンプリング）
  const samples = 40
  const minRate = Math.min(...rows.map((r) => r.rate), 1)
  const curve = Array.from({ length: samples + 1 }, (_, i) => {
    const rate = minRate + ((maxRate - minRate) * i) / samples
    const years = constant / rate
    return `${xOf(rate).toFixed(1)} ${yOf(years).toFixed(1)}`
  }).join(' L ')

  const ariaLabel = `${formulaLabel}。${rows
    .map((r) => `年利${r.rate}パーセントで${r.years}年`)
    .join('、')}`

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-r72-formula" aria-hidden="true">
        {formulaLabel}
      </div>

      <div className="vz-r72-wrap" role="img" aria-label={ariaLabel}>
        {/* 早見表 */}
        <table className="vz-r72-table">
          <thead>
            <tr>
              <th>{rateLabel}</th>
              <th>{yearsLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="vz-r72-rate">{r.rate}%</td>
                <td className="vz-r72-years">{r.years}年</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 反比例カーブ */}
        <svg
          className="vz-r72-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* 軸 */}
          <line x1={PAD} y1={VB_H - PAD} x2={VB_W - PAD} y2={VB_H - PAD} className="vz-r72-axis" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={VB_H - PAD} className="vz-r72-axis" />
          {/* 反比例カーブ */}
          <path d={`M ${curve}`} className="vz-r72-curve" />
          {/* 各行の点 */}
          {rows.map((r, i) => (
            <circle key={i} cx={xOf(r.rate)} cy={yOf(r.years)} r="2.6" className="vz-r72-dot" />
          ))}
          {/* 軸ラベル */}
          <text x={VB_W - PAD} y={VB_H - 6} className="vz-r72-axis-label" textAnchor="end">
            {rateLabel} →
          </text>
          <text x={PAD - 2} y={PAD - 6} className="vz-r72-axis-label" textAnchor="start">
            ↑ {yearsLabel}
          </text>
        </svg>
      </div>

      {hint ? (
        <div className="vz-acd-hint">
          <span className="vz-acd-hint-mark" aria-hidden="true">
            💡
          </span>
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  )
}
