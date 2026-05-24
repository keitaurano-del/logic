import { useStepReveal } from './hooks/useStepReveal'
import './visuals-fermi.css'

/**
 * フェルミ — クロスチェック検算図
 * lesson-216 step.visual='FermiCrossCheckDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - q-label 10→12, q-body 14→16, col-tag 10→12, step-value 13→14 などを CSS で底上げ
 *   - verdict-body 12→14, verdict-title 14→16
 *   - warm accent: verdict (✓ 桁感は一致) の icon を terracotta 系に格上げ
 *     （検算合致 = 推定の到達確認 = 1 visual 内 1 箇所アクセント）
 *
 * 段階開示:
 *   Step 1 — 問い + 2 列の見出し
 *   Step 2 — 左右の中間計算
 *   Step 3 — 結果照合 + 判定
 */

type Props = {
  revealMode?: 'interactive' | 'static'
}

const LEFT_STEPS = [
  { label: '世帯数', value: '5,700 万' },
  { label: '× 普及率', value: '40%' },
  { label: '× 年間消費', value: '12 本 / 年' },
  { label: '× 単価', value: '450 円' },
]

const RIGHT_STEPS = [
  { label: '店舗数', value: '50,000 店' },
  { label: '× 1 日売上', value: '70,000 円' },
  { label: '× 営業日', value: '365 日' },
  { label: '× 当該カテゴリ比', value: '12%' },
]

export function FermiCrossCheckVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-fermi-cc vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        クロスチェック検算 — 2 経路で同じ桁か確かめる
      </div>

      <div className="vz-fermi-cc-question">
        <span className="vz-fermi-cc-q-label">問い</span>
        <span className="vz-fermi-cc-q-body">国内の食用油の年間市場規模はどれくらい？</span>
      </div>

      <div className="vz-fermi-cc-columns">
        {/* 左：需要側 */}
        <div className="vz-fermi-cc-col left">
          <div className="vz-fermi-cc-col-head demand">
            <span className="vz-fermi-cc-col-tag">A：需要側から積む</span>
          </div>
          <div className="vz-fermi-cc-steps">
            {LEFT_STEPS.map((s, i) => (
              <div
                key={`l-${i}`}
                className={`vz-fermi-cc-step${step >= 2 || i === 0 ? ' is-visible' : ''}`}
              >
                <span className="vz-fermi-cc-step-label">{s.label}</span>
                <span className="vz-fermi-cc-step-value">{s.value}</span>
              </div>
            ))}
          </div>
          {step >= 3 && (
            <div className="vz-fermi-cc-col-total demand">
              <span className="vz-fermi-cc-col-total-label">合計</span>
              <span className="vz-fermi-cc-col-total-value">≒ 1,230 億円</span>
            </div>
          )}
        </div>

        {/* 右：供給側 */}
        <div className="vz-fermi-cc-col right">
          <div className="vz-fermi-cc-col-head supply">
            <span className="vz-fermi-cc-col-tag">B：供給側から積む</span>
          </div>
          <div className="vz-fermi-cc-steps">
            {RIGHT_STEPS.map((s, i) => (
              <div
                key={`r-${i}`}
                className={`vz-fermi-cc-step${step >= 2 || i === 0 ? ' is-visible' : ''}`}
              >
                <span className="vz-fermi-cc-step-label">{s.label}</span>
                <span className="vz-fermi-cc-step-value">{s.value}</span>
              </div>
            ))}
          </div>
          {step >= 3 && (
            <div className="vz-fermi-cc-col-total supply">
              <span className="vz-fermi-cc-col-total-label">合計</span>
              <span className="vz-fermi-cc-col-total-value">≒ 1,530 億円</span>
            </div>
          )}
        </div>
      </div>

      {step >= 3 && (
        <div className="vz-fermi-cc-verdict" aria-live="polite">
          <div className="vz-fermi-cc-verdict-head">
            <span className="vz-fermi-cc-verdict-icon" aria-hidden>
              ✓
            </span>
            <span className="vz-fermi-cc-verdict-title">桁感は一致</span>
          </div>
          <div className="vz-fermi-cc-verdict-body">
            A ÷ B ≒ 0.8 倍。2 倍以内なら同じ桁。1,000 億円台で確定としてよい。
          </div>
        </div>
      )}

      {controls}

      {isLast && (
        <div className="vz-fermi-cc-hint">
          需要側と供給側の桁が大きくズレたら、どこかの前提を疑い直してください。
        </div>
      )}
    </div>
  )
}
