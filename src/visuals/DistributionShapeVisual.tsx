import './visuals-phase3c.css'

/**
 * 正規分布 vs 歪み分布 — 平均と中央値の位置の違い
 * lesson-405 step.visual='DistributionShapeDiagram'
 *
 * 構図: 横並び 2 カード (左: 正規分布 / 右: 右に裾長い歪み分布)
 * 各カードに分布曲線 + 平均ライン (brand) + 中央値ライン (success)
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、warning 意味色は維持
 *   - CSS: ds-card-title 13→14、ds-legend 12→13
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (skewed の warning 色は §2.3 例外として意味色を維持、ヒント 1 箇所のみ温度感色)
 */

export function DistributionShapeVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        平均と中央値はいつも一致しない
      </div>

      <div className="vz-ds-grid">
        {/* 正規分布: mean == median */}
        <div className="vz-ds-card">
          <div className="vz-ds-card-title">正規分布</div>
          <svg className="vz-ds-svg" viewBox="0 0 120 90" preserveAspectRatio="none">
            {/* 軸 */}
            <line x1="4" y1="80" x2="116" y2="80" stroke="var(--text-muted)" strokeWidth="1" />
            {/* ベル曲線 (対称) */}
            <path
              d="M 4 80 Q 30 80 45 50 Q 60 14 75 50 Q 90 80 116 80"
              fill="rgba(108, 142, 245, 0.18)"
              stroke="var(--brand)"
              strokeWidth="1.5"
            />
            {/* 平均線 (中央) */}
            <line x1="60" y1="14" x2="60" y2="80" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* 中央値線 (同位置に少しオフセット) */}
            <line x1="60" y1="22" x2="60" y2="80" stroke="var(--success)" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="60" y="10" fontSize="6" fill="var(--text-secondary)" textAnchor="middle" fontWeight="700">
              平均 = 中央値
            </text>
          </svg>
          <div className="vz-ds-legend">
            <div className="vz-ds-legend-item">
              <span className="vz-ds-swatch mean" /> 平均
            </div>
            <div className="vz-ds-legend-item">
              <span className="vz-ds-swatch median" /> 中央値
            </div>
          </div>
        </div>

        {/* 右に裾の長い歪み分布: mean が中央値より右 */}
        <div className="vz-ds-card skewed">
          <div className="vz-ds-card-title">右に歪んだ分布</div>
          <svg className="vz-ds-svg" viewBox="0 0 120 90" preserveAspectRatio="none">
            <line x1="4" y1="80" x2="116" y2="80" stroke="var(--text-muted)" strokeWidth="1" />
            {/* 左ピーク + 右に長い裾 */}
            <path
              d="M 4 80 Q 18 80 30 40 Q 42 14 52 30 Q 70 64 90 76 Q 105 80 116 80"
              fill="rgba(217, 119, 6, 0.18)"
              stroke="var(--warning)"
              strokeWidth="1.5"
            />
            {/* 中央値 (ピーク付近) */}
            <line x1="44" y1="22" x2="44" y2="80" stroke="var(--success)" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* 平均 (裾に引っ張られて右) */}
            <line x1="66" y1="22" x2="66" y2="80" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="44" y="10" fontSize="6" fill="var(--success)" textAnchor="middle" fontWeight="700">中央値</text>
            <text x="78" y="10" fontSize="6" fill="var(--brand)" textAnchor="middle" fontWeight="700">平均</text>
          </svg>
          <div className="vz-ds-legend">
            <div className="vz-ds-legend-item">
              <span className="vz-ds-swatch mean" /> 平均（外れ値に引っ張られる）
            </div>
            <div className="vz-ds-legend-item">
              <span className="vz-ds-swatch median" /> 中央値（真ん中の人）
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        background: 'var(--visual-warm-primary-soft)',
        borderRadius: 8,
        fontSize: '0.8667rem',
        fontWeight: 600,
        color: 'var(--visual-warm-primary-deep)',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        ⚠ 年収・売上などは右に歪んでいる。平均だけ見ると実態を誤る
      </div>
    </div>
  )
}
