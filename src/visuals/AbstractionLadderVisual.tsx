import { useState } from 'react'

export type LadderRung = {
  label: string
  example: string
  note: string
}

const defaultRungs: LadderRung[] = [
  { label: '存在するもの',  example: '何もかも',           note: '何でも当てはまる。区別の役に立たない。' },
  { label: '生物',          example: '動植物すべて',       note: '生きてるもの全般。植物も微生物も含む。' },
  { label: '動物',          example: '犬・鳥・魚',         note: '動くいきもの。植物は除外。' },
  { label: '哺乳類',        example: '犬・猫・象',         note: '毛がある・乳で育つ。鳥や魚は除外。' },
  { label: '犬',            example: '柴・プードル',       note: '犬全般。猫や象は除外。' },
  { label: '柴犬',          example: '黒柴・赤柴',         note: '日本犬の一種。プードルは除外。' },
  { label: 'うちのポチ',    example: '世界に1匹',          note: '個体名。完全に具体。' },
]

type Props = {
  /** ラダーの段（上から抽象 → 下から具体）。省略時は default の「生物→ポチ」例。 */
  rungs?: LadderRung[]
  /** 初期インデックス。省略時は中央近く（哺乳類相当） */
  initialIdx?: number
  /** ノート見出し（「この階の特徴」） */
  noteLabel?: string
  /** 上方向ラベル */
  topDirectionLabel?: string
  /** 下方向ラベル */
  bottomDirectionLabel?: string
  /** 抽象化ボタンの label */
  abstractBtnLabel?: string
  /** 具体化ボタンの label */
  concreteBtnLabel?: string
}

/**
 * 抽象ラダー — 具体↔抽象を上下移動
 * lesson-68 step.visual='AbstractionLadderDiagram'
 * rungs を props で渡せば任意のスケール（抽象度、難易度、習熟度）でも使い回せる。
 */
export function AbstractionLadderVisual({
  rungs = defaultRungs,
  initialIdx,
  noteLabel = 'この階の特徴',
  topDirectionLabel = '↑ 抽象',
  bottomDirectionLabel = '↓ 具体',
  abstractBtnLabel = '↑ 抽象化',
  concreteBtnLabel = '↓ 具体化',
}: Props = {}) {
  const startIdx =
    typeof initialIdx === 'number'
      ? Math.max(0, Math.min(rungs.length - 1, initialIdx))
      : Math.min(3, rungs.length - 1)
  const [idx, setIdx] = useState(startIdx)
  const lastIdx = rungs.length - 1
  const abstractness = lastIdx === 0 ? 0 : ((lastIdx - idx) / lastIdx) * 100
  const pinPct = lastIdx === 0 ? 0 : (idx / lastIdx) * 100

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        抽象度 {Math.round(abstractness)}% — 上ほど抽象 / 下ほど具体
      </div>

      <div className="vz-ladder">
        <div className="vz-ladder-meter">
          <div className="vz-ladder-pin" style={{ top: `${pinPct}%` }}>
            {Math.round(abstractness)}%
          </div>
        </div>

        <div className="vz-ladder-rungs">
          <div className="vz-ladder-direction">{topDirectionLabel}</div>
          {rungs.map((r, i) => (
            <button
              key={`${r.label}-${i}`}
              className={`vz-ladder-rung ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
              aria-pressed={i === idx}
            >
              <span>{r.label}</span>
              <span className="ex">{r.example}</span>
            </button>
          ))}
          <div className="vz-ladder-direction">{bottomDirectionLabel}</div>
        </div>
      </div>

      <div className="vz-ladder-note">
        <div className="label">{noteLabel}</div>
        <div className="text">{rungs[idx].note}</div>
      </div>

      <div className="vz-ladder-controls">
        <button
          className="vz-ladder-btn"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          {abstractBtnLabel}
        </button>
        <button
          className="vz-ladder-btn primary"
          onClick={() => setIdx(Math.min(lastIdx, idx + 1))}
          disabled={idx === lastIdx}
        >
          {concreteBtnLabel}
        </button>
      </div>
    </div>
  )
}
