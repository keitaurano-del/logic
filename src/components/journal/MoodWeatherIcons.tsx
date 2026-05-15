import type { Mood, Weather } from './types'

interface IconProps {
  size?: number
  color?: string
}

// ── Mood faces (1 = worst → 5 = best) ─────────────────────
export function MoodIcon({ mood, size = 24, color = 'currentColor' }: { mood: Mood } & IconProps) {
  const stroke = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (mood) {
    case 1:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <circle cx="9" cy="10" r="0.7" fill={color} stroke="none" />
          <circle cx="15" cy="10" r="0.7" fill={color} stroke="none" />
          <path d="M8 17 C 9.5 14.5, 14.5 14.5, 16 17" {...stroke} />
          <path d="M7 8 L10 9" {...stroke} />
          <path d="M17 8 L14 9" {...stroke} />
        </svg>
      )
    case 2:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <circle cx="9" cy="10" r="0.7" fill={color} stroke="none" />
          <circle cx="15" cy="10" r="0.7" fill={color} stroke="none" />
          <path d="M9 16 C 10.5 15, 13.5 15, 15 16" {...stroke} />
        </svg>
      )
    case 3:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <circle cx="9" cy="10" r="0.7" fill={color} stroke="none" />
          <circle cx="15" cy="10" r="0.7" fill={color} stroke="none" />
          <line x1="9" y1="16" x2="15" y2="16" {...stroke} />
        </svg>
      )
    case 4:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <circle cx="9" cy="10" r="0.7" fill={color} stroke="none" />
          <circle cx="15" cy="10" r="0.7" fill={color} stroke="none" />
          <path d="M8.5 14.5 C 10 17, 14 17, 15.5 14.5" {...stroke} />
        </svg>
      )
    case 5:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M8 9 C 8.6 8, 9.4 8, 10 9" {...stroke} />
          <path d="M14 9 C 14.6 8, 15.4 8, 16 9" {...stroke} />
          <path d="M7.5 13 C 9.5 17, 14.5 17, 16.5 13 Z" fill={color} stroke="none" />
        </svg>
      )
  }
}

// ── Weather icons ────────────────────────────────────────
export function WeatherIcon({ weather, size = 24, color = 'currentColor' }: { weather: Weather } & IconProps) {
  const stroke = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (weather) {
    case 'sunny':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" {...stroke} />
          <line x1="12" y1="2" x2="12" y2="5" {...stroke} />
          <line x1="12" y1="19" x2="12" y2="22" {...stroke} />
          <line x1="2" y1="12" x2="5" y2="12" {...stroke} />
          <line x1="19" y1="12" x2="22" y2="12" {...stroke} />
          <line x1="4.9" y1="4.9" x2="6.9" y2="6.9" {...stroke} />
          <line x1="17.1" y1="17.1" x2="19.1" y2="19.1" {...stroke} />
          <line x1="4.9" y1="19.1" x2="6.9" y2="17.1" {...stroke} />
          <line x1="17.1" y1="6.9" x2="19.1" y2="4.9" {...stroke} />
        </svg>
      )
    case 'cloudy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 18H7a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A4 4 0 0 1 17 18z" {...stroke} />
        </svg>
      )
    case 'rainy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 13H7a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A4 4 0 0 1 17 13z" {...stroke} />
          <line x1="9" y1="17" x2="8" y2="21" {...stroke} />
          <line x1="13" y1="17" x2="12" y2="21" {...stroke} />
          <line x1="17" y1="17" x2="16" y2="21" {...stroke} />
        </svg>
      )
    case 'snowy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 13H7a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A4 4 0 0 1 17 13z" {...stroke} />
          <circle cx="9" cy="18" r="0.8" fill={color} stroke="none" />
          <circle cx="13" cy="20" r="0.8" fill={color} stroke="none" />
          <circle cx="17" cy="18" r="0.8" fill={color} stroke="none" />
        </svg>
      )
  }
}

// ── Microphone icon ──────────────────────────────────────
export function MicIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )
}

// ── Sparkles icon (for AI summary CTA) ──────────────────
export function SparkleIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
    </svg>
  )
}
