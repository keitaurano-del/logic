import './visuals-phase3b.css'

/**
 * Triad — 3 要素の三角形（汎用）
 * 法・術・勢、3 つの目的、3C の主要素など、3 つの構成要素を持つ概念に使う
 * lesson-358（法・術・勢）/ lesson-72 step.0（承認・共感・行動）等で利用
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
          marginTop: 12,
          padding: '8px 10px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
        }}
      >
        {hint}
      </div>
    </div>
  )
}
