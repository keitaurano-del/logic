import './visuals-phase2-1.css'

/**
 * NormalDistribution68Diagram — 正規分布のベルカーブに 68-95-99.7 ルールを重ねる
 *
 * Phase 2-1 新規部品（2026-05-26）。numeracy「正規分布と68-95-99.7ルール」step に割当。
 * 想定 visualId: 'NormalDistribution68Diagram'
 *
 * 構図:
 *   - ベルカーブの下に ±1σ / ±2σ / ±3σ の帯を入れ子で塗り分け（中心ほど濃い）
 *   - 各 σ 境界に縦の目盛り、下に -3σ … +3σ のラベル
 *   - 右側の凡例で 68% / 95% / 99.7% を帯色と対応づけ
 *
 * design rationale:
 *   - 「中心に集中・外れるほど薄い」を濃度のグラデーションで直感化（brand 系の濃淡で統一）
 *   - 数値（68 / 95 / 99.7）は SVG 内ラベルではなく隣接凡例テキストで担保（aria-hidden な装飾と意味の分離）
 *   - mean / sigma ラベルは optional。default は無名（汎用ベルカーブ）
 *
 * Props（lesson データ側 `step.visualProps` で指定。ほぼ静的）:
 *   sectionLabel?: string   — 上部の見出し
 *   meanLabel?: string      — 中心線に添えるラベル（例「平均」「170cm」）。未指定なら非表示
 *   hint?: string           — 結論ヒント（電球マーク付き、warm accent）
 */

export type NormalDistribution68Props = {
  sectionLabel?: string
  meanLabel?: string
  hint?: string
  /** 凡例ラベル。en では ['Within ±1σ: 68%', ...] のように差し替える。未指定なら ja */
  legendLabels?: [string, string, string]
  /** SVG の aria-label。未指定なら ja の説明文 */
  ariaLabel?: string
}

const DEFAULT_LEGEND: [string, string, string] = ['に 68%', 'に 95%', 'に 99.7%']

const DEFAULT_PROPS = {
  sectionLabel: '68-95-99.7 ルール',
  meanLabel: '',
  hint: '「平均 ± 何σ で何%か」が瞬時に出れば、データの珍しさが読めます',
}

// viewBox 0..320 x, σ 1 個分 = 40px、中心 x=160
const CX = 160
const SIGMA = 40

// ベルカーブの近似パス（中心 x=160, baseline y=130, peak y=18）
const BELL_PATH =
  'M 8 130 ' +
  'C 48 130 60 126 76 112 ' +
  'C 100 92 110 40 160 28 ' + // 左半分の立ち上がり〜頂上
  'C 210 40 220 92 244 112 ' +
  'C 260 126 272 130 312 130 Z'

export function NormalDistribution68Diagram(props: NormalDistribution68Props = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULT_PROPS.sectionLabel
  const meanLabel = props.meanLabel ?? DEFAULT_PROPS.meanLabel
  const hint = props.hint ?? DEFAULT_PROPS.hint
  const legendLabels = props.legendLabels ?? DEFAULT_LEGEND
  const ariaLabel =
    props.ariaLabel ??
    '正規分布のベルカーブ。中心の平均±1σに68%、±2σに95%、±3σに99.7%のデータが入る'

  const ticks = [-3, -2, -1, 1, 2, 3]

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-nd-card">
        <svg
          className="vz-nd-svg"
          viewBox="0 0 320 150"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
        >
          {/* clip にカーブを使い、帯をカーブ内側だけに描く */}
          <defs>
            <clipPath id="nd-bell-clip">
              <path d={BELL_PATH} />
            </clipPath>
          </defs>

          {/* 帯（広い順に重ね、中心ほど濃く見せる） */}
          <g clipPath="url(#nd-bell-clip)">
            {/* ±3σ 帯（最も薄い） */}
            <rect x={CX - 3 * SIGMA} y="0" width={6 * SIGMA} height="130" className="vz-nd-band band3" />
            {/* ±2σ 帯 */}
            <rect x={CX - 2 * SIGMA} y="0" width={4 * SIGMA} height="130" className="vz-nd-band band2" />
            {/* ±1σ 帯（最も濃い） */}
            <rect x={CX - 1 * SIGMA} y="0" width={2 * SIGMA} height="130" className="vz-nd-band band1" />
          </g>

          {/* ベルカーブの輪郭 */}
          <path d={BELL_PATH} className="vz-nd-curve" />

          {/* baseline */}
          <line x1="8" y1="130" x2="312" y2="130" className="vz-nd-axis" />

          {/* σ 境界の縦線 + ラベル */}
          {ticks.map((t) => {
            const x = CX + t * SIGMA
            return (
              <g key={t}>
                <line x1={x} y1="30" x2={x} y2="130" className="vz-nd-tick" />
                <text x={x} y="144" className="vz-nd-tick-label" textAnchor="middle">
                  {t > 0 ? `+${t}σ` : `${t}σ`}
                </text>
              </g>
            )
          })}

          {/* 中心線（平均） */}
          <line x1={CX} y1="22" x2={CX} y2="130" className="vz-nd-mean" />
          <text x={CX} y="144" className="vz-nd-tick-label center" textAnchor="middle">
            {meanLabel || 'μ'}
          </text>
        </svg>

        <div className="vz-nd-legend">
          <div className="vz-nd-legend-item">
            <span className="vz-nd-swatch band1" aria-hidden="true" />
            <span className="vz-nd-legend-text">
              <strong>±1σ</strong> {legendLabels[0]}
            </span>
          </div>
          <div className="vz-nd-legend-item">
            <span className="vz-nd-swatch band2" aria-hidden="true" />
            <span className="vz-nd-legend-text">
              <strong>±2σ</strong> {legendLabels[1]}
            </span>
          </div>
          <div className="vz-nd-legend-item">
            <span className="vz-nd-swatch band3" aria-hidden="true" />
            <span className="vz-nd-legend-text">
              <strong>±3σ</strong> {legendLabels[2]}
            </span>
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
