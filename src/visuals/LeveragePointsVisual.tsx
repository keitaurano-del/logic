import './visuals-phase3b.css'

/**
 * Leverage Points — システム介入の階層（Donella Meadows）
 * パラメータ → ルール → 目標 → パラダイム の 4 段ピラミッド
 * 上に行くほど介入の難易度は上がるが、変化のインパクトも大きくなる
 * lesson-314 等で利用
 */

type Tier = {
  label: string
  name: string
  desc: string
}

type Props = {
  sectionLabel?: string
  tiers?: [Tier, Tier, Tier, Tier]
  hint?: string
}

const defaultTiers: [Tier, Tier, Tier, Tier] = [
  { label: 'Tier 1', name: 'パラメータを変える', desc: '数値・予算・しきい値の調整。一番触りやすいが、効果も小さい。' },
  { label: 'Tier 2', name: 'ルールを変える',     desc: 'プロセス・制度・インセンティブの設計を変える。' },
  { label: 'Tier 3', name: '目標を変える',       desc: 'システムが何を目指すかを再定義する。' },
  { label: 'Tier 4', name: 'パラダイムを変える', desc: 'システムを支える前提・価値観そのものを問い直す。' },
]

export function LeveragePointsVisual({
  sectionLabel = '介入階層 — どこを変えるか',
  tiers = defaultTiers,
  hint = '💡 上に行くほど変えにくいが、変えた時のインパクトは桁違いに大きい',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-leverage-scale" style={{ marginBottom: 6 }}>
        <span>難易度 高 ↑</span>
        <span>インパクト 大 ↑</span>
      </div>

      <div className="vz-leverage">
        {tiers.map((t, i) => (
          <div key={i} className={`vz-leverage-tier t${i + 1}`}>
            <span className="vz-leverage-tier-label">{t.label}</span>
            <span className="vz-leverage-tier-name">{t.name}</span>
            <span className="vz-leverage-tier-desc">{t.desc}</span>
          </div>
        ))}
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
