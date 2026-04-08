import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  'aria-label': string
}

export function IconButton({ className, children, ...rest }: IconButtonProps) {
  return (
    <button className={`icon-btn${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </button>
  )
}
