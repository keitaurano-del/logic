import './visuals-phase3b.css'

/**
 * Porter's Five Forces — 業界構造分析の 5 つの力
 * 中央に「業界内競合」、上下左右に新規参入・代替品・買い手・売り手
 * lesson-323 等で利用
 */

type Force = {
  name: string
  label?: string
}

type Props = {
  sectionLabel?: string
  center?: Force
  newEntrants?: Force
  substitutes?: Force
  buyers?: Force
  suppliers?: Force
  hint?: string
}

const defaults = {
  center:       { name: '業界内競合', label: '中核' },
  newEntrants:  { name: '新規参入の脅威', label: '上から' },
  substitutes:  { name: '代替品の脅威',   label: '下から' },
  buyers:       { name: '買い手の交渉力', label: '右から' },
  suppliers:    { name: '売り手の交渉力', label: '左から' },
}

export function FiveForcesVisual({
  sectionLabel = '5 フォース分析',
  center = defaults.center,
  newEntrants = defaults.newEntrants,
  substitutes = defaults.substitutes,
  buyers = defaults.buyers,
  suppliers = defaults.suppliers,
  hint = '💡 5 つの力が強いほど業界の収益性は下がる — 「儲かるか」を構造で読む',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-5f">
        <div className="vz-5f-cell top">
          {newEntrants.label && <span className="vz-5f-label">{newEntrants.label}</span>}
          <span className="vz-5f-name">{newEntrants.name}</span>
        </div>
        <div className="vz-5f-cell left">
          {suppliers.label && <span className="vz-5f-label">{suppliers.label}</span>}
          <span className="vz-5f-name">{suppliers.name}</span>
        </div>
        <div className="vz-5f-cell center">
          {center.label && <span className="vz-5f-label">{center.label}</span>}
          <span className="vz-5f-name">{center.name}</span>
        </div>
        <div className="vz-5f-cell right">
          {buyers.label && <span className="vz-5f-label">{buyers.label}</span>}
          <span className="vz-5f-name">{buyers.name}</span>
        </div>
        <div className="vz-5f-cell bottom">
          {substitutes.label && <span className="vz-5f-label">{substitutes.label}</span>}
          <span className="vz-5f-name">{substitutes.name}</span>
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
