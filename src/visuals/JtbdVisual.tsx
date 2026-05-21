/**
 * Jobs to be Done トライアド — 状況 × 動機 × ジョブ の 3 ベン図
 * 3 つの輪が重なる中心が「真のジョブ」
 * lesson-57 step.2 step.visual='JtbdDiagram'
 */
export function JtbdVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        Jobs to be Done — 「片づけたい用事」の構造
      </div>

      <div className="vz-jtbd vz-stagger">
        <div className="vz-jtbd-circle situation">状況<br /><span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>いつ・どこで</span></div>
        <div className="vz-jtbd-circle motivation">動機<br /><span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>感情・期待</span></div>
        <div className="vz-jtbd-circle job">期待される成果<br /><span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>達成したい結果</span></div>

        <div className="vz-jtbd-center">真のジョブ</div>
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
        例：「通勤中に集中したい」+「達成感が欲しい」+「5 分で完結」= ジョブ「スキマ学習」
      </div>
    </div>
  )
}
