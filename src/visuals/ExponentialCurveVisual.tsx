import './visuals-phase3c.css'

/**
 * 指数曲線 vs 直線 — CAGR・複利の力
 * lesson-404 step.visual='ExponentialCurveDiagram'
 *
 * 構図: 折れ線グラフ (時間軸 / Y軸) で線形 vs 指数(年率10%複利) を重ねる
 * 下に 3 つのスポット (Year 5 / 10 / 20) で差を数値で示す
 */

export function ExponentialCurveVisual() {
  // 年率 +10% 複利 (初期値 100) と 年 +10 線形 (初期値 100)
  // 5 / 10 / 20 年後の値
  const points = [
    { yr: '5 年後', lin: 150, exp: 161 },
    { yr: '10 年後', lin: 200, exp: 259 },
    { yr: '20 年後', lin: 300, exp: 673 },
  ]

  // SVG viewBox: 280 x 180 (x: 0-280 = 0-20 year, y: 180-0 = 0-700)
  // ヘルパ: x = year * 14, y = 180 - value * (180/700)
  const sx = (yr: number) => 20 + yr * 12
  const sy = (val: number) => 170 - (val - 100) * (140 / 600)

  // 線形ライン (+10/yr)
  let linearPath = `M ${sx(0)} ${sy(100)}`
  for (let i = 1; i <= 20; i++) linearPath += ` L ${sx(i)} ${sy(100 + i * 10)}`

  // 指数ライン (×1.10/yr)
  let expPath = `M ${sx(0)} ${sy(100)}`
  for (let i = 1; i <= 20; i++) {
    const v = 100 * Math.pow(1.1, i)
    expPath += ` L ${sx(i)} ${sy(v)}`
  }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        年率 +10% 複利 vs 毎年 +10 線形（初期値 100）
      </div>

      <div className="vz-ec-wrap">
        <div className="vz-ec-svg-frame">
          <svg className="vz-ec-svg" viewBox="0 0 280 180" preserveAspectRatio="xMidYMid meet">
            {/* グリッド */}
            <line x1="20" y1="170" x2="270" y2="170" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="20" y1="10" x2="20" y2="170" stroke="var(--text-muted)" strokeWidth="1" />

            {/* Y 軸ラベル */}
            <text x="14" y="172" fontSize="7" fill="var(--text-muted)" textAnchor="end">100</text>
            <text x="14" y="103" fontSize="7" fill="var(--text-muted)" textAnchor="end">400</text>
            <text x="14" y="18" fontSize="7" fill="var(--text-muted)" textAnchor="end">700</text>

            {/* X 軸ラベル */}
            <text x="20" y="178" fontSize="7" fill="var(--text-muted)" textAnchor="middle">0</text>
            <text x="80" y="178" fontSize="7" fill="var(--text-muted)" textAnchor="middle">5</text>
            <text x="140" y="178" fontSize="7" fill="var(--text-muted)" textAnchor="middle">10</text>
            <text x="200" y="178" fontSize="7" fill="var(--text-muted)" textAnchor="middle">15</text>
            <text x="260" y="178" fontSize="7" fill="var(--text-muted)" textAnchor="middle">20 年</text>

            {/* 線形 */}
            <path d={linearPath} fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 3" />

            {/* 指数 */}
            <path d={expPath} fill="none" stroke="var(--brand)" strokeWidth="2.5" />

            {/* 最終ドット */}
            <circle cx={sx(20)} cy={sy(100 + 20 * 10)} r="3" fill="var(--text-muted)" />
            <circle cx={sx(20)} cy={sy(100 * Math.pow(1.1, 20))} r="3.5" fill="var(--brand)" />

            {/* ラベル */}
            <text x={sx(20) - 4} y={sy(100 + 20 * 10) + 12} fontSize="7" fill="var(--text-muted)" textAnchor="end" fontWeight="700">+300</text>
            <text x={sx(20) - 4} y={sy(100 * Math.pow(1.1, 20)) - 4} fontSize="8" fill="var(--brand)" textAnchor="end" fontWeight="700">×6.7倍</text>
          </svg>
        </div>

        <div className="vz-ec-legend">
          <span className="vz-ec-legend-item">
            <span className="vz-ec-line-swatch exp" />指数（年率 +10%）
          </span>
          <span className="vz-ec-legend-item">
            <span className="vz-ec-line-swatch linear" />線形（毎年 +10）
          </span>
        </div>

        <div className="vz-ec-points">
          {points.map((p) => (
            <div key={p.yr} className="vz-ec-point">
              <span className="yr">{p.yr}</span>
              <span className="val">{p.exp}</span>
              <span className="vs">vs 線形 {p.lin}</span>
            </div>
          ))}
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
        💡 序盤は差がなくても、時間が複利の効果を爆発させる
      </div>
    </div>
  )
}
