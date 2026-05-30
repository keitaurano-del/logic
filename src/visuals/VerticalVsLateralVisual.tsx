import './visuals-phase3b.css'

/**
 * Vertical vs Lateral — 垂直思考 vs 水平思考
 * 縦に深掘りする思考と、横に発想を広げる思考の対比
 * lesson-59 step.0 等で利用
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: vvl-pill 12.5→13, vvl-name 14px / vvl-tag 12px は既に底上げ済
 *   - warm accent: lateral カラムの vvl-arrow → を terracotta に
 *     (水平思考 = 「選択肢を広げる動き」が 1 visual の主役 = 1 箇所、vertical 側 brand は維持)
 */

type Side = {
  name: string
  layers: string[]
  tag: string
}

type Props = {
  sectionLabel?: string
  vertical?: Side
  lateral?: Side
  hint?: string
}

const defaultVertical: Side = {
  name: 'Vertical — 垂直思考',
  layers: ['前提を受け入れる', '論理で深掘り', '正解に収束'],
  tag: '深さ × 正確さ',
}

const defaultLateral: Side = {
  name: 'Lateral — 水平思考',
  layers: ['前提を疑う', '別の枠で発想', '選択肢を広げる'],
  tag: '広さ × 新規性',
}

export function VerticalVsLateralVisual({
  sectionLabel = '垂直思考 vs 水平思考',
  vertical = defaultVertical,
  lateral = defaultLateral,
  hint = '💡 まず水平で選択肢を広げ、垂直で 1 つを深く検証する — 両方使う',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-vvl">
        <div className="vz-vvl-col vertical">
          <div className="vz-vvl-name">{vertical.name}</div>
          <div className="vz-vvl-stack">
            {vertical.layers.map((layer, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span className={i === 0 ? 'vz-vvl-pill top' : 'vz-vvl-pill'}>{layer}</span>
                {i < vertical.layers.length - 1 && <span className="vz-vvl-arrow">↓</span>}
              </div>
            ))}
          </div>
          <div className="vz-vvl-tag">{vertical.tag}</div>
        </div>

        <div className="vz-vvl-col lateral">
          <div className="vz-vvl-name">{lateral.name}</div>
          <div className="vz-vvl-stack">
            <div className="vz-vvl-stack-row">
              {lateral.layers.map((layer, i) => (
                <span key={i} className="vz-vvl-pill alt">{layer}</span>
              ))}
            </div>
            <span className="vz-vvl-arrow">→</span>
            <span className="vz-vvl-pill top" style={{ background: 'var(--brand-grad-pop)' }}>
              選択肢が広がる
            </span>
          </div>
          <div className="vz-vvl-tag">{lateral.tag}</div>
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
          color: 'var(--brand)',
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        {hint}
      </div>
    </div>
  )
}
