/**
 * 演繹法 — 大前提・小前提・結論
 * lesson-25 step.visual='DeductionDiagram'
 */
export function DeductionVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        三段論法 — 一般則 → 個別結論へ落ちる
      </div>

      <div className="vz-syllogism vz-stagger">
        <div className="vz-premise-card">
          <span className="label">大前提</span>
          <span className="text">すべての人間は死ぬ</span>
        </div>
        <span className="vz-arrow-down">↓</span>
        <div className="vz-premise-card">
          <span className="label">小前提</span>
          <span className="text">ソクラテスは人間である</span>
        </div>
        <span className="vz-arrow-down">↓</span>
        <div className="vz-premise-card conclusion">
          <span className="label">結論</span>
          <span className="text">ゆえに、ソクラテスは死ぬ</span>
        </div>
      </div>

      <div style={{
        marginTop: 14,
        padding: '8px 10px',
        background: 'rgba(5, 150, 105, 0.10)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: '#065F46',
        textAlign: 'center',
      }}>
        ✓ 前提が真なら結論も必ず真。論理が破綻する余地がない
      </div>
    </div>
  )
}
