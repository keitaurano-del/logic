import { useStepReveal } from './hooks/useStepReveal'

/**
 * 氷山モデル — システムを 4 層で見る
 * できごと（見える） / パターン / 構造 / メンタルモデル（最深部）
 * lesson-65 step.2 step.visual='IcebergModelDiagram'
 *
 * 4 段階で開示:
 *   Step 1 — できごと
 *   Step 2 — できごと + 水面 + パターン
 *   Step 3 — + 構造
 *   Step 4 — + メンタルモデル
 */

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function IcebergModelVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 4, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        氷山モデル — 見えるのは全体の 10%
      </div>

      <div className="vz-iceberg vz-stagger">
        {/* 水面より上：できごと */}
        <div className="vz-iceberg-layer top">
          <span className="label">Lv.1 できごと</span>
          <span className="title">何が起きたか</span>
          <span className="body">遅刻が増えた／売上が落ちた</span>
        </div>

        {step >= 2 && (
          <>
            <div className="vz-iceberg-water-line">
              <span>水面 / Waterline</span>
            </div>
            <div className="vz-iceberg-layer upper-mid">
              <span className="label">Lv.2 パターン</span>
              <span className="title">繰り返し起きること</span>
              <span className="body">月末に集中／同じ部署で頻発</span>
            </div>
          </>
        )}

        {step >= 3 && (
          <div className="vz-iceberg-layer lower-mid">
            <span className="label">Lv.3 構造</span>
            <span className="title">仕組み・関係性</span>
            <span className="body">評価制度・ワークフロー・人員配置</span>
          </div>
        )}

        {step >= 4 && (
          <div className="vz-iceberg-layer bottom">
            <span className="label">Lv.4 メンタルモデル</span>
            <span className="title">前提となる思い込み</span>
            <span className="body">「残業＝努力」「忙しい人が偉い」</span>
          </div>
        )}
      </div>

      {controls}

      {isLast && (
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
          深く潜るほどレバレッジが効く。上っ面のできごとだけ叩いても再発する
        </div>
      )}
    </div>
  )
}
