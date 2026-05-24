import './visuals-listening.css'

/**
 * 沈黙の 4 種類 — 2×2 マトリクス
 * lesson-731 系（listening コース）で利用想定
 * visualId: 'SilenceTypesDiagram'
 *
 * 軸:
 *   縦軸 = 相手の状態 (認知が動いている / 感情が動いている)
 *   横軸 = 聴き手の動き (待つ / 介入する)
 *
 * 4 種類:
 *   TL : 認知 × 待つ      — 考え中の沈黙、待てば言葉が出る
 *   TR : 認知 × 介入      — 質問で論点を絞る
 *   BL : 感情 × 待つ      — 感情整理の沈黙、待つことが安心になる
 *   BR : 感情 × 介入      — 感情の呼び水を出して受け止める
 *
 * warm accent: TL「考え中・待つ」セルの左ボーダー (terracotta)
 *   ＝「沈黙を待てる聴き手」が中心メッセージ、最重要セル。
 */

export type SilenceCell = {
  title: string
  body: string
}

export type SilenceTypesProps = {
  sectionLabel?: string
  /** [top-left, top-right, bottom-left, bottom-right] の順 */
  cells?: [SilenceCell, SilenceCell, SilenceCell, SilenceCell]
  xLabels?: { left: string; right: string }
  yLabels?: { top: string; bottom: string }
  hint?: string
}

const DEFAULT_PROPS: Required<SilenceTypesProps> = {
  sectionLabel: '沈黙の 4 種類 — 動かす前に見分ける',
  cells: [
    {
      title: '考え中の沈黙',
      body: '相手は頭の中で言葉を組み立てている。待てば答えが出てくる。',
    },
    {
      title: '論点を絞る質問',
      body: '考えが拡散して止まっている。質問で焦点を作ると進む。',
    },
    {
      title: '感情整理の沈黙',
      body: '気持ちが大きく動いている。待つこと自体が安心を渡す。',
    },
    {
      title: '感情の受け止め',
      body: '言葉にできない感情を、相づちや短い問いで引き出す。',
    },
  ],
  xLabels: { left: '待つ', right: '介入する' },
  yLabels: { top: '認知が動いている', bottom: '感情が動いている' },
  hint: 'まず沈黙の種類を見極める。同じ沈黙でも待つべきか質問すべきかは別物',
}

export function SilenceTypesVisual(props: SilenceTypesProps = {}) {
  const { sectionLabel, cells, xLabels, yLabels, hint } = { ...DEFAULT_PROPS, ...props }
  const [tl, tr, bl, br] = cells

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-silence-wrap">
        <div className="vz-silence-yaxis">
          <span>{yLabels.top}</span>
          <span>{yLabels.bottom}</span>
        </div>

        <div className="vz-silence-grid">
          <div className="vz-silence-cell tl">
            <div className="vz-silence-cell-title">{tl.title}</div>
            <div className="vz-silence-cell-body">{tl.body}</div>
          </div>
          <div className="vz-silence-cell tr">
            <div className="vz-silence-cell-title">{tr.title}</div>
            <div className="vz-silence-cell-body">{tr.body}</div>
          </div>
          <div className="vz-silence-cell bl">
            <div className="vz-silence-cell-title">{bl.title}</div>
            <div className="vz-silence-cell-body">{bl.body}</div>
          </div>
          <div className="vz-silence-cell br">
            <div className="vz-silence-cell-title">{br.title}</div>
            <div className="vz-silence-cell-body">{br.body}</div>
          </div>
        </div>

        <div />
        <div className="vz-silence-xaxis">
          <span>{xLabels.left}</span>
          <span>{xLabels.right}</span>
        </div>
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
