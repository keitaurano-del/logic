/**
 * ケーススタディ — 段階開示フェーズパネル
 * lesson-24 step.visual='CaseStudyDiagram'
 */
const phases = [
  { label: 'PHASE 1', title: '情報を集める', body: '事実・データ・観察を MECE に整理する。憶測を入れない。' },
  { label: 'PHASE 2', title: '仮説を立てる', body: '集めた情報から複数の解釈を提示。「もしかしたら」を口に出す。' },
  { label: 'PHASE 3', title: '検証する',     body: '仮説を支持／反証するデータをさらに集める。証拠が出るまで結論を保留。' },
  { label: 'PHASE 4', title: '打ち手を出す', body: '検証済みの仮説をもとに、具体的なアクションに落とす。' },
]

export function CaseStudyVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>ケース思考の4フェーズ</div>
      <div className="vz-phase-stack vz-stagger">
        {phases.map((p, i) => (
          <div key={i} className="vz-phase">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="vz-phase-icon">{i + 1}</span>
              <span className="vz-phase-label">{p.label}</span>
            </div>
            <div className="vz-phase-title">{p.title}</div>
            <div className="vz-phase-body">{p.body}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'rgba(5, 150, 105, 0.10)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: '#065F46',
        textAlign: 'center',
      }}>
        💡 焦って 1 → 4 に飛ばないこと。中間を省くほど結論がブレる
      </div>
    </div>
  )
}
