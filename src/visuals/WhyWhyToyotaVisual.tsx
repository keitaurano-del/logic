import './visuals-whywhy.css'

type ToyotaLayer = {
  q: string
  a: string
  isRoot?: boolean
}

const layers: ToyotaLayer[] = [
  { q: 'なぜ機械が止まった？',    a: 'ヒューズが切れた' },
  { q: 'なぜヒューズが？',        a: '過負荷がかかった' },
  { q: 'なぜ過負荷が？',          a: 'ベアリング潤滑が不足' },
  { q: 'なぜ潤滑が？',            a: 'ポンプ汲み上げ不足' },
  { q: 'なぜ汲み上げ不足？',      a: 'ポンプ軸が摩耗' },
  { q: 'なぜ摩耗した？',          a: 'ストレーナ未装着で金属粉混入', isRoot: true },
]

/**
 * トヨタ古典事例 — 「機械が止まった」5回 Why
 * lesson-341 step.visual='WhyWhyToyotaDiagram'
 */
export function WhyWhyToyotaVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        古典事例「機械が止まった」
      </div>

      <div className="vz-ww-toyota">
        {layers.map((l, i) => (
          <div key={i} className={`vz-ww-toyota-row ${l.isRoot ? 'root' : ''}`}>
            <div className="vz-ww-toyota-q">{l.q}</div>
            <div className="vz-ww-toyota-arrow">→</div>
            <div className="vz-ww-toyota-a">{l.a}</div>
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
        💡 真の対策は「ストレーナを取り付ける」（ヒューズ交換では再発する）
      </div>
    </div>
  )
}
