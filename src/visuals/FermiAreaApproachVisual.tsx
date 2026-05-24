import { useStepReveal } from './hooks/useStepReveal'
import './visuals-fermi.css'

/**
 * フェルミ — 面積ベース型の図解
 * lesson-212 step.visual='FermiAreaApproachDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - stage-tag 11→13, stage-sub 11→13, formula-label 13→14
 *   - cell-tag 9→12, formula-frac num/den 12→14, result.value 17→18
 *   - warm accent: フォーカスセル「1 店舗」のハイライト = 動きの起点 → terracotta に格上げ
 *     （現状: brand-cta-grad。focus = 推定対象 = 1 visual 内 1 箇所アクセント）
 *
 * 段階開示:
 *   Step 1 — 国土メッシュ
 *   Step 2 — 1 店舗あたりの商圏面積を 1 マスにフォーカス
 *   Step 3 — 計算式と結果
 */

type Props = {
  revealMode?: 'interactive' | 'static'
}

const COLS = 5
const ROWS = 3
const TOTAL_CELLS = COLS * ROWS

export function FermiAreaApproachVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()
  const focusIdx = 7 // 中央付近のセルをハイライト

  return (
    <div
      className="vz-fermi-area vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        面積ベース型 — 国土を切り分けて推定する
      </div>

      <div className="vz-fermi-area-stage">
        <div
          className="vz-fermi-area-mesh"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
          aria-label="国土メッシュ"
        >
          {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
            const isFocus = step >= 2 && i === focusIdx
            return (
              <div
                key={i}
                className={`vz-fermi-area-cell${isFocus ? ' is-focus' : ''}`}
                aria-hidden={!isFocus}
              >
                {isFocus && <span className="vz-fermi-area-cell-tag">1 店舗</span>}
              </div>
            )
          })}
        </div>
        <div className="vz-fermi-area-stage-label">
          <span className="vz-fermi-area-stage-tag">国土 38 万 km²</span>
          {step >= 2 && (
            <span className="vz-fermi-area-stage-sub">↘︎ 1 店舗あたりの商圏でメッシュ分割</span>
          )}
        </div>
      </div>

      {step >= 3 && (
        <div className="vz-fermi-area-formula" aria-live="polite">
          <div className="vz-fermi-area-formula-row">
            <span className="vz-fermi-area-formula-label">店舗数</span>
            <span className="vz-fermi-area-formula-eq">=</span>
            <span className="vz-fermi-area-formula-frac">
              <span className="num">国土面積</span>
              <span className="bar" aria-hidden="true" />
              <span className="den">1 店舗あたり商圏</span>
            </span>
          </div>
          <div className="vz-fermi-area-result">
            <span className="label">推定例</span>
            <span className="value">38 万 km² ÷ 12 km² ≒ 32,000 店</span>
            <span className="note">国内 SS 実数 約 27,000 と桁感が一致</span>
          </div>
        </div>
      )}

      {controls}

      {isLast && (
        <div className="vz-fermi-area-hint">
          地理密度で決まるサービス（駅・SS・コンビニ等）は、面積ベースが最短経路です。
        </div>
      )}
    </div>
  )
}
