import './visuals-phase3b.css'

/**
 * Triad — 3 要素の三角形（汎用）
 * 法・術・勢、3 つの目的、3C の主要素など、3 つの構成要素を持つ概念に使う
 * lesson-358（法・術・勢）/ lesson-72 step.0（承認・共感・行動）等で利用
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - hint fontSize 11→13, padding/lineHeight 拡大
 *   - triad-name 14→16, triad-label 11→12 (CSS 側で底上げ)
 *   - warm accent: triad-line (3 辺) を muted brand → terracotta soft に格上げ
 *     （3 要素を繋ぐ「関係性の線」= 動きの起点 = 1 visual 内 1 箇所）
 *     primary ノードは既に brand-cta-grad なので競合しない
 */

type Node = {
  label?: string
  name: string
}

type Props = {
  sectionLabel?: string
  top?: Node
  left?: Node
  right?: Node
  primary?: 'top' | 'left' | 'right'
  hint?: string
}

const defaultTop: Node = { label: 'Top', name: '法（しくみ）' }
const defaultLeft: Node = { label: 'Left', name: '術（うでまえ）' }
const defaultRight: Node = { label: 'Right', name: '勢（いきおい）' }

export function TriadVisual({
  sectionLabel = '3 要素の関係',
  top = defaultTop,
  left = defaultLeft,
  right = defaultRight,
  primary = 'top',
  hint = '💡 3 要素は独立ではなく、互いを支え合う関係にある',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-triad">
        <svg className="vz-triad-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {/* triangle connecting nodes (relative positions match .vz-triad-node positions) */}
          <line className="vz-triad-line" x1="50" y1="14" x2="18" y2="80" />
          <line className="vz-triad-line" x1="50" y1="14" x2="82" y2="80" />
          <line className="vz-triad-line" x1="18" y1="80" x2="82" y2="80" />
        </svg>

        <div className={`vz-triad-node top ${primary === 'top' ? 'primary' : ''}`}>
          {top.label && <span className="vz-triad-label">{top.label}</span>}
          <span className="vz-triad-name">{top.name}</span>
        </div>
        <div className={`vz-triad-node left ${primary === 'left' ? 'primary' : ''}`}>
          {left.label && <span className="vz-triad-label">{left.label}</span>}
          <span className="vz-triad-name">{left.name}</span>
        </div>
        <div className={`vz-triad-node right ${primary === 'right' ? 'primary' : ''}`}>
          {right.label && <span className="vz-triad-label">{right.label}</span>}
          <span className="vz-triad-name">{right.name}</span>
        </div>
      </div>

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
        {hint}
      </div>
    </div>
  )
}
