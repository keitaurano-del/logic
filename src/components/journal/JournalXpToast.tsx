import { useEffect, useState } from 'react'
import { haptic } from '../../platform/haptics'

interface JournalXpToastProps {
  xp: number
  label: string
  onDone: () => void
}

function useCountUp(target: number, duration = 700, delay = 200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const tt = Math.min((Date.now() - start) / duration, 1)
        const ease = tt < 0.5 ? 2 * tt * tt : -1 + (4 - 2 * tt) * tt
        setVal(Math.round(ease * target))
        if (tt < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return val
}

function RingProgress({ progress, size = 110, stroke = 8 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <defs>
        <linearGradient id="journal-xp-ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5FA898" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--brand) 12%, transparent)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#journal-xp-ring)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  )
}

export function JournalXpToast({ xp, label, onDone }: JournalXpToastProps) {
  const count = useCountUp(xp, 700, 200)
  const ringProgress = xp > 0 ? count / xp : 0

  useEffect(() => {
    haptic.success()
    const t = setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="journal-xp-toast"
      role="status"
      aria-live="polite"
      aria-label={`+${xp} XP ${label}`}
    >
      <div className="journal-xp-toast__ring">
        <RingProgress progress={ringProgress} />
        <div className="journal-xp-toast__center">
          <span className="journal-xp-toast__amount">+{count}</span>
          <span className="journal-xp-toast__unit">XP</span>
        </div>
      </div>
      <div className="journal-xp-toast__label">{label}</div>
    </div>
  )
}
