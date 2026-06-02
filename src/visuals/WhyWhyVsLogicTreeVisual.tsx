import './visuals-whywhy.css'

/**
 * なぜなぜ（縦に深く）vs Why ツリー（横に広く）
 * lesson-340 step.visual='WhyWhyVsLogicTreeDiagram'
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: vbox 13→14, hroot 13→14, hleaf 12→13
 *   - warm accent: vbox.root (左カラム = 根本原因 = なぜなぜの到達点) を terracotta gradient
 *     (縦深掘りの到達ゴールを 1 visual 内 1 箇所だけ温度感色で示す)
 */
export function WhyWhyVsLogicTreeVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        なぜなぜ vs Why ツリー
      </div>

      <div className="vz-ww-vs">
        {/* なぜなぜ — 縦に深く */}
        <div className="vz-ww-vs-col">
          <div className="vz-ww-vs-title primary">なぜなぜ分析</div>
          <div className="vz-ww-vs-sub">1つを縦に深掘り</div>
          <div className="vz-ww-vs-vertical">
            <div className="vz-ww-vs-vbox start">事象</div>
            <div className="vz-ww-vs-arrow">↓</div>
            <div className="vz-ww-vs-vbox">なぜ？</div>
            <div className="vz-ww-vs-arrow">↓</div>
            <div className="vz-ww-vs-vbox">なぜ？</div>
            <div className="vz-ww-vs-arrow">↓</div>
            <div className="vz-ww-vs-vbox root">根本原因</div>
          </div>
        </div>

        {/* Why ツリー — 横に広く */}
        <div className="vz-ww-vs-col">
          <div className="vz-ww-vs-title alt">Why ツリー</div>
          <div className="vz-ww-vs-sub">原因候補を横に展開</div>
          <div className="vz-ww-vs-horizontal">
            <div className="vz-ww-vs-hroot">事象</div>
            <svg
              viewBox="0 0 200 16"
              className="vz-ww-vs-hlines"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="100" y1="0" x2="30"  y2="16" stroke="currentColor" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="100" y2="16" stroke="currentColor" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="170" y2="16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="vz-ww-vs-hbranches">
              <div className="vz-ww-vs-hleaf">原因A</div>
              <div className="vz-ww-vs-hleaf">原因B</div>
              <div className="vz-ww-vs-hleaf">原因C</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: '0.8667rem',
          fontWeight: 600,
          color: 'var(--brand-on-soft, var(--brand))',
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        💡 深掘りは「なぜなぜ」、網羅は「Why ツリー」
      </div>
    </div>
  )
}
