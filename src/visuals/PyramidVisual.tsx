import { useStepReveal } from './hooks/useStepReveal'

type Props = {
  /** 'interactive'（default）= step ボタンで段階開示 / 'static' = 最初から全層表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * ピラミッド原則 — 結論→主張→根拠の3層構造
 * lesson-23 step.visual='PyramidDiagram'
 *
 * 3 段階で開示:
 *   Step 1 — 結論
 *   Step 2 — 結論 + 主張 3 つ
 *   Step 3 — 全層（結論 + 主張 + 根拠）
 *
 * 2026-05-21 — スマホ全画面最適化プロトタイプ。
 *   - VisualSlide 側で fullBleed=true により外側 padding を打ち消し、画面端まで利用
 *   - 各カードを大きく（min-height 80-110px、本文 17-18px、ラベル 14-15px）
 *   - 段階開示は維持。`revealMode='static'` で全層表示モードも後方互換
 */
export function PyramidVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  // LessonStoriesScreen の swipe / tap-zone への伝播を全部止める。
  // 段階開示中の「戻る」ボタンが親スクリーンの前スライドに遷移してしまう問題を防ぐ。
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-pyramid vz-pyramid-fb vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      {/* 頂点：結論 (step >= 1) */}
      <div className="vz-pyramid-row r1">
        <div className="vz-pyramid-cell top">
          <span className="vz-pyramid-cell-label">結論</span>
          <span className="vz-pyramid-cell-body">今期は新規獲得に集中</span>
        </div>
      </div>

      {/* 主張 3 つ (step >= 2) */}
      {step >= 2 && (
        <div className="vz-pyramid-row r2">
          <div className="vz-pyramid-cell mid">
            <span className="vz-pyramid-cell-label">主張 1</span>
            <span className="vz-pyramid-cell-body">LTV は飽和</span>
          </div>
          <div className="vz-pyramid-cell mid">
            <span className="vz-pyramid-cell-label">主張 2</span>
            <span className="vz-pyramid-cell-body">CAC が下がっている</span>
          </div>
          <div className="vz-pyramid-cell mid">
            <span className="vz-pyramid-cell-label">主張 3</span>
            <span className="vz-pyramid-cell-body">市場が拡大中</span>
          </div>
        </div>
      )}

      {/* 根拠 (step >= 3) */}
      {step >= 3 && (
        <div className="vz-pyramid-row r3">
          <div className="vz-pyramid-bottom-col">
            <div className="vz-pyramid-cell bottom">ARPU 3年横ばい</div>
            <div className="vz-pyramid-cell bottom">解約率 5%安定</div>
          </div>
          <div className="vz-pyramid-bottom-col">
            <div className="vz-pyramid-cell bottom">CAC −30% YoY</div>
            <div className="vz-pyramid-cell bottom">広告枠が割安</div>
          </div>
          <div className="vz-pyramid-bottom-col">
            <div className="vz-pyramid-cell bottom">業界 +15% YoY</div>
            <div className="vz-pyramid-cell bottom">自社シェア 8%</div>
          </div>
        </div>
      )}

      {controls}

      <div className="vz-pyramid-hint">
        ↓ Why So?（下に降りる） / ↑ So What?（上に上る）
      </div>
    </div>
  )
}
