import './visuals-phase3b.css'

/**
 * Claim / Reason / Assumption — 主張・根拠・前提の 3 層
 * 氷山メタファー：主張と根拠は水面の上、前提は水面下に隠れている
 * lesson-40 step.2 等で利用
 */

type Block = {
  label: string
  text: string
}

type Props = {
  sectionLabel?: string
  claim?: Block
  reason?: Block
  assumption?: Block
  hint?: string
}

const defaultClaim: Block = {
  label: 'Claim — 主張',
  text: '新人研修にロールプレイを導入すべきだ',
}

const defaultReason: Block = {
  label: 'Reason — 根拠',
  text: '導入企業 30 社で離職率が平均 12% 下がった',
}

const defaultAssumption: Block = {
  label: 'Assumption — 前提（隠れた仮定）',
  text: '「離職率の改善 = 当社にとって最優先課題」だと相手も同意する',
}

export function ClaimReasonAssumptionVisual({
  sectionLabel = '主張・根拠・前提の構造',
  claim = defaultClaim,
  reason = defaultReason,
  assumption = defaultAssumption,
  hint = '💡 議論が噛み合わない時は、たいてい水面下の「前提」がズレている',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-cra">
        <div className="vz-cra-iceberg">
          <div className="vz-cra-block claim">
            <span className="vz-cra-label">{claim.label}</span>
            <span className="vz-cra-text">{claim.text}</span>
          </div>
          <div className="vz-cra-block reason">
            <span className="vz-cra-label">{reason.label}</span>
            <span className="vz-cra-text">{reason.text}</span>
          </div>
          <div className="vz-cra-waterline">水面 — Waterline</div>
          <div className="vz-cra-block assumption">
            <span className="vz-cra-label">{assumption.label}</span>
            <span className="vz-cra-text">{assumption.text}</span>
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
