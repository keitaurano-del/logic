import type { HTMLAttributes, ReactNode } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

export function Badge({ variant = 'default', className, children, ...rest }: BadgeProps) {
  const classes = [
    'badge',
    variant !== 'default' && `badge-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
