/**
 * MECE の便利な4切り口を本体トーンで図解
 * lesson-20 step.visual='MecePatternsDiagram'
 */
export function MecePatternsVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>MECE の便利な4切り口</div>
      <div className="vz-mece-grid">
        {/* 要素分解 */}
        <div className="vz-mece-card">
          <div className="vz-mece-card-title">① 要素分解</div>
          <div className="vz-mece-mini-tree">
            <div className="root">売上</div>
            <svg viewBox="0 0 100 18" width="80" height="14">
              <line x1="50" y1="0"  x2="20" y2="18" stroke="#6C8EF5" strokeWidth="1.5" />
              <line x1="50" y1="0"  x2="80" y2="18" stroke="#6C8EF5" strokeWidth="1.5" />
            </svg>
            <div className="children">
              <span>客数</span><span className="mul">×</span><span>客単価</span>
            </div>
          </div>
        </div>

        {/* 時系列 */}
        <div className="vz-mece-card">
          <div className="vz-mece-card-title">② 時系列</div>
          <div className="vz-mece-stages">
            <span className="vz-mece-stage">認知</span>
            <span className="vz-mece-arrow">→</span>
            <span className="vz-mece-stage">検討</span>
            <span className="vz-mece-arrow">→</span>
            <span className="vz-mece-stage">購入</span>
          </div>
        </div>

        {/* 対立 */}
        <div className="vz-mece-card">
          <div className="vz-mece-card-title">③ 対立概念</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="vz-mece-pair">
              <span className="pair-a">国内</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="pair-b">海外</span>
            </div>
            <div className="vz-mece-pair">
              <span className="pair-a">既存</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="pair-b">新規</span>
            </div>
          </div>
        </div>

        {/* フレームワーク */}
        <div className="vz-mece-card">
          <div className="vz-mece-card-title">④ フレームワーク</div>
          <div className="vz-mece-3c">
            <div className="vz-mece-3c-circle customer">顧客</div>
            <div className="vz-mece-3c-circle competitor">競合</div>
            <div className="vz-mece-3c-circle company">自社</div>
          </div>
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
        💡 迷ったら「要素分解」が一番シンプルで確実
      </div>
    </div>
  )
}
