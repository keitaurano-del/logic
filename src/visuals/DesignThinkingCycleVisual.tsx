/**
 * デザイン思考 5 ステップ円環 — 共感→定義→発想→試作→検証
 * 中央に「人間中心」のラベル、時計回りの矢印
 * lesson-56 step.0 step.visual='DesignThinkingCycleDiagram'
 */

type Step = { num: number; label: string; en: string }

const steps: Step[] = [
  { num: 1, label: '共感', en: 'Empathize' },
  { num: 2, label: '定義', en: 'Define' },
  { num: 3, label: '発想', en: 'Ideate' },
  { num: 4, label: '試作', en: 'Prototype' },
  { num: 5, label: '検証', en: 'Test' },
]

export function DesignThinkingCycleVisual() {
  // 円周上に 5 点配置（12 時方向スタート、時計回り）
  const radius = 36 // % of cycle box
  const cx = 50
  const cy = 50

  const positions = steps.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / steps.length
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        デザイン思考 5 ステップ — 反復するサイクル
      </div>

      <div className="vz-dt-cycle vz-stagger">
        {/* SVG で円弧と矢印 */}
        <svg viewBox="0 0 100 100">
          <defs>
            <marker
              id="dt-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6C8EF5" />
            </marker>
          </defs>

          {positions.map((p, i) => {
            const next = positions[(i + 1) % positions.length]
            // ノード半径を考慮して縮める
            const dx = next.x - p.x
            const dy = next.y - p.y
            const len = Math.hypot(dx, dy) || 1
            const pad = 9
            const x1 = p.x + (dx / len) * pad
            const y1 = p.y + (dy / len) * pad
            const x2 = next.x - (dx / len) * pad
            const y2 = next.y - (dy / len) * pad

            // 中心 (cx, cy) を基準に外側に膨らませるカーブ
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            const outX = mx + (mx - cx) * 0.3
            const outY = my + (my - cy) * 0.3

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${outX} ${outY} ${x2} ${y2}`}
                stroke="#6C8EF5"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
                markerEnd="url(#dt-arrow)"
              />
            )
          })}
        </svg>

        {/* ステップ */}
        {steps.map((s, i) => (
          <div
            key={s.num}
            className="vz-dt-step"
            style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
          >
            <div className="vz-dt-step-badge">{s.num}</div>
            <div className="vz-dt-step-label">
              {s.label}
              <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {s.en}
              </div>
            </div>
          </div>
        ))}

        {/* 中央：人間中心 */}
        <div className="vz-dt-center">
          <div className="label">Human-Centered</div>
          <div className="title">人間中心</div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
      }}>
        一回で正解にしない。検証から共感に戻り、何度も回すのが前提
      </div>
    </div>
  )
}
