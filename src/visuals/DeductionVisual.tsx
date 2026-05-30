import { useStepReveal } from './hooks/useStepReveal'

type Props = {
  /** 'interactive'（default）= step ボタンで段階開示 / 'static' = 最初から全層表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * 演繹法 — 大前提・小前提・結論
 * lesson-25 step.visual='DeductionDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint fontSize 11→13, padding/lineHeight 拡大
 *   - CSS 側 vz-premise-card .label 11→12, .text 15→16
 *   - warm accent: vz-arrow-down (↓ 演繹の動き) を terracotta に
 *     （一般則 → 結論 への落とし込みフロー = 1 visual 内 1 箇所、結論ブロックの brand-cta は維持）
 */
export function DeductionVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        三段論法 — 一般則 → 個別結論へ落ちる
      </div>

      <div className="vz-syllogism vz-stagger">
        {/* step >= 1: 大前提 */}
        <div className="vz-premise-card">
          <span className="label">大前提</span>
          <span className="text">すべての人間は死ぬ</span>
        </div>

        {step >= 2 && (
          <>
            <span className="vz-arrow-down">↓</span>
            <div className="vz-premise-card">
              <span className="label">小前提</span>
              <span className="text">ソクラテスは人間である</span>
            </div>
          </>
        )}

        {step >= 3 && (
          <>
            <span className="vz-arrow-down">↓</span>
            <div className="vz-premise-card conclusion">
              <span className="label">結論</span>
              <span className="text">ゆえに、ソクラテスは死ぬ</span>
            </div>
          </>
        )}
      </div>

      {controls}

      {isLast && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--success-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--success-deep)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          ✓ 前提が真なら結論も必ず真。論理が破綻する余地がない
        </div>
      )}
    </div>
  )
}
