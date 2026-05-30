import './visuals-phase2.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * フィードバックループ図解（強化ループ R / バランスループ B）
 * lesson-65, lesson-66, lesson-67, lesson-313 ほかシステムシンキングコースで流用
 * 想定 visualId: 'FeedbackLoopDiagram'
 *
 * default: lesson-65 step.1「貯金が貯金を呼ぶ強化ループ」
 *
 * interactive モード: ノードを表示した状態で、矢印を 1 本ずつ追加する。
 *   Step 1..N — 矢印を 1 本ずつ追加（最後は中央サイクル記号 ↻ / ⇌ を点灯）
 * static モード: 最初から全矢印 + ループバッジ。
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、warm accent としても兼用
 *   - SVG ノード text fontSize 10→12, polarity label 11→12 に底上げ
 *   - warm accent: hint ボックスを terracotta soft 背景 + deep 文字に
 *     （R/B のフレームワーク意味色 (success/warning) + polarity 色は維持必須 = §2.3 例外条項）
 */

export type LoopNode = {
  /** 表示ラベル */
  label: string
}

export type LoopArrow = {
  /** 始点 node index (0-based) */
  from: number
  /** 終点 node index (0-based) */
  to: number
  /** '+' = 同方向（強化）、'-' = 逆方向（抑制） */
  polarity?: '+' | '-'
}

export type FeedbackLoopProps = {
  sectionLabel?: string
  /** R = Reinforcing（強化ループ）/ B = Balancing（バランスループ） */
  loopType?: 'R' | 'B'
  /** ループのキャプション (例: 「貯金が貯金を呼ぶ」) */
  loopName?: string
  /** 3-4 個までを想定。4 個までは円周配置 */
  nodes?: LoopNode[]
  /** 省略時は隣接ノード間を順方向で接続。各 polarity も指定可 */
  arrows?: LoopArrow[]
  hint?: string
  /** 'interactive'（default）= 矢印を 1 本ずつ表示 / 'static' = 全表示 */
  revealMode?: 'interactive' | 'static'
}

const DEFAULT_PROPS: Required<Omit<FeedbackLoopProps, 'revealMode'>> = {
  sectionLabel: 'フィードバックループ',
  loopType: 'R',
  loopName: '貯金が貯金を呼ぶ',
  nodes: [
    { label: '貯金額' },
    { label: '利息収入' },
    { label: '再投資' },
  ],
  arrows: [
    { from: 0, to: 1, polarity: '+' },
    { from: 1, to: 2, polarity: '+' },
    { from: 2, to: 0, polarity: '+' },
  ],
  hint: '同方向矢印が一周すれば強化ループ。途中に逆方向 (−) が入るとバランスループ',
}

