import './visuals-phase2-2.css'
import {
  overall,
  rate,
  type SimpsonCount,
  type SimpsonSegment,
} from './numeracyMath'

export type { SimpsonCount, SimpsonSegment } from './numeracyMath'

/**
 * SimpsonsParadoxDiagram — セグメント別と全体で結論が逆転する構造を可視化
 *
 * Phase 2-2 新規部品（2026-05-26）。numeracy「シンプソンのパラドックス」step に割当。
 * 想定 visualId: 'SimpsonsParadoxDiagram'
 *
 * 構図:
 *   - 上段: セグメント別の率バー（2 セグメント × A/B）。各セグメントで A と B を横並び比較
 *     各バーには「成功/母数」も併記し、母数の偏り（重み）が見えるようにする
 *   - 下段: 全体合算の率バー（A 全体 vs B 全体）
 *   - セグメント別では B が勝ち（または同率）なのに、全体では A が勝つ「逆転」を
 *     上下のバーの長短の逆転で一目で見せる
 *
 * design rationale:
 *   - 「率だけ見ると B、でも母数の偏りで合算すると A」を、率(長さ)と母数(人数表記)の
 *     両方を並置して伝える。逆転の主因が「サンプル構成の違い」であることを構造化
 *   - groupA / groupB の識別色は brand / warm の 2 色（意味色 good/bad ではない。優劣は
 *     文脈依存なので中立な 2 系統色を使う）
 *   - バーは aria-hidden、率と母数はテキストで担保
 *
 * Props（lesson データ側 `step.visualProps` で指定。未指定なら default）:
 *   sectionLabel?: string
 *   groupALabel?: string / groupBLabel?: string  — 2 群の名前
 *   segments: { name, a: {num, denom}, b: {num, denom} }[]  — セグメント別の成功/母数
 *   overallLabel?: string  — 全体行のラベル
 *   hint?: string
 *
 * 数値の正確性:
 *   各率（成功 ÷ 母数）と全体合算（Σ成功 ÷ Σ母数）はすべて props から自動計算する。
 *   default は numeracy 本文の A/B 治療例（軽症・重症）と一致:
 *     軽症 A 90/100=90%, B 9/10=90% / 重症 A 3/10=30%, B 35/100=35%
 *     全体 A 93/110≒84.5%, B 44/110=40%
 */

export type SimpsonsParadoxProps = {
  sectionLabel?: string
  groupALabel?: string
  groupBLabel?: string
  segments?: SimpsonSegment[]
  overallLabel?: string
  hint?: string
}

const DEFAULT_PROPS: Required<SimpsonsParadoxProps> = {
  sectionLabel: 'セグメント別 vs 全体',
  groupALabel: 'A治療',
  groupBLabel: 'B治療',
  segments: [
    { name: '軽症', a: { num: 90, denom: 100 }, b: { num: 9, denom: 10 } },
    { name: '重症', a: { num: 3, denom: 10 }, b: { num: 35, denom: 100 } },
  ],
  overallLabel: '全体',
  hint: 'セグメント別ではほぼ互角でも、母数の偏りで合算すると逆転します',
}

function RateBar({
  label,
  count,
  variant,
}: {
  label: string
  count: SimpsonCount
  variant: 'a' | 'b'
}) {
  const pct = rate(count)
  return (
    <div className="vz-sp-row">
      <span className="vz-sp-row-label">{label}</span>
      <div className="vz-sp-track" aria-hidden="true">
        <div className={`vz-sp-fill ${variant}`} style={{ width: `${Math.max(pct, 0)}%` }} />
      </div>
      <span className="vz-sp-row-val">
        {pct}% <span className="vz-sp-frac">({count.num}/{count.denom})</span>
      </span>
    </div>
  )
}

export function SimpsonsParadoxDiagram(props: SimpsonsParadoxProps = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULT_PROPS.sectionLabel
  const groupALabel = props.groupALabel ?? DEFAULT_PROPS.groupALabel
  const groupBLabel = props.groupBLabel ?? DEFAULT_PROPS.groupBLabel
  const segments =
    props.segments && props.segments.length > 0 ? props.segments : DEFAULT_PROPS.segments
  const overallLabel = props.overallLabel ?? DEFAULT_PROPS.overallLabel
  const hint = props.hint ?? DEFAULT_PROPS.hint

  const overallA = overall(segments, 'a')
  const overallB = overall(segments, 'b')

  const ariaLabel = `${segments
    .map((s) => `${s.name}は${groupALabel}${rate(s.a)}パーセント、${groupBLabel}${rate(s.b)}パーセント`)
    .join('、')}。全体では${groupALabel}${rate(overallA)}パーセント、${groupBLabel}${rate(
    overallB,
  )}パーセントで逆転`

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-sp-card" role="img" aria-label={ariaLabel}>
        {/* 凡例 */}
        <div className="vz-sp-legend">
          <span className="vz-sp-legend-item">
            <span className="vz-sp-swatch a" aria-hidden="true" />
            {groupALabel}
          </span>
          <span className="vz-sp-legend-item">
            <span className="vz-sp-swatch b" aria-hidden="true" />
            {groupBLabel}
          </span>
        </div>

        {/* セグメント別 */}
        {segments.map((s, i) => (
          <div className="vz-sp-segment" key={i}>
            <div className="vz-sp-segment-name">{s.name}</div>
            <RateBar label={groupALabel} count={s.a} variant="a" />
            <RateBar label={groupBLabel} count={s.b} variant="b" />
          </div>
        ))}

        {/* 全体（逆転） */}
        <div className="vz-sp-segment overall">
          <div className="vz-sp-segment-name">{overallLabel}</div>
          <RateBar label={groupALabel} count={overallA} variant="a" />
          <RateBar label={groupBLabel} count={overallB} variant="b" />
        </div>
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
