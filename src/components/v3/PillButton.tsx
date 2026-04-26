import type { ReactNode, CSSProperties } from 'react'
import { v3 } from '../../styles/tokensV3'

interface PillButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  style?: CSSProperties
  fullWidth?: boolean
}

export function PillButton({ children, onClick, variant = 'primary', style, fullWidth }: PillButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      style={{
        background: isPrimary ? v3.color.accent : 'transparent',
        color: isPrimary ? v3.color.bg : v3.color.text,
        border: isPrimary ? 'none' : `1px solid ${v3.color.card}`,
        borderRadius: v3.radius.pill,
        padding: '13px 18px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: isPrimary ? v3.shadow.cta : 'none',
        transition: v3.motion.tap,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontFamily: "'Noto Sans JP', sans-serif",
        ...style,
      }}
    >
      {children}
    </button>
  )
}
