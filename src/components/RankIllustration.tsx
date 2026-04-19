// Rank illustrations — AI-generated stylish flat design characters
// 10 levels: 哲学の卵 → ロゴスの神
// PNG images in /ranks/ directory

import type { ReactElement } from 'react'

interface Props {
  level: number
  size?: number
}

export function RankIllustration({ level, size = 160 }: Props): ReactElement {
  const clamped = Math.min(Math.max(Math.floor(level), 1), 10)
  return (
    <img
      src={`/ranks/rank-${clamped}.png`}
      alt={`Rank ${clamped}`}
      width={size}
      height={size}
      style={{
        display: 'block',
        flexShrink: 0,
        borderRadius: size > 80 ? 24 : 14,
        objectFit: 'cover',
      }}
    />
  )
}
