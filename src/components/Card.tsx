import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'compact' | 'tight' | 'default'
  children: ReactNode
}

export function Card({ padding = 'default', className, children, ...rest }: CardProps) {
  const classes = [
    'card',
    padding === 'compact' && 'card-compact',
    padding === 'tight' && 'card-tight',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
