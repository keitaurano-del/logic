import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { haptic } from '../platform/haptics'

interface CardProps extends HTMLAttributes<HTMLElement> {
  padding?: 'compact' | 'tight' | 'default'
  /** When true (or onClick provided), renders as a real <button> for a11y. */
  interactive?: boolean
  /** Required when interactive — what does this card do? */
  'aria-label'?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  children: ReactNode
}

/**
 * Container surface. When clickable, renders as a `<button>` so screen readers
 * announce it correctly and Enter/Space activate it. Adds light haptic on tap.
 */
export function Card({
  padding = 'default',
  interactive,
  className,
  onClick,
  children,
  ...rest
}: CardProps) {
  const isInteractive = interactive || typeof onClick === 'function'
  const classes = [
    'card',
    padding === 'compact' && 'card-compact',
    padding === 'tight' && 'card-tight',
    isInteractive && 'card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (isInteractive) {
    const { 'aria-label': ariaLabel, ...buttonRest } = rest as HTMLAttributes<HTMLElement> & { 'aria-label'?: string }
    return (
      <button
        type="button"
        className={classes}
        aria-label={ariaLabel}
        onClick={(e) => {
          haptic.light()
          onClick?.(e)
        }}
        {...(buttonRest as HTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  )
}
