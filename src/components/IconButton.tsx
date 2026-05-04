import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { haptic } from '../platform/haptics'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Required for screen readers — icon-only buttons must announce their action. */
  'aria-label': string
  /** Tints the icon with the M3 error color for destructive actions. */
  destructive?: boolean
  /** Skip the automatic light haptic on tap. */
  noHaptic?: boolean
}

/**
 * Square icon-only button (44pt iOS / 48dp Android via .icon-btn rule).
 * Adds light haptic on tap and a destructive variant.
 */
export function IconButton({
  className,
  children,
  destructive,
  noHaptic,
  type,
  onClick,
  ...rest
}: IconButtonProps) {
  const classes = ['icon-btn', destructive && 'icon-btn--destructive', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type={type ?? 'button'}
      className={classes}
      onClick={(e) => {
        if (!noHaptic && !rest.disabled) haptic.light()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
