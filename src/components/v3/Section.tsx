import type { ReactNode } from 'react'
import { v3 } from '../../styles/tokensV3'

export function Section({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>{children}</div>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: v3.color.text2,
        padding: '8px 4px 0',
        marginBottom: -6,
      }}
    >
      {children}
    </div>
  )
}
