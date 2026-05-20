/**
 * ピラミッド原則 — 結論→主張→根拠の3層構造
 * lesson-23 step.visual='PyramidDiagram'
 */
export function PyramidVisual() {
  return (
    <div className="vz-pyramid vz-stagger">
      {/* 頂点：結論 */}
      <div className="vz-pyramid-row r1">
        <div className="vz-pyramid-cell top">
          <div>
            <span className="vz-pyramid-cell-label">結論</span>
            今期は新規獲得に集中
          </div>
        </div>
      </div>

      {/* 主張 3 つ */}
      <div className="vz-pyramid-row r2">
        <div className="vz-pyramid-cell mid">
          <div>
            <span className="vz-pyramid-cell-label">主張 1</span>
            LTV は飽和
          </div>
        </div>
        <div className="vz-pyramid-cell mid">
          <div>
            <span className="vz-pyramid-cell-label">主張 2</span>
            CAC が下がっている
          </div>
        </div>
        <div className="vz-pyramid-cell mid">
          <div>
            <span className="vz-pyramid-cell-label">主張 3</span>
            市場が拡大中
          </div>
        </div>
      </div>

      {/* 根拠 (2 columns of 2 stacked) */}
      <div className="vz-pyramid-row r3">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="vz-pyramid-cell bottom">ARPU 3年横ばい</div>
          <div className="vz-pyramid-cell bottom">解約率 5%安定</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="vz-pyramid-cell bottom">CAC −30% YoY</div>
          <div className="vz-pyramid-cell bottom">広告枠が割安</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="vz-pyramid-cell bottom">業界 +15% YoY</div>
          <div className="vz-pyramid-cell bottom">自社シェア 8%</div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'rgba(245, 191, 160, 0.20)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: '#92400E',
        textAlign: 'center',
      }}>
        ↓ Why So?（下に降りる） / ↑ So What?（上に上る）
      </div>
    </div>
  )
}
