/**
 * PREP 法 — Point / Reason / Example / Point
 * lesson-23 step.visual='PrepDiagram'
 */
const items = [
  { letter: 'P', name: 'Point', desc: '結論 — 「私は〇〇だと考える」' },
  { letter: 'R', name: 'Reason', desc: '理由 — なぜそう言えるか' },
  { letter: 'E', name: 'Example', desc: '具体例・データ — 実証する根拠' },
  { letter: 'P', name: 'Point', desc: '結論 — 改めて主張を述べる' },
]

export function PrepVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 12 }}>PREP 法 — 4ステップで話す</div>
      {items.map((item, i) => (
        <div key={i} className="vz-prep-row">
          <div className="vz-prep-letter">{item.letter}</div>
          <div className="vz-prep-meaning">
            <span className="vz-prep-name">{item.name}</span>
            <span className="vz-prep-desc">{item.desc}</span>
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 8,
        padding: '8px 10px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
      }}>
        結論で始まり、結論で締める — 30秒で要点が伝わる構造
      </div>
    </div>
  )
}
