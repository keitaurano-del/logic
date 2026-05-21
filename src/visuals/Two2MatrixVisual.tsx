import './visuals-phase2.css'

/**
 * 汎用 2×2 マトリクス図解
 * lesson-54, lesson-86, lesson-321, lesson-322, lesson-412 ほか 6 レッスン以上で流用される基幹コンポーネント
 * 想定 visualId: 'Two2MatrixDiagram'
 *
 * default: lesson-54 step.1「インパクト × 実行容易性」
 */

export type Two2MatrixCell = {
  title: string
  items?: string[]
}

export type Two2MatrixProps = {
  sectionLabel?: string
  xAxis?: { low: string; high: string; label?: string }
  yAxis?: { low: string; high: string; label?: string }
  /** top-left, top-right, bottom-left, bottom-right の順 */
  cells?: [Two2MatrixCell, Two2MatrixCell, Two2MatrixCell, Two2MatrixCell]
  hint?: string
}

const DEFAULT_PROPS: Required<Two2MatrixProps> = {
  sectionLabel: 'インパクト × 実行容易性',
  xAxis: { low: '実行が難しい', high: '実行が容易', label: '実行容易性' },
  yAxis: { low: 'インパクト小', high: 'インパクト大', label: 'インパクト' },
  cells: [
    {
      title: '戦略的計画',
      items: ['新規事業立ち上げ', '大規模システム刷新'],
    },
    {
      title: '最優先 ★',
      items: ['主力顧客の値上げ交渉', '新料金プラン導入'],
    },
    {
      title: '後回し',
      items: ['SNS の細かい運用見直し'],
    },
    {
      title: 'Quick Win',
      items: ['請求書テンプレ統一', 'FAQ ページ追加'],
    },
  ],
  hint: '右上 (最優先) → 右下 (Quick Win) の順に着手すると ROI が高い',
}

export function Two2MatrixVisual(props: Two2MatrixProps = {}) {
  const { sectionLabel, xAxis, yAxis, cells, hint } = { ...DEFAULT_PROPS, ...props }
  const [tl, tr, bl, br] = cells

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>{sectionLabel}</div>

      {yAxis.label ? (
        <div className="vz-22m-axis-label">↑ {yAxis.label}</div>
      ) : null}

      <div className="vz-22m-wrap">
        <div className="vz-22m-yaxis">
          <span className="axis-end">{yAxis.high}</span>
          <span className="axis-end">{yAxis.low}</span>
        </div>

        <div className="vz-22m-grid">
          <div className="vz-22m-cell tl">
            <div className="vz-22m-cell-title">{tl.title}</div>
            {tl.items && tl.items.length > 0 ? (
              <div className="vz-22m-cell-items">
                {tl.items.map((it, i) => <span key={i}>・{it}</span>)}
              </div>
            ) : null}
          </div>
          <div className="vz-22m-cell tr">
            <div className="vz-22m-cell-title">{tr.title}</div>
            {tr.items && tr.items.length > 0 ? (
              <div className="vz-22m-cell-items">
                {tr.items.map((it, i) => <span key={i}>・{it}</span>)}
              </div>
            ) : null}
          </div>
          <div className="vz-22m-cell bl">
            <div className="vz-22m-cell-title">{bl.title}</div>
            {bl.items && bl.items.length > 0 ? (
              <div className="vz-22m-cell-items">
                {bl.items.map((it, i) => <span key={i}>・{it}</span>)}
              </div>
            ) : null}
          </div>
          <div className="vz-22m-cell br">
            <div className="vz-22m-cell-title">{br.title}</div>
            {br.items && br.items.length > 0 ? (
              <div className="vz-22m-cell-items">
                {br.items.map((it, i) => <span key={i}>・{it}</span>)}
              </div>
            ) : null}
          </div>
        </div>

        <div />
        <div className="vz-22m-xaxis">
          <span>{xAxis.low}</span>
          <span>{xAxis.high} →</span>
        </div>
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
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
