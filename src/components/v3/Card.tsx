import type { ReactNode, CSSProperties } from 'react'
import { v3 } from '../../styles/tokensV3'

interface CardProps {
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
  variant?: 'default' | 'elevated'
}

export function Card({ children, onClick, style, variant = 'default' }: CardProps) {
  const bg = variant === 'elevated' ? v3.color.card2 : v3.color.card
  const baseStyle: CSSProperties = {
    background: bg,
    borderRadius: v3.radius.card,
    padding: v3.spacing.padding,
    boxShadow: v3.shadow.card,
    transition: v3.motion.tap,
    ...style,
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(.98)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = '')}
        style={{ ...baseStyle, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%', font: 'inherit', color: 'inherit' }}
      >
        {children}
      </button>
    )
  }
  return <div style={baseStyle}>{children}</div>
}

interface HeroCardProps {
  imageSrc: string
  children: ReactNode
  onClick?: () => void
  imageHeight?: number
}

export function HeroCard({ imageSrc, children, onClick, imageHeight = 160 }: HeroCardProps) {
  const baseStyle: CSSProperties = {
    background: `linear-gradient(140deg, ${v3.color.card2} 0%, ${v3.color.card} 100%)`,
    borderRadius: v3.radius.card,
    overflow: 'hidden',
    boxShadow: v3.shadow.hero,
    transition: v3.motion.tap,
  }
  const inner = (
    <>
      <div style={{ height: imageHeight, position: 'relative', overflow: 'hidden' }}>
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '18px 20px 20px' }}>{children}</div>
    </>
  )
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(.98)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = '')}
        style={{ ...baseStyle, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%', padding: 0, font: 'inherit', color: 'inherit' }}
      >
        {inner}
      </button>
    )
  }
  return <div style={baseStyle}>{inner}</div>
}
