/**
 * ボトムアップ vs 仮説思考 — フロー比較
 * 左列：情報 → 結論（情報を全部集めてから考える）
 * 右列：仮説 → 検証 → 結論（先に当たりをつけて検証）
 * lesson-50 step.0 step.visual='HypothesisFlowDiagram'
 */
export function HypothesisFlowVisual() {
  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        ボトムアップ vs 仮説思考 — 矢印の向きが逆になる
      </div>

      <div className="vz-hypo-flow vz-stagger">
        {/* 左：ボトムアップ */}
        <div className="vz-hypo-col">
          <div className="col-label">遅い</div>
          <div className="col-title">ボトムアップ</div>
          <div className="vz-hypo-node">情報を全部集める</div>
          <div className="vz-hypo-arrow up">↓</div>
          <div className="vz-hypo-node">整理・分類</div>
          <div className="vz-hypo-arrow up">↓</div>
          <div className="vz-hypo-node">分析</div>
          <div className="vz-hypo-arrow up">↓</div>
          <div className="vz-hypo-node">結論</div>
        </div>

        {/* 右：仮説思考 */}
        <div className="vz-hypo-col recommended">
          <div className="col-label">速い</div>
          <div className="col-title">仮説思考</div>
          <div className="vz-hypo-node start">仮説（当たり）</div>
          <div className="vz-hypo-arrow">↓</div>
          <div className="vz-hypo-node">必要な情報だけ収集</div>
          <div className="vz-hypo-arrow">↓</div>
          <div className="vz-hypo-node">検証 (支持／反証)</div>
          <div className="vz-hypo-arrow">↓</div>
          <div className="vz-hypo-node end">結論</div>
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
        仮説思考は「先に答えの候補を立てる」だけで、情報収集の効率が桁違いに上がる
      </div>
    </div>
  )
}