/** 円周上の座標を算出 */
function pointOnCircle(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

export function FeedbackLoopVisual(props: FeedbackLoopProps = {}) {
  const { revealMode = 'interactive', ...rest } = props
  const { sectionLabel, loopType, loopName, nodes, arrows, hint } = { ...DEFAULT_PROPS, ...rest }

  const W = 320
  const H = 240
  const cx = W / 2
  const cy = H / 2
  const radius = 80
  const N = nodes.length

  // 矢印は 1 本ずつ + ループ完成（中央記号 + バッジテキスト点灯）= arrows.length + 1
  const totalSteps = arrows.length + 1
  const { step, isLast, controls } = useStepReveal({ totalSteps, mode: revealMode })
  const visibleArrowsCount = Math.min(step, arrows.length)
  const loopComplete = isLast

  // 円周上のノード位置（12 時方向から時計回り）
  const positions = nodes.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N
    return pointOnCircle(cx, cy, radius, angle)
  })

  // 矢印用 path を生成（ノード間を緩やかな弧で結ぶ）
  const arrowPaths = arrows.map((arrow, idx) => {
    const from = positions[arrow.from]
    const to = positions[arrow.to]
    if (!from || !to) return null

    // 制御点：中心方向にオフセット
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    // 中心から外側に膨らませる
    const nx = -dy / len
    const ny = dx / len
    const bulge = 24
    const ctrlX = midX + nx * bulge
    const ctrlY = midY + ny * bulge

    // ノード端から少し引っ込めて矢印を描く
    const NODE_R = 22
    const startAngle = Math.atan2(ctrlY - from.y, ctrlX - from.x)
    const endAngle = Math.atan2(ctrlY - to.y, ctrlX - to.x)
    const sx = from.x + Math.cos(startAngle) * NODE_R
    const sy = from.y + Math.sin(startAngle) * NODE_R
    const ex = to.x + Math.cos(endAngle) * NODE_R
    const ey = to.y + Math.sin(endAngle) * NODE_R

    // polarity ラベル位置：制御点の少し外側
    const labelX = ctrlX + nx * 10
    const labelY = ctrlY + ny * 10

    const color = arrow.polarity === '-' ? 'var(--danger)' : 'var(--success)'

    return {
      key: idx,
      d: `M ${sx} ${sy} Q ${ctrlX} ${ctrlY} ${ex} ${ey}`,
      labelX,
      labelY,
      polarity: arrow.polarity ?? '+',
      color,
    }
  })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>{sectionLabel}</div>

      <div className="vz-fbl-wrap">
        <div
          className={`vz-fbl-badge ${loopType}`}
          style={{
            opacity: loopComplete ? 1 : 0.55,
            transition: 'opacity 0.3s',
          }}
        >
          <span className="glyph">{loopType}</span>
          {loopType === 'R' ? '強化ループ' : 'バランスループ'}：{loopName}
        </div>

        <svg className="vz-fbl-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <defs>
            <marker
              id="vz-fbl-arrow-pos"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--success)" />
            </marker>
            <marker
              id="vz-fbl-arrow-neg"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--danger)" />
            </marker>
          </defs>

          {/* 中央ラベル — ループ完成時のみ濃く */}
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fill={loopType === 'R' ? 'var(--success)' : 'var(--warning)'}
            opacity={loopComplete ? 0.35 : 0.1}
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif", transition: 'opacity 0.3s' }}
          >
            {loopType === 'R' ? '↻' : '⇌'}
          </text>

          {/* 矢印（step 数だけ表示） */}
          {arrowPaths.slice(0, visibleArrowsCount).map((a) => a && (
            <g key={a.key}>
              <path
                d={a.d}
                fill="none"
                stroke={a.color}
                strokeWidth="2"
                markerEnd={`url(#vz-fbl-arrow-${a.polarity === '-' ? 'neg' : 'pos'})`}
              />
              <circle
                cx={a.labelX}
                cy={a.labelY}
                r="9"
                fill="var(--bg-card)"
                stroke={a.color}
                strokeWidth="1.5"
              />
              <text
                x={a.labelX}
                y={a.labelY + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={a.color}
              >
                {a.polarity}
              </text>
            </g>
          ))}

          {/* ノード — ステップに関わらず常時表示 */}
          {positions.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="22"
                fill="var(--bg-card)"
                stroke="var(--brand)"
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="var(--text-primary)"
              >
                {nodes[i]?.label.length && nodes[i]!.label.length > 5
                  ? nodes[i]!.label.slice(0, 5) + '…'
                  : nodes[i]?.label}
              </text>
            </g>
          ))}
        </svg>

        {/* ノードラベル凡例 (省略表記の補足) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(N, 3)}, 1fr)`,
            gap: 6,
            width: '100%',
            marginTop: 4,
          }}
        >
          {nodes.map((n, i) => (
            <div key={i} className="vz-fbl-node">
              {i + 1}. {n.label}
            </div>
          ))}
        </div>
      </div>

      {controls}

      {hint ? (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--visual-warm-primary-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--visual-warm-primary-deep)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
