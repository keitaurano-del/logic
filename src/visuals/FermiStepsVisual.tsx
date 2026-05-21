import './visuals-phase3c.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * フェルミ推定の 4 ステップ — 問い定義 → 分解 → 推定 → 統合検算
 * lesson-200 step.visual='FermiStepsDiagram'
 *
 * 構図: Stack（順序フロー）4 段、最終ステップ（統合検算）を結論カラーで強調
 * 段階開示: Step 1..4 — ステップを 1 つずつ表示
 */

type Step = {
  label: string
  title: string
  desc: string
}

const steps: Step[] = [
  {
    label: 'STEP 1',
    title: '問いを定義する',
    desc: '何を推定するのか、対象範囲・地域・期間まで一文で明確化する。',
  },
  {
    label: 'STEP 2',
    title: '要素に分解する',
    desc: '人口 × 利用率 × 頻度 × 単価 のように、計算できる掛け算式に落とす。',
  },
  {
    label: 'STEP 3',
    title: '各要素を推定する',
    desc: '既知の数字や妥当な仮定を置き、各因子に数値を当てはめる。',
  },
  {
    label: 'STEP 4',
    title: '統合して検算する',
    desc: '掛け合わせて答えを出し、桁感・常識感でズレていないか確かめる。',
  },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function FermiStepsVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: steps.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        フェルミ推定の 4 ステップ
      </div>

      <div className="vz-fs-stack">
        {steps.slice(0, step).map((s, i) => {
          const isFinal = i === steps.length - 1
          return (
            <div key={s.label}>
              <div className={`vz-fs-step${isFinal ? ' final' : ''}`}>
                <div className="vz-fs-num">{i + 1}</div>
                <div className="vz-fs-body">
                  <div className="vz-fs-label">{s.label}</div>
                  <div className="vz-fs-title">{s.title}</div>
                  <div className="vz-fs-desc">{s.desc}</div>
                </div>
              </div>
              {i < step - 1 ? <div className="vz-fs-arrow">↓</div> : null}
            </div>
          )
        })}
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
          💡 STEP 4 の検算がフェルミ推定の質を決める。一発回答で終わらせない。
        </div>
      )}
    </div>
  )
}
