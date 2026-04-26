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
  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        borderRadius: v3.radius.card,
        padding: v3.spacing.padding,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: v3.shadow.card,
        transition: v3.motion.tap,
        ...style,
      }}
      onTouchStart={onClick ? (e) => (e.currentTarget.style.transform = 'scale(.98)') : undefined}
      onTouchEnd={onClick ? (e) => (e.currentTarget.style.transform = '') : undefined}
    >
      {children}
    </div>
  )
}

interface HeroCardProps {
  imageSrc: string
  children: ReactNode
  onClick?: () => void
  imageHeight?: number
}

export function HeroCard({ imageSrc, children, onClick, imageHeight = 160 }: HeroCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(140deg, #1A3A39 0%, #2C5856 100%)',
        borderRadius: v3.radius.card,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: v3.shadow.hero,
        transition: v3.motion.tap,
      }}
      onTouchStart={onClick ? (e) => (e.currentTarget.style.transform = 'scale(.98)') : undefined}
      onTouchEnd={onClick ? (e) => (e.currentTarget.style.transform = '') : undefined}
    >
      <div style={{ height: imageHeight, position: 'relative', overflow: 'hidden' }}>
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '18px 20px 20px' }}>{children}</div>
    </div>
  )
}
