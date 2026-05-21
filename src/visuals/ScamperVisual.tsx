import './visuals-phase3b.css'

/**
 * SCAMPER — 既存のものを変換する 7 視点のチェックリスト
 * Substitute / Combine / Adapt / Modify / Put to other use / Eliminate / Reverse
 * lesson-60 step.1 等で利用
 */

type ScamperItem = {
  letter: string
  name: string
  desc: string
}

type Props = {
  sectionLabel?: string
  items?: ScamperItem[]
  hint?: string
}

const defaultItems: ScamperItem[] = [
  { letter: 'S', name: 'Substitute — 置き換える',     desc: '材料・人・場所・方法を別のものに替える' },
  { letter: 'C', name: 'Combine — 組み合わせる',       desc: '別々の機能や対象を 1 つにまとめる' },
  { letter: 'A', name: 'Adapt — 応用する',             desc: '別領域の解決策を持ち込んで適用する' },
  { letter: 'M', name: 'Modify — 変形する',            desc: 'サイズ・形・色・頻度などを変える' },
  { letter: 'P', name: 'Put to other use — 転用する',  desc: '本来の用途とは別の使い道を探す' },
  { letter: 'E', name: 'Eliminate — そぎ落とす',       desc: '不要な要素・工程・機能を削る' },
  { letter: 'R', name: 'Reverse — 逆転する',           desc: '順序・役割・前提を逆にしてみる' },
]

export function ScamperVisual({
  sectionLabel = 'SCAMPER — 発想の 7 視点',
  items = defaultItems,
  hint = '💡 1 個ずつ機械的に当てはめると、視点漏れがなくなる',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-scamper">
        {items.map((item) => (
          <div key={item.letter} className="vz-scamper-row">
            <div className="vz-scamper-letter">{item.letter}</div>
            <div className="vz-scamper-body">
              <span className="vz-scamper-name">{item.name}</span>
              <span className="vz-scamper-desc">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

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
