import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

type Props = {
  label: string
  value?: string
  color?: 'brand' | 'accent' | 'sticky' | 'ink'
  delay?: number
  style?: CSSProperties
}

const colors = {
  brand: { bg: 'var(--brand-soft)', border: 'var(--brand)', text: 'var(--brand)' },
  accent: { bg: '#FDEEE9', border: 'var(--accent)', text: 'var(--accent)' },
  sticky: { bg: 'var(--sticky)', border: 'var(--sticky-shadow)', text: 'var(--ink)' },
  ink: { bg: 'var(--paper)', border: 'var(--ink)', text: 'var(--ink)' },
}

export function TreeNode({ label, value, color = 'brand', delay = 0, style }: Props) {
  const c = colors[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, type: 'spring', stiffness: 220 }}
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 12,
        padding: '8px 12px',
        fontFamily: 'var(--font-jp)',
        fontSize: 12,
        fontWeight: 700,
        color: c.text,
        textAlign: 'center',
        boxShadow: '2px 2px 0 rgba(31,42,68,0.18)',
        minWidth: 70,
        ...style,
      }}
    >
      <div style={{ fontSize: 12 }}>{label}</div>
      {value && (
        <div style={{ fontFamily: 'var(--font-en)', fontSize: 18, marginTop: 2, color: c.text }}>
          {value}
        </div>
      )}
    </motion.div>
  )
}
