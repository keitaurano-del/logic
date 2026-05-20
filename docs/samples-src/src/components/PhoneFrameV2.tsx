import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  time?: string
}

export function PhoneFrameV2({ children, time = '9:41' }: Props) {
  return (
    <div className="v2-phone">
      <div className="v2-phone-notch" />
      <div className="v2-statusbar">
        <span>{time}</span>
        <span className="right">
          <span>●●●●●</span>
          <span>📶</span>
          <span>🔋</span>
        </span>
      </div>
      <div className="v2-phone-body">{children}</div>
    </div>
  )
}
