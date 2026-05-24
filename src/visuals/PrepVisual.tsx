import { useStepReveal } from './hooks/useStepReveal'

/**
 * PREP 法 — Point / Reason / Example / Point
 * lesson-23 step.visual='PrepDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - vz-prep-name 14 / vz-prep-desc 13 維持（新基準内）
 *   - warm accent: 最後の P (4 番目 = 結論の re-stating) の letter ボックスを terracotta gradient
 *     （話の閉じ = 1 visual 内 1 箇所、最初の P の brand-cta は維持）
 *
 * 4 段階で開示:
 *   Step 1..4 — P, R, E, P を 1 つずつ追加
 */
const items = [
  { letter: 'P', name: 'Point', desc: '結論 — 「私は〇〇だと考える」' },
  { letter: 'R', name: 'Reason', desc: '理由 — なぜそう言えるか' },
  { letter: 'E', name: 'Example', desc: '具体例・データ — 実証する根拠' },
  { letter: 'P', name: 'Point', desc: '結論 — 改めて主張を述べる' },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function PrepVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: items.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 12 }}>
        PREP 法 — 4ステップで話す
      </div>
      {items.slice(0, step).map((item, i) => (
        <div key={i} className="vz-prep-row">
          <div className={`vz-prep-letter${i === items.length - 1 ? ' final' : ''}`}>{item.letter}</div>
          <div className="vz-prep-meaning">
            <span className="vz-prep-name">{item.name}</span>
            <span className="vz-prep-desc">{item.desc}</span>
          </div>
        </div>
      ))}

      {controls}

      {isLast && (
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
          結論で始まり、結論で締める — 30秒で要点が伝わる構造
        </div>
      )}
    </div>
  )
}
