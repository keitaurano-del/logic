import './visuals-phase3c.css'

/**
 * 絶対値 vs 相対値 — 同じ事実、違う見え方
 * lesson-42 step.2 / lesson-401 visual='AbsoluteVsRelativeDiagram'
 *
 * 構図: 共通の事実カード上に、2 つの見せ方カード（絶対値 / 相対値）を並べる
 */

export function AbsoluteVsRelativeVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        同じ事実、違う見せ方
      </div>

      <div className="vz-avr-wrap">
        <div className="vz-avr-fact">
          <div className="vz-avr-fact-label">同じ事実</div>
          <div className="vz-avr-fact-text">
            ある薬で副作用が出た人 — 1万人中 2 人（昨年は 1 人）
          </div>
        </div>

        <div className="vz-avr-split">
          <div className="vz-avr-card">
            <span className="vz-avr-card-tag">絶対値</span>
            <span className="vz-avr-card-number">0.02%</span>
            <span className="vz-avr-card-impression">
              全体で見ると<br />ほぼ無視できる確率
            </span>
          </div>
          <div className="vz-avr-card relative">
            <span className="vz-avr-card-tag">相対値</span>
            <span className="vz-avr-card-number">+100%</span>
            <span className="vz-avr-card-impression">
              昨年比で<br />倍増、危険！
            </span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'var(--warning-soft)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: '#92400E',
        textAlign: 'center',
      }}>
        ⚠ 「% 増」だけ語る相手は要注意。元の数を必ず確認する
      </div>
    </div>
  )
}
