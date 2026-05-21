import { Fragment } from 'react'
import './visuals-phase2.css'

/**
 * フェルミ推定 — 市場規模公式の図解（人口 × 利用率 × 頻度 × 単価）
 * lesson-201, lesson-202, lesson-203, lesson-89 で流用
 * 想定 visualId: 'FermiFormulaDiagram'
 *
 * default: lesson-201 step.0「ファミレス市場規模」
 */

export type FermiFactor = {
  /** カテゴリ名 (例: 「対象人口」) */
  label: string
  /** 想定値 (例: 「8,000万人」) */
  value: string
  /** 補足単位 (例: 「人」「%」「回/年」) */
  unit?: string
}

export type FermiResult = {
  label: string
  value: string
  unit?: string
}

export type FermiFormulaProps = {
  sectionLabel?: string
  factors?: FermiFactor[]
  result?: FermiResult
  hint?: string
}

const DEFAULT_PROPS: Required<FermiFormulaProps> = {
  sectionLabel: '市場規模の公式 — ファミレス市場',
  factors: [
    { label: '対象人口', value: '8,000', unit: '万人' },
    { label: '利用率', value: '60', unit: '%' },
    { label: '頻度', value: '12', unit: '回/年' },
    { label: '単価', value: '1,500', unit: '円' },
  ],
  result: { label: '推定市場規模', value: '8.6', unit: '兆円 / 年' },
  hint: '4 要素に分解できれば、初見の市場でも桁感を外さず推定できる',
}

export function FermiFormulaVisual(props: FermiFormulaProps = {}) {
  const { sectionLabel, factors, result, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>{sectionLabel}</div>

      <div className="vz-ff-formula">
        {factors.map((f, i) => (
          <Fragment key={i}>
            <div className="vz-ff-factor">
              <span className="label">{f.label}</span>
              <span className="value">{f.value}</span>
              {f.unit ? <span className="unit">{f.unit}</span> : null}
            </div>
            {i < factors.length - 1 ? (
              <div className="vz-ff-times">×</div>
            ) : null}
          </Fragment>
        ))}
      </div>

      <div className="vz-ff-equals">
        <span className="symbol">=</span>
      </div>

      <div className="vz-ff-result">
        <span className="label">{result.label}</span>
        <span className="value">{result.value}</span>
        {result.unit ? <span className="unit">{result.unit}</span> : null}
      </div>

      {hint ? (
        <div style={{
          marginTop: 12,
          padding: '8px 10px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
        }}>
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
