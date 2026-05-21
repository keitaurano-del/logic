import './visuals-phase3c.css'

/**
 * 暗算ワザの早見表 — 数字パターンから適切な技を選ぶフローチャート
 * lesson-400 step.9 visual='MentalMathDecisionTreeDiagram'
 *
 * 構図: ルート 1 → 第 1 階層 3 分岐（×100 系 / 近似 / 分解）
 */

type Branch = {
  cond: string
  tech: string
  example: string
}

const branches: Branch[] = [
  {
    cond: '×10 / ×100 系',
    tech: '桁ずらし',
    example: '47 × 100 = 4,700（ゼロ追加だけ）',
  },
  {
    cond: '近い切りの良い数字',
    tech: '近似 + 補正',
    example: '98 × 7 ≒ 100 × 7 − 2 × 7 = 686',
  },
  {
    cond: '2 桁同士の積',
    tech: '分配で分解',
    example: '23 × 12 = 23 × 10 + 23 × 2 = 276',
  },
]

export function MentalMathDecisionTreeVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        暗算ワザの使い分け早見表
      </div>

      <div className="vz-mmd-wrap">
        <div className="vz-mmd-root">
          数字を見たら、まず形を判別する
        </div>

        <div className="vz-mmd-row-label">↓ パターン別の最適な技</div>

        <div className="vz-mmd-branch three">
          {branches.map((b) => (
            <div key={b.cond} className="vz-mmd-node">
              <div className="vz-mmd-cond">{b.cond}</div>
              <div className="vz-mmd-tech">{b.tech}</div>
              <div className="vz-mmd-ex">{b.example}</div>
            </div>
          ))}
        </div>
      </div>

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
        💡 最初に形を判別する習慣をつけると、計算速度が一段上がる
      </div>
    </div>
  )
}
