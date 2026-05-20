/**
 * 帰納法 — 観察・サンプル → 一般則
 * lesson-26 step.visual='InductionDiagram'
 */
const samples = [
  'カラス A は黒い',
  'カラス B は黒い',
  'カラス C は黒い',
  'カラス D は黒い',
]

export function InductionVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        個別観察 → 法則化へ吸い上げる
      </div>

      <div className="vz-syllogism" style={{ flexDirection: 'column-reverse' }}>
        <div className="vz-induction-samples vz-stagger">
          {samples.map((s, i) => (
            <div key={i} className="vz-induction-sample">
              <span className="dot" />
              {s}
            </div>
          ))}
        </div>
        <span className="vz-arrow-up" style={{ margin: '8px 0' }}>↑</span>
        <div className="vz-premise-card conclusion">
          <span className="label">仮の法則</span>
          <span className="text">∴ カラスはみんな黒い（だろう）</span>
        </div>
      </div>

      <div className="vz-induction-warn">
        ⚠ 反例 1 つ（白いカラス）で覆る — 帰納の限界
      </div>
    </div>
  )
}
