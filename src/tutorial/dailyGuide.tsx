import { useEffect, useState } from 'react'
import { tutorial } from './tutorialStorage'

/**
 * 今日の1問（デイリーフェルミ）インラインガイド
 * 初回のみ各要素にパルスアニメ＋ラベルを表示。入力開始で全消え。
 */

const pulseKeyframes = `
@keyframes tut-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
`

export function useDailyGuide() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!tutorial.hasSeenDaily()) {
      const t = setTimeout(() => setActive(true), 500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    setActive(false)
    tutorial.markDaily()
  }

  return { active, dismiss }
}

interface LabelProps {
  text: string
  position?: 'top' | 'bottom'
}

export function GuideLabel({ text, position = 'bottom' }: LabelProps) {
  return (
    <div style={{
      position: 'absolute',
      [position === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 8px)',
      left: '50%', transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      background: '#0f1523',
      color: '#fff', fontSize: 12, fontWeight: 600,
      padding: '6px 12px', borderRadius: 8,
      border: '1px solid rgba(107,133,214,0.5)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
      pointerEvents: 'none',
      zIndex: 100,
    }}>
      {text}
    </div>
  )
}

export function GuideStyle() {
  return <style>{pulseKeyframes}</style>
}

/** パルスアニメ用ラッパー */
export function PulseWrapper({ children, label, labelPosition }: {
  children: React.ReactNode
  label: string
  labelPosition?: 'top' | 'bottom'
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', animation: 'tut-pulse 1.2s ease 2' }}>
      {children}
      <GuideLabel text={label} position={labelPosition} />
    </div>
  )
}
