import './visuals-phase3b.css'

/**
 * VRIO — 経営資源の競争優位を判定する 4 段チェック
 * Value / Rare / Inimitable / Organization の Yes/No フロー
 * lesson-325 等で利用
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - vz-vrio-verdict 13.5→14, vrio-q lineHeight 1.4→1.45
 *   - warm accent: 最後の O (Organization = 持続的優位の最終ゲート) の letter を terracotta
 *     （V/R/I は brand-soft、O だけ暖色 = 1 visual 内 1 箇所、verdict brand-cta は維持）
 */

type VrioStep = {
  letter: 'V' | 'R' | 'I' | 'O'
  name: string
  question: string
  yes: boolean
}

type Props = {
  sectionLabel?: string
  steps?: VrioStep[]
  verdict?: string
  hint?: string
}

const defaultSteps: VrioStep[] = [
  { letter: 'V', name: 'Value — 価値があるか',           question: '機会を活かす or 脅威を中和する資源か？', yes: true },
  { letter: 'R', name: 'Rare — 希少か',                  question: '保有している企業はごく少数か？',         yes: true },
  { letter: 'I', name: 'Inimitable — 模倣困難か',         question: '他社が真似するのに高コストがかかるか？', yes: true },
  { letter: 'O', name: 'Organization — 活用体制があるか', question: '組織として継続的に使い切れているか？',   yes: true },
]

export function VrioVisual({
  sectionLabel = 'VRIO 分析 — 4 段チェック',
  steps = defaultSteps,
  verdict = '4 つ全て Yes → 持続的な競争優位',
  hint = '💡 1 つでも No が出たところで止まる — 上から順に通すフロー',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-vrio">
        {steps.map((s) => (
          <div key={s.letter} className="vz-vrio-row">
            <div className="vz-vrio-letter">{s.letter}</div>
            <div className="vz-vrio-body">
              <span className="vz-vrio-name">{s.name}</span>
              <span className="vz-vrio-q">{s.question}</span>
            </div>
            <span className={`vz-vrio-check ${s.yes ? 'yes' : 'no'}`}>
              {s.yes ? 'Yes' : 'No'}
            </span>
          </div>
        ))}
      </div>

      <div className="vz-vrio-verdict">✓ {verdict}</div>

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
        {hint}
      </div>
    </div>
  )
}
