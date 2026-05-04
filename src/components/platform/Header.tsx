import type { ReactNode } from 'react'
import { isIOS } from '../../platform'
import { haptic } from '../../platform/haptics'
import './Header.css'

export interface HeaderProps {
  title?: string
  largeTitle?: boolean
  onBack?: () => void
  trailing?: ReactNode
}

/**
 * Platform-aware app bar / navigation header.
 *
 * - iOS: 44pt high, centered title, chevron.left back icon (1.5 stroke) with
 *   optional "戻る" label.
 * - Android: 64dp high, left-aligned title, arrow_back icon (2 stroke).
 *
 * Always pads under the status bar via env(safe-area-inset-top).
 */
export function Header({ title, largeTitle, onBack, trailing }: HeaderProps) {
  const ios = isIOS()
  return (
    <header
      className={[
        'pf-header',
        ios ? 'pf-header--ios' : 'pf-header--android',
        largeTitle && ios ? 'pf-header--lg' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="pf-header__row">
        {onBack ? (
          <button
            type="button"
            className="pf-header__back"
            onClick={() => { haptic.light(); onBack() }}
            aria-label="戻る"
          >
            {ios ? <ChevronLeftIcon /> : <ArrowLeftIcon />}
            {ios && <span className="pf-header__back-label">戻る</span>}
          </button>
        ) : (
          <span className="pf-header__back pf-header__back--placeholder" aria-hidden="true" />
        )}
        <h1 className="pf-header__title">{title}</h1>
        <div className="pf-header__trailing">{trailing}</div>
      </div>
      {largeTitle && ios && (
        <h2 className="pf-header__large-title">{title}</h2>
      )}
    </header>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="20" y1="12" x2="4" y2="12" />
      <polyline points="11 19 4 12 11 5" />
    </svg>
  )
}
