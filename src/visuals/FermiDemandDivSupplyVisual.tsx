import { useStepReveal } from './hooks/useStepReveal'
import './visuals-fermi.css'

/**
 * フェルミ — マクロ需要 ÷ ミクロ供給 型
 * lesson-215 step.visual='FermiDemandDivSupplyDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - tier-label 10→12, tier-title 14→16, unit/formula など CSS 側で底上げ
 *   - warm accent: 結果バッジ（必要な供給者数）の上に warm 系の小ラベルを追加せず、
 *     ÷ / = の divider .op を terracotta 系に格上げ（「割り算 = 演算の起点」=動きの意味）
 *     1 visual 内 1 箇所のみ (§2.4)
 *
 * 段階開示:
 *   Step 1 — 需要総量
 *   Step 2 — 1 単位の供給能力
 *   Step 3 — 結果（割り算と推定値）
 */

type Props = {
  revealMode?: 'interactive' | 'static'
}

export function FermiDemandDivSupplyVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-fermi-ds vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        マクロ需要 ÷ ミクロ供給 — 必要人数を逆算
      </div>

      {/* Step 1: 需要総量 */}
      <div className="vz-fermi-ds-row demand">
        <div className="vz-fermi-ds-tier">
          <span className="vz-fermi-ds-tier-label">① 需要総量</span>
          <span className="vz-fermi-ds-tier-title">ピアノ保有台数</span>
        </div>
        <div className="vz-fermi-ds-tier-value">
          <span className="num">300</span>
          <span className="unit">万台</span>
          <span className="formula">= 世帯 6,000 万 × 保有率 5%</span>
        </div>
      </div>

      {/* 矢印 */}
      <div className={`vz-fermi-ds-divider${step >= 2 ? ' is-visible' : ''}`}>
        <span className="op" aria-hidden>
          ÷
        </span>
      </div>

      {/* Step 2: 供給能力 */}
      {step >= 2 && (
        <div className="vz-fermi-ds-row supply">
          <div className="vz-fermi-ds-tier">
            <span className="vz-fermi-ds-tier-label">② 1 単位の供給能力</span>
            <span className="vz-fermi-ds-tier-title">調律師 1 人 / 年</span>
          </div>
          <div className="vz-fermi-ds-tier-value">
            <span className="num">600</span>
            <span className="unit">台 / 年</span>
            <span className="formula">= 4 台 / 日 × 200 営業日 ÷ 平均 3 年に 1 回</span>
          </div>
        </div>
      )}

      {/* 矢印 */}
      {step >= 2 && (
        <div className={`vz-fermi-ds-divider${step >= 3 ? ' is-visible' : ''}`}>
          <span className="op" aria-hidden>
            =
          </span>
        </div>
      )}

      {/* Step 3: 結果 */}
      {step >= 3 && (
        <div className="vz-fermi-ds-result" aria-live="polite">
          <span className="vz-fermi-ds-result-label">③ 必要な供給者数</span>
          <div className="vz-fermi-ds-result-row">
            <span className="vz-fermi-ds-result-value">5,000</span>
            <span className="vz-fermi-ds-result-unit">人</span>
          </div>
          <span className="vz-fermi-ds-result-note">300 万台 ÷ 600 台 = 5,000 人</span>
        </div>
      )}

      {controls}

      {isLast && (
        <div className="vz-fermi-ds-hint">
          「○○の人は何人いる？」系は、需要 ÷ 1 人の供給能力で逆算するのが王道です。
        </div>
      )}
    </div>
  )
}
