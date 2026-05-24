import { useStepReveal } from './hooks/useStepReveal'

type Props = {
  /** 'interactive'（default）= step ボタンで段階開示 / 'static' = 最初から全層表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * 帰納法 — 観察・サンプル → 一般則
 * lesson-26 step.visual='InductionDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - CSS 側 sample 13→14, warn 13→13 (already), arrow-up 18→20
 *   - warm accent: vz-arrow-up (↑ 観察 → 法則化の動き) を terracotta に
 *     （帰納の本質 = 下から上へ吸い上げる動きそのもの = 1 visual 内 1 箇所）
 *
 * 段階開示:
 *   Step 1..4 — サンプルを 1 個ずつ追加（A→B→C→D）
 *   Step 5    — 仮の法則を導出
 */
const samples = [
  'カラス A は黒い',
  'カラス B は黒い',
  'カラス C は黒い',
  'カラス D は黒い',
]

export function InductionVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 5, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        個別観察 → 法則化へ吸い上げる
      </div>

      <div className="vz-syllogism" style={{ flexDirection: 'column-reverse' }}>
        <div className="vz-induction-samples vz-stagger">
          {samples.map((s, i) => {
            // step 1 -> show samples[0], step 2 -> samples[0..1], etc.
            if (step <= i) return null
            return (
              <div key={i} className="vz-induction-sample">
                <span className="dot" />
                {s}
              </div>
            )
          })}
        </div>

        {step >= 5 && (
          <>
            <span className="vz-arrow-up" style={{ margin: '8px 0' }}>
              ↑
            </span>
            <div className="vz-premise-card conclusion">
              <span className="label">仮の法則</span>
              <span className="text">∴ カラスはみんな黒い（だろう）</span>
            </div>
          </>
        )}
      </div>

      {controls}

      {isLast && (
        <div className="vz-induction-warn">⚠ 反例 1 つ（白いカラス）で覆る — 帰納の限界</div>
      )}
    </div>
  )
}
