import { useState } from 'react'

type Rung = { label: string; example: string; note: string }

const rungs: Rung[] = [
  { label: '存在するもの',  example: '何もかも',           note: '何でも当てはまる。区別の役に立たない。' },
  { label: '生物',          example: '動植物すべて',       note: '生きてるもの全般。植物も微生物も含む。' },
  { label: '動物',          example: '犬・鳥・魚',         note: '動くいきもの。植物は除外。' },
  { label: '哺乳類',        example: '犬・猫・象',         note: '毛がある・乳で育つ。鳥や魚は除外。' },
  { label: '犬',            example: '柴・プードル',       note: '犬全般。猫や象は除外。' },
  { label: '柴犬',          example: '黒柴・赤柴',         note: '日本犬の一種。プードルは除外。' },
  { label: 'うちのポチ',    example: '世界に1匹',          note: '個体名。完全に具体。' },
]

/**
 * 抽象ラダー — 具体↔抽象を上下移動
 * lesson-68 step.visual='AbstractionLadderDiagram'
 */
export function AbstractionLadderVisual() {
  const [idx, setIdx] = useState(3) // 哺乳類 から始める
  const abstractness = ((rungs.length - 1 - idx) / (rungs.length - 1)) * 100

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        抽象度 {Math.round(abstractness)}% — 上ほど抽象 / 下ほど具体
      </div>

      <div className="vz-ladder">
        <div className="vz-ladder-meter">
          <div className="vz-ladder-pin" style={{ top: `${(idx / (rungs.length - 1)) * 100}%` }}>
            {Math.round(abstractness)}%
          </div>
        </div>

        <div className="vz-ladder-rungs">
          <div className="vz-ladder-direction">↑ 抽象</div>
          {rungs.map((r, i) => (
            <button
              key={r.label}
              className={`vz-ladder-rung ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            >
              <span>{r.label}</span>
              <span className="ex">{r.example}</span>
            </button>
          ))}
          <div className="vz-ladder-direction">↓ 具体</div>
        </div>
      </div>

      <div className="vz-ladder-note">
        <div className="label">この階の特徴</div>
        <div className="text">{rungs[idx].note}</div>
      </div>

      <div className="vz-ladder-controls">
        <button
          className="vz-ladder-btn"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          ↑ 抽象化
        </button>
        <button
          className="vz-ladder-btn primary"
          onClick={() => setIdx(Math.min(rungs.length - 1, idx + 1))}
          disabled={idx === rungs.length - 1}
        >
          ↓ 具体化
        </button>
      </div>
    </div>
  )
}
