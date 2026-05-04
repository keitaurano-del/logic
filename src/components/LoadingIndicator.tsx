import { isIOS } from '../platform'
import './LoadingIndicator.css'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

/**
 * Platform-aware loading spinner.
 * - iOS: 8-segment fade spinner (UIActivityIndicatorView 風)
 * - Android: M3 indeterminate circular progress (4dp arc)
 */
export function LoadingIndicator({ size = 'md', label, className }: LoadingIndicatorProps) {
  const ios = isIOS()
  return (
    <div
      className={['m3-loading', `m3-loading--${size}`, className].filter(Boolean).join(' ')}
      role="status"
      aria-label={label ?? '読み込み中'}
    >
      {ios ? <IosSpinner /> : <MaterialSpinner />}
      {label && <span className="m3-loading__label">{label}</span>}
    </div>
  )
}

function IosSpinner() {
  return (
    <span className="m3-loading__ios" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="m3-loading__ios-bar" style={{ transform: `rotate(${i * 45}deg)` }} />
      ))}
    </span>
  )
}

function MaterialSpinner() {
  return (
    <svg className="m3-loading__md" viewBox="0 0 50 50" aria-hidden="true">
      <circle className="m3-loading__md-track" cx="25" cy="25" r="20" />
      <circle className="m3-loading__md-arc" cx="25" cy="25" r="20" />
    </svg>
  )
}
