import './visuals-phase3b.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * Six Thinking Hats — Edward de Bono の 6 つの思考帽子
 * 同じ問題を 6 つの異なる視点で順に眺める発想法
 * lesson-60 step.2 等で利用
 */

type Hat = {
  color: 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue'
  name: string
  desc: string
}

type Props = {
  sectionLabel?: string
  hats?: Hat[]
  hint?: string
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

const defaultHats: Hat[] = [
  { color: 'white',  name: 'White',  desc: '事実・データ' },
  { color: 'red',    name: 'Red',    desc: '感情・直感' },
  { color: 'black',  name: 'Black',  desc: 'リスク・批判' },
  { color: 'yellow', name: 'Yellow', desc: '楽観・利点' },
  { color: 'green',  name: 'Green',  desc: '創造・新案' },
  { color: 'blue',   name: 'Blue',   desc: '進行・整理' },
]

export function SixHatsVisual({
  sectionLabel = '6 つの思考帽子',
  hats = defaultHats,
  hint = '💡 帽子を意識的に「かぶり替える」と、議論の重複や偏りを避けられる',
  revealMode = 'interactive',
}: Props = {}) {
  const { step, controls } = useStepReveal({ totalSteps: hats.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-six-hats">
        {hats.slice(0, step).map((h) => (
          <div key={h.color} className="vz-hat">
            <div className={`vz-hat-icon ${h.color}`} aria-hidden="true" />
            <div className="vz-hat-name">{h.name}</div>
            <div className="vz-hat-desc">{h.desc}</div>
          </div>
        ))}
      </div>

      {controls}

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
