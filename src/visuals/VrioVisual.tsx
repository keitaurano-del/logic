import './visuals-phase3b.css'

/**
 * VRIO — 経営資源の競争優位を判定する 4 段チェック
 * Value / Rare / Inimitable / Organization の Yes/No フロー
 * lesson-325 等で利用
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
        {hint}
      </div>
    </div>
  )
}
