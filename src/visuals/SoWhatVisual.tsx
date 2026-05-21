import { useStepReveal } from './hooks/useStepReveal'

/**
 * So What? / Why So? — 結論↔根拠の双方向
 * lesson-22 step.visual='SoWhatDiagram'
 *
 * 3 段階で開示:
 *   Step 1 — 結論
 *   Step 2 — 結論 + 根拠（↓ Why So 矢印付き）
 *   Step 3 — 双方向の矢印を完成
 */

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function SoWhatVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  return (
    <div className="vz-sowhat vz-stagger">
      <div className="vz-sowhat-block conclusion">
        <span className="vz-sowhat-label">結論 / メッセージ</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          このプロジェクトは予算を増やすべき
        </span>
      </div>

      {step >= 3 && (
        <div className="vz-sowhat-arrows">
          <span className="up">↑ So What?（で、何が言える？）</span>
        </div>
      )}

      {step >= 2 && (
        <div className="vz-sowhat-arrows">
          <span className="down">↓ Why So?（なぜそう言える？）</span>
        </div>
      )}

      {step >= 2 && (
        <div className="vz-sowhat-block">
          <span className="vz-sowhat-label">根拠 / データ</span>
          <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
            • ユーザー数が前年比 +180%<br />
            • 競合は同領域で投資を 2 倍化<br />
            • 既存リソースでは対応しきれない
          </span>
        </div>
      )}

      {controls}

      {isLast && (
        <div
          style={{
            marginTop: 6,
            padding: '8px 10px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
          }}
        >
          上下に往復できるか？が論理の強さの指標
        </div>
      )}
    </div>
  )
}
