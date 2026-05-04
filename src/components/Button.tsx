import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { haptic } from '../platform/haptics'

type Variant = 'default' | 'primary' | 'ghost' | 'dark' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  /** Skip the automatic light haptic on tap. */
  noHaptic?: boolean
  children: ReactNode
}

/**
 * Primary action button. Layout / colors are controlled by `.btn` /
 * `.btn-{variant}` rules in primitives.css. The component adds:
 *   - Light haptic feedback on click (suppressible via `noHaptic`).
 *   - `type="button"` default to prevent accidental form submits.
 */
export function Button({
  variant = 'default',
  size = 'md',
  block,
  noHaptic,
  className,
  type,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    variant !== 'default' && `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    block && 'btn-block',
    className,
  ]
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
