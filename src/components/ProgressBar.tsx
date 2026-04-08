interface ProgressBarProps {
  value: number // 0-100
  max?: number
  large?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, large, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`progress${large ? ' progress-lg' : ''}${className ? ' ' + className : ''}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
