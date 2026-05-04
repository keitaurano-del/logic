import type { HTMLAttributes, ReactNode } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  /** Mark this badge as a status indicator so screen readers pick up changes. */
  live?: boolean
  children: ReactNode
}

export function Badge({ variant = 'default', live, className, children, ...rest }: BadgeProps) {
  const classes = ['badge', variant !== 'default' && `badge-${variant}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <span
      className={classes}
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
      {...rest}
    >
      {children}
    </span>
  )
}
