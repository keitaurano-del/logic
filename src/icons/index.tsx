// Logic v3 — lucide-style inline SVG icons (no runtime dep)
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ArrowLeftIcon(p: IconProps) {
  return (
    <svg {...base} strokeWidth={2.5} {...p}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...base} strokeWidth={2.5} {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base} strokeWidth={3} {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function FlameIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

export function StarIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function TrophyIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function BrainIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 4 17.5a2.5 2.5 0 0 1-1.98-2.86A2.5 2.5 0 0 1 2 12a2.5 2.5 0 0 1 .02-2.64A2.5 2.5 0 0 1 4 6.5a2.5 2.5 0 0 1 3.04-2.44A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 20 17.5a2.5 2.5 0 0 0 1.98-2.86A2.5 2.5 0 0 0 22 12a2.5 2.5 0 0 0-.02-2.64A2.5 2.5 0 0 0 20 6.5a2.5 2.5 0 0 0-3.04-2.44A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  )
}

export function BarChartIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

export function ClipboardListIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}

export function SparklesIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z" />
    </svg>
  )
}

export function BookOpenIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <line x1="12" y1="7" x2="12" y2="17" />
    </svg>
  )
}

export function LightbulbIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  )
}

export function CheckCircleIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function ClockIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function MicIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

export function XIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function ThumbsUpIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M7 10v12" />
      <path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l4.42-9a1.5 1.5 0 0 1 2.7 1.04l-.12 3.84z" />
    </svg>
  )
}

export function CloudIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M17.5 19a4.5 4.5 0 1 0-1.7-8.6A6 6 0 0 0 4 12a4 4 0 0 0 0 8h13.5z" />
    </svg>
  )
}

export function BotIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  )
}

export function ArrowUpIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}

export function MedalIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
    </svg>
  )
}

export function MessageSquareIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function BrandMark(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="54 54 92 92" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="60" y="60" width="80" height="80" rx="20" fill="var(--md-sys-color-primary)" />
      <rect x="78" y="76" width="12" height="44" rx="3" fill="#EEF2FE" />
      <rect x="78" y="108" width="36" height="12" rx="3" fill="#EEF2FE" />
      <circle cx="114" cy="82" r="6" fill="#9BB3FA" />
    </svg>
  )
}
