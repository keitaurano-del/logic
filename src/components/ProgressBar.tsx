interface ProgressBarProps {
  /** 0..max. Ignored when `indeterminate` is true. */
  value?: number
  max?: number
  large?: boolean
  /** Renders an indeterminate (looping) progress bar. */
  indeterminate?: boolean
  /** Optional human-readable label, surfaced to assistive tech. */
  label?: string
  className?: string
}

/**
 * Linear progress bar. Supports both determinate (value/max) and indeterminate
 * modes and exposes the standard ARIA progressbar role for screen readers.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  large,
  indeterminate,
  label,
  className,
}: ProgressBarProps) {
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      className={[
        'progress',
        large && 'progress-lg',
        indeterminate && 'progress--indeterminate',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="progress-fill" style={indeterminate ? undefined : { width: `${pct}%` }} />
    </div>
  )
}
