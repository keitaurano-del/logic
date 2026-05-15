import type { Mood, Weather } from './types'

interface IconProps {
  size?: number
}

// ── Mood faces (1 = worst → 5 = best) ─────────────────────
// ジャーナル UI のみ絵文字使用 OK の方針（CLAUDE.md feedback_journal_emoji 参照）。
const MOOD_EMOJI: Record<Mood, string> = {
  1: '😢',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export function MoodIcon({ mood, size = 24 }: { mood: Mood } & IconProps) {
  return (
    <span
      className="journal-emoji-icon"
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {MOOD_EMOJI[mood]}
    </span>
  )
}

// ── Weather icons ────────────────────────────────────────
const WEATHER_EMOJI: Record<Weather, string> = {
  sunny:  '☀️',
  cloudy: '☁️',
  rainy:  '🌧️',
  snowy:  '❄️',
}

export function WeatherIcon({ weather, size = 24 }: { weather: Weather } & IconProps) {
  return (
    <span
      className="journal-emoji-icon"
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {WEATHER_EMOJI[weather]}
    </span>
  )
}

// ── Microphone icon ──────────────────────────────────────
export function MicIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )
}

// ── Sparkles icon (for AI summary CTA) ──────────────────
export function SparkleIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
    </svg>
  )
}
