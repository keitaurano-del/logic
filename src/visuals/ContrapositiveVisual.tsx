/**
 * 対偶 (Contrapositive) — P→Q  ⇔  ¬Q→¬P
 * lesson-27 step.visual='ContrapositiveDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline 10→12 (subtext), inline hint 11→13
 *   - vz-contra-block 13→14, vz-premise-card .label 11→12 (CSS 側)
 *   - warm accent: vz-contra-arrow (⇔ 等価記号) を terracotta に格上げ
 *     （命題 ⇔ 対偶の「等価関係そのもの」= 1 visual 内 1 箇所）
 */
export function ContrapositiveVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>命題と対偶は同値</div>

      <div className="vz-contra-flow">
        <div className="vz-contra-block">
          <strong>P → Q</strong><br />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>雨が降れば 道は濡れる</span>
        </div>
        <span className="vz-contra-arrow">⇔</span>
        <div className="vz-contra-block equivalent">
          <strong>¬Q → ¬P</strong><br />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>道が濡れていなければ 雨は降らなかった</span>
        </div>
      </div>

      <div className="vz-section-label" style={{ marginTop: 8, marginBottom: 6 }}>真理値表で確認</div>
      <table className="vz-truth-table">
        <thead>
          <tr>
            <th>P</th>
            <th>Q</th>
            <th>P→Q</th>
            <th>¬Q→¬P</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="T">T</td><td className="T">T</td><td className="T">T</td><td className="T">T</td></tr>
          <tr><td className="T">T</td><td className="F">F</td><td className="F">F</td><td className="F">F</td></tr>
          <tr><td className="F">F</td><td className="T">T</td><td className="T">T</td><td className="T">T</td></tr>
          <tr><td className="F">F</td><td className="F">F</td><td className="T">T</td><td className="T">T</td></tr>
        </tbody>
      </table>

      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        逆 (Q→P) や 裏 (¬P→¬Q) は元の命題と同値ではない
      </div>
    </div>
  )
}
