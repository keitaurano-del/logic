/**
 * ボトムアップ vs 仮説思考 — フロー比較
 * 左列：情報 → 結論（情報を全部集めてから考える）
 * 右列：仮説 → 検証 → 結論（先に当たりをつけて検証）
 * lesson-50 step.0 step.visual='HypothesisFlowDiagram'
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string                                    — 上部の見出し
 *   left? / right?: HypothesisColumn                         — 2 列の中身 (label / title / nodes)
 *   hint?: string                                            — 下部のヒント
 *
 * 未指定フィールドは default 値（ボトムアップ vs 仮説思考）が使われ、後方互換が保たれる。
 * 矢印は nodes 間に自動的に挿入される（左列は up 表現、右列は down 表現）。
 */

export type HypothesisColumn = {
  label?: string
  title?: string
  /** 上から順にノード文字列を並べる。最初・最後の強調装飾は左右共通 */
  nodes?: string[]
}

export type HypothesisFlowProps = {
  sectionLabel?: string
  left?: HypothesisColumn
  right?: HypothesisColumn
  hint?: string
}

const DEFAULT_PROPS: {
  sectionLabel: string
  left: Required<HypothesisColumn>
  right: Required<HypothesisColumn>
  hint: string
} = {
  sectionLabel: 'ボトムアップ vs 仮説思考 — 矢印の向きが逆になる',
  left: {
    label: '遅い',
    title: 'ボトムアップ',
    nodes: ['情報を全部集める', '整理・分類', '分析', '結論'],
  },
  right: {
    label: '速い',
    title: '仮説思考',
    nodes: ['仮説（当たり）', '必要な情報だけ収集', '検証 (支持／反証)', '結論'],
  },
  hint: '仮説思考は「先に答えの候補を立てる」だけで、情報収集の効率が桁違いに上がる',
}

function Column({ col, variant }: { col: Required<HypothesisColumn>; variant: 'left' | 'right' }) {
  const arrowClass = variant === 'left' ? 'vz-hypo-arrow up' : 'vz-hypo-arrow'
  return (
    <div className={`vz-hypo-col${variant === 'right' ? ' recommended' : ''}`}>
      <div className="col-label">{col.label}</div>
      <div className="col-title">{col.title}</div>
      {col.nodes.map((node, i) => {
        const cls =
          variant === 'right' && i === 0
            ? 'vz-hypo-node start'
            : variant === 'right' && i === col.nodes.length - 1
              ? 'vz-hypo-node end'
              : 'vz-hypo-node'
        return (
          <span key={i} style={{ display: 'contents' }}>
            <div className={cls}>{node}</div>
            {i < col.nodes.length - 1 ? <div className={arrowClass}>↓</div> : null}
          </span>
        )
      })}
    </div>
  )
}

export function HypothesisFlowVisual(props: HypothesisFlowProps = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULT_PROPS.sectionLabel
  const left = { ...DEFAULT_PROPS.left, ...(props.left ?? {}) }
  const right = { ...DEFAULT_PROPS.right, ...(props.right ?? {}) }
  const hint = props.hint ?? DEFAULT_PROPS.hint

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        {sectionLabel}
      </div>

      <div className="vz-hypo-flow vz-stagger">
        <Column col={left} variant="left" />
        <Column col={right} variant="right" />
      </div>

      {hint ? (
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
          {hint}
        </div>
      ) : null}
    </div>
  )
}
