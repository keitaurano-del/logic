import './visuals-phase3b.css'

/**
 * Where → Why → How — 問題解決 3 段フロー
 * 起点（どこで起きてる？）→ 原因（なぜ？）→ 打ち手（どう解く？）
 * lesson-53 step.3 / lesson-95 step.0 等で利用
 */

export type WwwStep = {
  name: string
  desc: string
}

type Props = {
  sectionLabel?: string
  where?: WwwStep
  why?: WwwStep
  how?: WwwStep
  hint?: string
}

const defaultWhere: WwwStep = {
  name: 'Where：どこで起きている？',
  desc: '問題の所在を特定する。範囲・期間・対象を絞り込んで具体化。',
}

const defaultWhy: WwwStep = {
  name: 'Why：なぜ起きている？',
  desc: '原因を分解する。表面的な理由で止めず、構造まで掘り下げる。',
}

const defaultHow: WwwStep = {
  name: 'How：どう解決する？',
  desc: '打ち手を設計する。実行可能性とインパクトで優先順位をつける。',
}

export function WhereWhyHowVisual({
  sectionLabel = '問題解決の 3 段フロー',
  where = defaultWhere,
  why = defaultWhy,
  how = defaultHow,
  hint = '💡 Where を飛ばすと Why が広がりすぎ、Why を飛ばすと How が的外れになる',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-www">
        <div className="vz-www-step where">
          <div className="vz-www-icon">Where</div>
          <div className="vz-www-body">
            <span className="vz-www-name">{where.name}</span>
            <span className="vz-www-desc">{where.desc}</span>
          </div>
        </div>
        <span className="vz-www-arrow">↓</span>
        <div className="vz-www-step why">
          <div className="vz-www-icon">Why</div>
          <div className="vz-www-body">
            <span className="vz-www-name">{why.name}</span>
            <span className="vz-www-desc">{why.desc}</span>
          </div>
        </div>
        <span className="vz-www-arrow">↓</span>
        <div className="vz-www-step how">
          <div className="vz-www-icon">How</div>
          <div className="vz-www-body">
            <span className="vz-www-name">{how.name}</span>
            <span className="vz-www-desc">{how.desc}</span>
          </div>
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
