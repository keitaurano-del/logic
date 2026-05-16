// Rank illustrations — SVG-based stone progression.
// 2026-05-16: Switched from philosopher PNGs to stone-themed SVGs to match the new
// rank tiers (砂 → 金剛石). Self-contained so no asset pipeline needed.

import type { ReactElement } from 'react'

interface Props {
  level: number
  size?: number
}

type Stone = {
  bg: string         // background gradient (top → bottom)
  bgGlow?: string    // outer glow tint
  body: string       // main fill
  highlight: string  // top highlight
  shadow: string     // bottom shadow tone
  outline: string    // subtle border
  facets?: boolean   // draw faceted highlights for gem tiers
  shape: 'pebble' | 'crystal' | 'gem' | 'sphere'
}

const STONES: Stone[] = [
  // 1 砂 — sandy beige, grainy
  { bg: 'linear-gradient(135deg, #E8DDC8 0%, #B8A584 100%)', body: '#D4B98F', highlight: '#F1E3C4', shadow: '#8B7553', outline: '#7A6442', shape: 'pebble' },
  // 2 小石 — gray river pebble
  { bg: 'linear-gradient(135deg, #D8D8D8 0%, #7A7A7A 100%)', body: '#A8A8A8', highlight: '#E0E0E0', shadow: '#5C5C5C', outline: '#454545', shape: 'pebble' },
  // 3 燧石 — flint, warm gray with sparks
  { bg: 'linear-gradient(135deg, #B8A89A 0%, #5C4D40 100%)', body: '#7D6B5B', highlight: '#C9B8A6', shadow: '#3E3128', outline: '#2A1F18', shape: 'pebble' },
  // 4 黒曜石 — obsidian, jet black with sharp edges
  { bg: 'linear-gradient(135deg, #3A3F4E 0%, #0D0F18 100%)', body: '#1A1D29', highlight: '#52596B', shadow: '#050609', outline: '#000', shape: 'crystal', facets: true },
  // 5 水晶 — crystal, near-white violet hint
  { bg: 'linear-gradient(135deg, #E8EDF7 0%, #A0AEC8 100%)', bgGlow: 'rgba(180,200,255,.5)', body: '#CFD8E8', highlight: '#FFFFFF', shadow: '#7A88A0', outline: '#5A6680', shape: 'crystal', facets: true },
  // 6 瑪瑙 — agate, banded warm tones
  { bg: 'linear-gradient(135deg, #E8B894 0%, #8B4513 100%)', body: '#C97A4A', highlight: '#F5D5B5', shadow: '#5C2D0A', outline: '#3D1E07', shape: 'pebble' },
  // 7 翡翠 — jade green
  { bg: 'linear-gradient(135deg, #A8D8B0 0%, #2E6B4E 100%)', bgGlow: 'rgba(110,200,140,.55)', body: '#5BAD7F', highlight: '#C4E8CC', shadow: '#1F4A36', outline: '#143226', shape: 'gem', facets: true },
  // 8 琥珀 — amber, warm honey
  { bg: 'linear-gradient(135deg, #FFD89B 0%, #B8651A 100%)', bgGlow: 'rgba(255,180,80,.55)', body: '#E8A050', highlight: '#FFE8C0', shadow: '#7A3F0A', outline: '#5C2E05', shape: 'gem', facets: true },
  // 9 真珠 — pearl, iridescent off-white
  { bg: 'linear-gradient(135deg, #FBF6F0 0%, #C8B8D4 100%)', bgGlow: 'rgba(220,200,240,.65)', body: '#F0E6DC', highlight: '#FFFFFF', shadow: '#A89DB4', outline: '#7E6F8C', shape: 'sphere' },
  // 10 金剛石 — diamond, brilliant pale cyan
  { bg: 'linear-gradient(135deg, #DFF5FF 0%, #6FA8C8 100%)', bgGlow: 'rgba(150,230,255,.7)', body: '#B8E4F5', highlight: '#FFFFFF', shadow: '#4A7B96', outline: '#2E5870', shape: 'gem', facets: true },
]

