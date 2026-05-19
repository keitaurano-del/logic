import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function PhoneFrame({ children }: Props) {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-body">{children}</div>
    </div>
  )
}
