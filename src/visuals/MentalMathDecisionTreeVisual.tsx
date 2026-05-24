import './visuals-phase3c.css'

/**
 * 暗算ワザの早見表 — 数字パターンから適切な技を選ぶフローチャート
 * lesson-400 step.9 visual='MentalMathDecisionTreeDiagram'
 *
 * 構図: ルート 1 → 第 1 階層 3 分岐（×100 系 / 近似 / 分解）
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: mmd-cond 12px / mmd-tech 14px / mmd-ex 12px / mmd-root 14px は既に底上げ済
 *   - warm accent: vz-mmd-row-label ↓ を terracotta deep に格上げ
 *     (ルート → 3 分岐を結ぶ「判別の動き」 = 1 visual 内 1 箇所)
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
        marginTop: 14,
        padding: '10px 12px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        💡 最初に形を判別する習慣をつけると、計算速度が一段上がる
      </div>
    </div>
  )
}
