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
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: branch-label 12→13, branch-sub 11→12, branch-deeper 11→12
 *   - warm accent: vz-ww-parallel-svg の分岐ライン 4 本を terracotta
 *     (1 → 4 への「分岐の動き」を示す矢印的要素 = 1 visual 内 1 箇所)
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
            {/* warm accent (A 案 Phase 3): 分岐ラインを terracotta に。
             * 「ルートから 4 枝へ分岐する動き」が 1 visual の主役 = 1 箇所限定 */}
            <line x1="160" y1="0" x2="40"  y2="24" stroke="var(--visual-warm-primary)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="120" y2="24" stroke="var(--visual-warm-primary)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="200" y2="24" stroke="var(--visual-warm-primary)" strokeWidth="1.4" />
            <line x1="160" y1="0" x2="280" y2="24" stroke="var(--visual-warm-primary)" strokeWidth="1.4" />
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
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: '0.8667rem',
          fontWeight: 600,
          color: 'var(--brand-on-soft, var(--brand))',
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        💡 各枝を独立に深掘り、インパクト × 実現可能性で優先順位
      </div>
    </div>
  )
}
