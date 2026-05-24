import { useStepReveal } from './hooks/useStepReveal'

/**
 * MVP 検証 4 ステップ — Key Assumption → KPI → 最小テスト → 判定基準
 * lesson-70 step.1 step.visual='MvpTestDesignDiagram'
 *
 * 4 段階で開示
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、💡 prefix 追加
 *   - CSS: vz-mvp-step-label 11→12
 *   - warm accent: vz-mvp-arrow ↓ を terracotta に
 *     (step 間を結ぶ順序矢印 = 1 visual 内 1 箇所、step-num の brand gradient は維持)
 */

type Step = {
  num: number
  label: string
  title: string
  body: string
}

const steps: Step[] = [
  {
    num: 1,
    label: 'Key Assumption',
    title: '一番危ない前提を選ぶ',
    body: '事業が成立する条件のうち、外れたら全部崩れる仮定を 1 つに絞る',
  },
  {
    num: 2,
    label: 'KPI',
    title: '何が見えれば真偽が分かるか',
    body: '前提を測れる単一の数値指標を決める（例：登録率・離脱率・LTV）',
  },
  {
    num: 3,
    label: 'Minimum Test',
    title: '最小コストで試す',
    body: '製品を作り込まずに検証する形式を選ぶ（LP、コンセプト動画、手動オペ）',
  },
  {
    num: 4,
    label: 'Go / No-Go',
    title: '判定基準を事前に決める',
    body: '「KPI が ◯◯ 以上なら進む」を実施前に確定。あとから動かさない',
  },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function MvpTestDesignVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: steps.length, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        MVP 検証 4 ステップ — 走り出す前にここまで決める
      </div>

      <div className="vz-mvp vz-stagger">
        {steps.slice(0, step).map((s, i) => (
          <div key={s.num}>
            <div className="vz-mvp-step">
              <div className="vz-mvp-step-num">{s.num}</div>
              <div className="vz-mvp-step-card">
                <span className="vz-mvp-step-label">{s.label}</span>
                <span className="vz-mvp-step-title">{s.title}</span>
                <span className="vz-mvp-step-body">{s.body}</span>
              </div>
            </div>
            {i < step - 1 && (
              <div className="vz-mvp-step">
                <div />
                <div className="vz-mvp-arrow">↓</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {controls}

      {isLast && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 判定基準を後決めにすると「もう少し続ければ…」で撤退できなくなる
        </div>
      )}
    </div>
  )
}
