/**
 * 因果ループ図（汎用） — 任意のループ図を描く
 * lesson-67 step.0 step.visual='CausalLoopDiagramDiagram'
 *
 * props で nodes と edges を受け取る。座標は 0–100 の % 系。
 * default は SNS 投稿 → 反応 → モチベ → 投稿頻度 の正のフィードバックループ
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - vz-cld-loop-label 12→13, padding 拡大
 *   - warm accent: 中央 loop-label (ループの認識バッジ = 構造名宣言) を terracotta gradient
 *     （ループの本体 = 構造の核 = 1 visual 内 1 箇所、+ 矢印は brand のまま）
 */

export type CldNode = {
  id: string
  /** ノードラベル */
  text: string
  /** 0–100 (%) */
  x: number
  /** 0–100 (%) */
  y: number
}

export type CldEdge = {
  from: string
  to: string
  /** + (正の影響) / - (逆の影響) */
  sign: 'plus' | 'minus'
}

type Props = {
  nodes?: CldNode[]
  edges?: CldEdge[]
  /** ループラベル ("R" 強化 / "B" バランス) */
  loopLabel?: { kind: 'R' | 'B'; text: string }
  sectionLabel?: string
  hint?: string
}

const defaultNodes: CldNode[] = [
  { id: 'post',      text: '投稿頻度',     x: 50, y: 14 },
  { id: 'reaction',  text: '反応 (いいね)', x: 86, y: 52 },
  { id: 'motivation',text: 'モチベ',       x: 50, y: 88 },
  { id: 'idea',      text: 'ネタ蓄積',     x: 14, y: 52 },
]

const defaultEdges: CldEdge[] = [
  { from: 'post',       to: 'reaction',   sign: 'plus' },
  { from: 'reaction',   to: 'motivation', sign: 'plus' },
  { from: 'motivation', to: 'idea',       sign: 'plus' },
  { from: 'idea',       to: 'post',       sign: 'plus' },
]

export function CausalLoopDiagramVisual({
  nodes = defaultNodes,
  edges = defaultEdges,
  loopLabel = { kind: 'R', text: 'R: 強化ループ' },
  sectionLabel = '因果ループ図 — 矢印で原因→結果をつなぐ',
  hint = '+ は同方向に動く（増えれば増える）。− は逆方向に動く（増えれば減る）',
}: Props) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        {sectionLabel}
      </div>

      <div className="vz-cld">
        {/* SVG で矢印を描画 */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker
              id="cld-arrow-plus"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6C8EF5" />
            </marker>
            <marker
              id="cld-arrow-minus"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#DB2777" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const from = nodeMap.get(e.from)
            const to = nodeMap.get(e.to)
            if (!from || !to) return null

            // ノード矩形の縁から少し離す（カードの大きさを考慮）
            const dx = to.x - from.x
            const dy = to.y - from.y
            const len = Math.hypot(dx, dy) || 1
            const pad = 12
            const x1 = from.x + (dx / len) * pad
            const y1 = from.y + (dy / len) * pad
            const x2 = to.x - (dx / len) * pad
            const y2 = to.y - (dy / len) * pad

            // 曲線（時計回りに少し膨らませる）
            const mx = (x1 + x2) / 2 + (-dy / len) * 6
            const my = (y1 + y2) / 2 + (dx / len) * 6

            const stroke = e.sign === 'plus' ? '#6C8EF5' : '#DB2777'
            const marker = e.sign === 'plus' ? 'url(#cld-arrow-plus)' : 'url(#cld-arrow-minus)'

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke={stroke}
                strokeWidth="1.6"
                fill="none"
                markerEnd={marker}
                opacity="0.85"
              />
            )
          })}
        </svg>

        {/* ノード */}
        {nodes.map(n => (
          <div
            key={n.id}
            className="vz-cld-node"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.text}
          </div>
        ))}

        {/* エッジ符号（+/-） */}
        {edges.map((e, i) => {
          const from = nodeMap.get(e.from)
          const to = nodeMap.get(e.to)
          if (!from || !to) return null
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.hypot(dx, dy) || 1
          // 中央寄りでカーブの外側に符号を置く
          const cx = (from.x + to.x) / 2 + (-dy / len) * 10
          const cy = (from.y + to.y) / 2 + (dx / len) * 10
          return (
            <div
              key={`s-${i}`}
              className={`vz-cld-sign ${e.sign === 'minus' ? 'minus' : ''}`}
              style={{ left: `${cx}%`, top: `${cy}%` }}
            >
              {e.sign === 'plus' ? '+' : '−'}
            </div>
          )
        })}

        {/* ループラベル（中央） */}
        <div className="vz-cld-loop-label" style={{ left: '50%', top: '50%' }}>
          {loopLabel.kind === 'R' ? '↻' : '⇄'} {loopLabel.text}
        </div>
      </div>

      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        {hint}
      </div>
    </div>
  )
}
