import './visuals-whywhy.css'

type Branch = {
  label: string
  tone: 'tone-a' | 'tone-b' | 'tone-c' | 'tone-d'
}

const branches: Branch[] = [
  { label: '商品の魅力低下',     tone: 'tone-a' },
  { label: '配送の遅延',         tone: 'tone-b' },
  { label: 'サポート対応の悪化', tone: 'tone-c' },
  { label: '競合の価格優位',     tone: 'tone-d' },
]

/**
 * なぜなぜ並行ループ — 1階層に複数の枝
 * lesson-344 step.visual='WhyWhyParallelDiagram'
 */
export function WhyWhyParallelVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        並行ループ — 1階層に複数の枝
      </div>

      <div className="vz-ww-parallel">
        <div className="vz-ww-parallel-root">リピート率 ↓</div>

        <div className="vz-ww-parallel-lines">
          <svg
            viewBox="0 0 320 24"
            className="vz-ww-parallel-svg"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="160" y1="0" x2="40"  y2="24" stroke="var(--text-muted)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="120" y2="24" stroke="var(--text-muted)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="200" y2="24" stroke="var(--text-muted)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="280" y2="24" stroke="var(--text-muted)" strokeWidth="1.4" />
          </svg>
        </div>

        <div className="vz-ww-parallel-branches">
          {branches.map((b, i) => (
            <div key={i} className={`vz-ww-parallel-branch ${b.tone}`}>
              <div className="vz-ww-parallel-branch-label">{b.label}</div>
              <div className="vz-ww-parallel-branch-sub">なぜ？↓</div>
              <div className="vz-ww-parallel-branch-deeper">深掘り</div>
            </div>
          ))}
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
        💡 各枝を独立に深掘り、インパクト × 実現可能性で優先順位
      </div>
    </div>
  )
}
