import type { ReactNode } from 'react'

interface EyebrowProps {
  accent?: boolean
  children: ReactNode
}

export function Eyebrow({ accent, children }: EyebrowProps) {
  return <div className={`eyebrow${accent ? ' accent' : ''}`}>{children}</div>
}
