import { useStepReveal } from './hooks/useStepReveal'

/**
 * ケーススタディ — 段階開示フェーズパネル
 * lesson-24 step.visual='CaseStudyDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、success-soft / success-deep token 化
 *   - vz-phase-title 15→16, vz-phase-body 13.5→14
 *   - warm accent: 最終 PHASE 4 (.vz-phase:last-child) の左ボーダー 4px を terracotta
 *     （打ち手 = 検証を経て初めて出る動きの起点 = 1 visual 内 1 箇所）
 *
 * 4 段階で開示
 */
const phases = [
  { label: 'PHASE 1', title: '情報を集める', body: '事実・データ・観察を MECE に整理する。憶測を入れない。' },
  { label: 'PHASE 2', title: '仮説を立てる', body: '集めた情報から複数の解釈を提示。「もしかしたら」を口に出す。' },
  { label: 'PHASE 3', title: '検証する', body: '仮説を支持／反証するデータをさらに集める。証拠が出るまで結論を保留。' },
  { label: 'PHASE 4', title: '打ち手を出す', body: '検証済みの仮説をもとに、具体的なアクションに落とす。' },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

export function CaseStudyVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: phases.length, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        ケース思考の4フェーズ
      </div>
      <div className="vz-phase-stack vz-stagger">
        {phases.slice(0, step).map((p, i) => (
          <div key={i} className="vz-phase">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="vz-phase-icon">{i + 1}</span>
              <span className="vz-phase-label">{p.label}</span>
            </div>
            <div className="vz-phase-title">{p.title}</div>
            <div className="vz-phase-body">{p.body}</div>
          </div>
        ))}
      </div>

      {controls}

      {isLast && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--success-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--success-deep)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 焦って 1 → 4 に飛ばないこと。中間を省くほど結論がブレる
        </div>
      )}
    </div>
  )
}