export function RankIllustration({ level, size = 160 }: Props): ReactElement {
  const clamped = Math.min(Math.max(Math.floor(level), 1), 10)
  const s = STONES[clamped - 1]
  const id = `rank-${clamped}`
  const radius = size > 80 ? 24 : 14

  return (
    <div
      role="img"
      aria-label={`Rank ${clamped}`}
      style={{
        width: size,
        height: size,
        background: s.bg,
        borderRadius: radius,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: s.bgGlow ? `inset 0 0 ${Math.round(size * 0.25)}px ${s.bgGlow}` : 'none',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={Math.round(size * 0.7)}
        height={Math.round(size * 0.7)}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <defs>
          <radialGradient id={`${id}-body`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={s.highlight} />
            <stop offset="55%" stopColor={s.body} />
            <stop offset="100%" stopColor={s.shadow} />
          </radialGradient>
        </defs>

        {s.shape === 'pebble' && (
          <>
            <path
              d="M 18 56 Q 14 38 30 26 Q 48 14 68 22 Q 86 30 84 50 Q 82 70 64 78 Q 42 86 26 76 Q 18 70 18 56 Z"
              fill={`url(#${id}-body)`}
              stroke={s.outline}
              strokeWidth="1.2"
            />
            <ellipse cx="40" cy="36" rx="14" ry="6" fill={s.highlight} opacity="0.55" transform="rotate(-25 40 36)" />
            <ellipse cx="60" cy="68" rx="18" ry="5" fill={s.shadow} opacity="0.25" />
          </>
        )}

        {s.shape === 'crystal' && (
          <>
            <polygon
              points="50,8 78,38 70,86 30,86 22,38"
              fill={`url(#${id}-body)`}
              stroke={s.outline}
              strokeWidth="1.4"
            />
            <polygon points="50,8 78,38 50,42" fill={s.highlight} opacity="0.55" />
            <polygon points="50,8 22,38 50,42" fill={s.shadow} opacity="0.25" />
            {s.facets && (
              <>
                <line x1="50" y1="42" x2="50" y2="86" stroke={s.shadow} strokeWidth="0.8" opacity="0.5" />
                <line x1="22" y1="38" x2="50" y2="86" stroke={s.shadow} strokeWidth="0.6" opacity="0.4" />
                <line x1="78" y1="38" x2="50" y2="86" stroke={s.shadow} strokeWidth="0.6" opacity="0.4" />
              </>
            )}
          </>
        )}

        {s.shape === 'gem' && (
          <>
            <polygon
              points="50,12 82,36 72,80 28,80 18,36"
              fill={`url(#${id}-body)`}
              stroke={s.outline}
              strokeWidth="1.4"
            />
            <polygon points="50,12 82,36 50,40" fill={s.highlight} opacity="0.6" />
            <polygon points="50,12 18,36 50,40" fill={s.highlight} opacity="0.35" />
            <polygon points="18,36 28,80 50,40" fill={s.shadow} opacity="0.25" />
            <polygon points="82,36 72,80 50,40" fill={s.shadow} opacity="0.35" />
            {s.facets && (
              <>
                <line x1="50" y1="40" x2="50" y2="80" stroke={s.outline} strokeWidth="0.7" opacity="0.5" />
                <line x1="50" y1="40" x2="28" y2="80" stroke={s.outline} strokeWidth="0.5" opacity="0.4" />
                <line x1="50" y1="40" x2="72" y2="80" stroke={s.outline} strokeWidth="0.5" opacity="0.4" />
                <circle cx="40" cy="28" r="3" fill={s.highlight} opacity="0.9" />
              </>
            )}
          </>
        )}

        {s.shape === 'sphere' && (
          <>
            <circle cx="50" cy="50" r="36" fill={`url(#${id}-body)`} stroke={s.outline} strokeWidth="1.2" />
            <ellipse cx="38" cy="36" rx="12" ry="7" fill={s.highlight} opacity="0.85" />
            <ellipse cx="62" cy="68" rx="14" ry="5" fill={s.shadow} opacity="0.3" />
            <circle cx="42" cy="32" r="3" fill="#fff" opacity="0.9" />
          </>
        )}
      </svg>
    </div>
  )
}
