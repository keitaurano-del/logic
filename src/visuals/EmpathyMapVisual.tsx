/**
 * 共感マップ — 4 象限 (Think&Feel / See / Hear / Say&Do)
 * 中央にユーザーアイコン、4 象限でユーザー視点を整理する
 * lesson-57 step.0 step.visual='EmpathyMapDiagram'
 */
export function EmpathyMapVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        共感マップ — ユーザーの 4 視点を整理する
      </div>

      <div className="vz-empathy vz-stagger">
        <div className="vz-empathy-cell" style={{ borderTopLeftRadius: 14 }}>
          <span className="label">Think &amp; Feel</span>
          <span className="title">頭の中で考えてること</span>
          <span className="body">不安・期待・本音。声に出していない感情も含む</span>
        </div>
        <div className="vz-empathy-cell" style={{ borderTopRightRadius: 14 }}>
          <span className="label">See</span>
          <span className="title">目に入ってる環境</span>
          <span className="body">職場・SNS・周囲の人・触れる情報源</span>
        </div>
        <div className="vz-empathy-cell" style={{ borderBottomLeftRadius: 14 }}>
          <span className="label">Hear</span>
          <span className="title">耳に入ってること</span>
          <span className="body">同僚・家族・上司の言葉。影響力のある声</span>
        </div>
        <div className="vz-empathy-cell" style={{ borderBottomRightRadius: 14 }}>
          <span className="label">Say &amp; Do</span>
          <span className="title">口に出す・実際の行動</span>
          <span className="body">発言・SNS 投稿・購買行動。観察できる証拠</span>
        </div>

        {/* 中央：ユーザー */}
        <div className="vz-empathy-center" aria-label="ユーザー">
          USER
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
        本人が言葉にしない領域（Think&amp;Feel）こそ最大の発見ポイント
      </div>
    </div>
  )
}
