import './visuals-phase2-2.css'
import { computeWaterfall, type ContributionItem } from './numeracyMath'

export type { ContributionItem } from './numeracyMath'

/**
 * ContributionWaterfallDiagram — 全体の成長/変化を各要因の寄与度で積み上げ分解するウォーターフォール
 *
 * Phase 2-2 新規部品（2026-05-26）。numeracy「全体の成長を寄与度で分解」step に割当。
 * 想定 visualId: 'ContributionWaterfallDiagram'
 *
 * 構図:
 *   - 左に base（基準=0%）の床、右に向かって各要因の寄与度を浮かせて積み上げる
 *   - プラス寄与は上向き（success 系）、マイナス寄与は下向き（rose 系）の浮きバー
 *   - 各バーは「前の累計 → 次の累計」を結ぶ。コネクタ線で段差を視覚的に連結
 *   - 最後に total（合計寄与度=全体成長率）を 0 から立ち上がる確定バーで締める
 *
 * design rationale:
 *   - 「全体成長 = 各要因の寄与度の足し算」という構造を、橋を架けるように左→右で見せる
 *   - 寄与度 = 伸び率 × ウェイト なので、伸び率が高くてもウェイトが小さい要因は浮きが薄くなる
 *     ことを高さで直感化する（A +12% は大きく、C +1% は薄い）
 *   - プラス/マイナスの意味色は固定（§2.3 例外）。warm accent は hint 1 箇所のみ
 *   - バーは aria-hidden。各値は隣接ラベル text と凡例で担保（TTS / SR 対策）
 *
 * Props（lesson データ側 `step.visualProps` で指定。未指定なら default）:
 *   sectionLabel?: string  — 上部の見出し
 *   baseLabel?: string     — 基準（左端=0%）のラベル
 *   items: { label, value }[]  — 各要因の寄与度（value は % ポイント。+/- 両方可）
 *   totalLabel?: string    — 右端の合計バーのラベル
 *   unit?: string          — 値に付ける単位（default '%'）
 *   hint?: string          — 結論ヒント（電球マーク付き、warm accent）
 *
 * 数値の正確性:
 *   total（右端の確定バー）は items の value の総和を自動計算する（捏造しない）。
 *   default は numeracy 本文の「A +12% − B 3% + C +1% = 全体 +10%」と一致。
 */

export type ContributionWaterfallProps = {
  sectionLabel?: string
  baseLabel?: string
  items?: ContributionItem[]
  totalLabel?: string
  unit?: string
  hint?: string
}

const DEFAULT_PROPS: Required<ContributionWaterfallProps> = {
  sectionLabel: '全体の成長を寄与度で分解',
  baseLabel: '前年',
  items: [
    { label: 'A事業', value: 12 },
    { label: 'B事業', value: -3 },
    { label: 'C事業', value: 1 },
  ],
  totalLabel: '全体成長',
  unit: '%',
  hint: '寄与度 ＝ 伸び率 × ウェイト。各要因を足し合わせると全体の成長率になります',
}

const VB_W = 320
const VB_H = 150
const PAD_TOP = 12
const PAD_BOTTOM = 26
const PLOT_H = VB_H - PAD_TOP - PAD_BOTTOM

export function ContributionWaterfallDiagram(props: ContributionWaterfallProps = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULT_PROPS.sectionLabel
  const baseLabel = props.baseLabel ?? DEFAULT_PROPS.baseLabel
  const items =
    props.items && props.items.length > 0 ? props.items : DEFAULT_PROPS.items
  const totalLabel = props.totalLabel ?? DEFAULT_PROPS.totalLabel
  const unit = props.unit ?? DEFAULT_PROPS.unit
  const hint = props.hint ?? DEFAULT_PROPS.hint

  const { total, steps, max, min } = computeWaterfall(items)

  // 値→y 座標（plot 内）。max が上端、min が下端。
  const span = Math.max(max - min, 1)
  const yOf = (v: number) => PAD_TOP + ((max - v) / span) * PLOT_H

  // バー列: base(0 の床) を含めず、各 item + total。
  // n 本のバーを等間隔配置する
  const barCount = items.length + 1 // items + total
  const slot = VB_W / barCount
  const barW = Math.min(slot * 0.5, 40)

  const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}${unit}`

  const ariaParts = steps.map((s) => `${s.label} ${signed(s.value)}`).join('、')
  const ariaLabel = `${baseLabel}を基準に ${ariaParts}。合計 ${signed(total)} が${totalLabel}`

  const zeroY = yOf(0)

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-cw-card">
        <svg
          className="vz-cw-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
        >
          {/* 基準線（0%） */}
          <line x1="0" y1={zeroY} x2={VB_W} y2={zeroY} className="vz-cw-baseline" />

          {/* 各寄与バー */}
          {steps.map((s, i) => {
            const cx = slot * i + slot / 2
            const x = cx - barW / 2
            const topV = Math.max(s.start, s.end)
            const botV = Math.min(s.start, s.end)
            const y = yOf(topV)
            const h = Math.max(yOf(botV) - yOf(topV), 1.5)
            // 次のバーへ繋ぐコネクタ（累計 end の高さで横に伸ばす）
            const connY = yOf(s.end)
            const nextCx = slot * (i + 1) + slot / 2
            return (
              <g key={i} aria-hidden="true">
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="2"
                  className={`vz-cw-bar ${s.rising ? 'rise' : 'fall'}`}
                />
                {/* 累計コネクタ（最後の item は total バーへ繋ぐ） */}
                <line
                  x1={cx + barW / 2}
                  y1={connY}
                  x2={nextCx - barW / 2}
                  y2={connY}
                  className="vz-cw-connector"
                />
                <text x={cx} y={topV >= 0 ? y - 3 : yOf(botV) + 10} className="vz-cw-val" textAnchor="middle">
                  {signed(s.value)}
                </text>
                <text x={cx} y={VB_H - 14} className="vz-cw-label" textAnchor="middle">
                  {s.label}
                </text>
              </g>
            )
          })}

          {/* 合計バー（0 から total まで立ち上がる確定バー） */}
          {(() => {
            const i = items.length
            const cx = slot * i + slot / 2
            const x = cx - barW / 2
            const topV = Math.max(0, total)
            const botV = Math.min(0, total)
            const y = yOf(topV)
            const h = Math.max(yOf(botV) - yOf(topV), 1.5)
            return (
              <g aria-hidden="true">
                <rect x={x} y={y} width={barW} height={h} rx="2" className="vz-cw-bar total" />
                <text x={cx} y={total >= 0 ? y - 3 : yOf(botV) + 10} className="vz-cw-val total" textAnchor="middle">
                  {signed(total)}
                </text>
                <text x={cx} y={VB_H - 14} className="vz-cw-label total" textAnchor="middle">
                  {totalLabel}
                </text>
              </g>
            )
          })()}
        </svg>

        <div className="vz-cw-legend">
          <div className="vz-cw-legend-item">
            <span className="vz-cw-swatch rise" aria-hidden="true" />
            <span className="vz-cw-legend-text">プラス寄与</span>
          </div>
          <div className="vz-cw-legend-item">
            <span className="vz-cw-swatch fall" aria-hidden="true" />
            <span className="vz-cw-legend-text">マイナス寄与</span>
          </div>
          <div className="vz-cw-legend-item">
            <span className="vz-cw-swatch total" aria-hidden="true" />
            <span className="vz-cw-legend-text">合計</span>
          </div>
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
