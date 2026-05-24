import { useStepReveal } from './hooks/useStepReveal'
import './visuals-fermi.css'

/**
 * フェルミ — マクロ売上 / ミクロ売上 双方向分解
 * lesson-214 step.visual='FermiMacroMicroSplitDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - factor.label 9→12, factor.value 12→14, side-tag 11→12 など CSS 側で底上げ
 *   - warm accent: 中央ゴールの「上下で桁が一致 ✓」バッジを terracotta 系に格上げ
 *     （照合一致 = 推定の到達点 = 1 visual 内 1 箇所アクセント）
 *
 * 構図:
 *   - 中央: 市場全体の売上（共通ゴール）
 *   - 上: マクロ視点（人口 × 利用率 × 単価）
 *   - 下: ミクロ視点（1 店舗売上 × 365 日 × 店舗数）
 *   - 上下 2 経路が中央で照合される Y 字構造
 *
 * 段階開示:
 *   Step 1 — 中央のゴール表示
 *   Step 2 — マクロ側 4 因子
 *   Step 3 — ミクロ側 4 因子
 *   Step 4 — 結果照合のチェックバッジ
 */

type Props = {
  revealMode?: 'interactive' | 'static'
}

const MACRO = [
  { label: '人口', value: '1.24 億人' },
  { label: '利用率', value: '20%' },
  { label: '頻度', value: '4 回 / 年' },
  { label: '単価', value: '2,500 円' },
]

const MICRO = [
  { label: '客席', value: '40 席' },
  { label: '回転', value: '3 回 / 日' },
  { label: '客単価', value: '900 円' },
  { label: '店舗 × 営業日', value: '8,000 店 × 350 日' },
]

export function FermiMacroMicroSplitVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 4, mode: revealMode })

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-fermi-mm vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        マクロ売上 / ミクロ売上 — 2 経路で組み立てる
      </div>

      {/* マクロ視点（上） */}
      {step >= 2 && (
        <div className="vz-fermi-mm-side macro" aria-label="マクロ視点">
          <div className="vz-fermi-mm-side-head">
            <span className="vz-fermi-mm-side-tag">マクロ視点 — 需要から積む</span>
          </div>
          <div className="vz-fermi-mm-factors">
            {MACRO.map((f, i) => (
              <div key={`mac-${i}`} className="vz-fermi-mm-factor">
                <span className="vz-fermi-mm-factor-label">{f.label}</span>
                <span className="vz-fermi-mm-factor-value">{f.value}</span>
                {i < MACRO.length - 1 && (
                  <span className="vz-fermi-mm-factor-mul" aria-hidden>
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="vz-fermi-mm-arrow down" aria-hidden>
            ↓
          </div>
        </div>
      )}

      {/* 中央ゴール */}
      <div className="vz-fermi-mm-center" aria-label="ゴール">
        <span className="vz-fermi-mm-center-label">市場全体の売上</span>
        <span className="vz-fermi-mm-center-value">およそ 6,200 億円 / 年</span>
        {step >= 4 && (
          <span className="vz-fermi-mm-center-check" aria-label="2 経路で一致">
            上下で桁が一致 ✓
          </span>
        )}
      </div>

      {/* ミクロ視点（下） */}
      {step >= 3 && (
        <div className="vz-fermi-mm-side micro" aria-label="ミクロ視点">
          <div className="vz-fermi-mm-arrow up" aria-hidden>
            ↑
          </div>
          <div className="vz-fermi-mm-factors">
            {MICRO.map((f, i) => (
              <div key={`mic-${i}`} className="vz-fermi-mm-factor">
                <span className="vz-fermi-mm-factor-label">{f.label}</span>
                <span className="vz-fermi-mm-factor-value">{f.value}</span>
                {i < MICRO.length - 1 && (
                  <span className="vz-fermi-mm-factor-mul" aria-hidden>
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="vz-fermi-mm-side-head">
            <span className="vz-fermi-mm-side-tag">ミクロ視点 — 1 店舗から積む</span>
          </div>
        </div>
      )}

      {controls}

      {isLast && (
        <div className="vz-fermi-mm-hint">
          2 経路で桁が揃えば、推定値の信頼度は一段上がります。
        </div>
      )}
    </div>
  )
}
