import { t } from './i18n'

const STORAGE_KEY = 'logic-theme'

// Accent (existing free tier - 6 colors)
export type AccentId = 'orange' | 'blue' | 'purple' | 'green' | 'pink' | 'cyan'

export type Accent = {
  id: AccentId
  name: string
  accent: string
  accentSoft: string
  accentGlow: string
  accentDark: string
}

export const ACCENTS: Accent[] = [
  { id: 'orange', get name() { return t('theme.accent.orange') }, accent: '#D4915A', accentSoft: 'rgba(212,145,90,0.10)', accentGlow: 'rgba(212,145,90,0.22)', accentDark: '#B07442' },
  { id: 'blue',   get name() { return t('theme.accent.blue') },   accent: '#6366F1', accentSoft: 'rgba(99,102,241,0.10)',  accentGlow: 'rgba(99,102,241,0.22)',  accentDark: '#4F46E5' },
  { id: 'purple', get name() { return t('theme.accent.purple') }, accent: '#8B5CF6', accentSoft: 'rgba(139,92,246,0.12)',  accentGlow: 'rgba(139,92,246,0.25)',  accentDark: '#7C3AED' },
  { id: 'green',  get name() { return t('theme.accent.green') },  accent: '#10B981', accentSoft: 'rgba(16,185,129,0.12)',  accentGlow: 'rgba(16,185,129,0.25)',  accentDark: '#059669' },
  { id: 'pink',   get name() { return t('theme.accent.pink') },   accent: '#EC4899', accentSoft: 'rgba(236,72,153,0.12)',  accentGlow: 'rgba(236,72,153,0.25)',  accentDark: '#DB2777' },
  { id: 'cyan',   get name() { return t('theme.accent.cyan') },   accent: '#06B6D4', accentSoft: 'rgba(6,182,212,0.12)',   accentGlow: 'rgba(6,182,212,0.25)',   accentDark: '#0891B2' },
]

// Mode (light/dark/premium)
export type ModeId = 'light' | 'dark' | 'enterprise' | 'startup' | 'custom'
export type ModeTier = 'free' | 'premium'

export type Mode = {
  id: ModeId
  name: string
  description: string
  tier: ModeTier
  preview: { bg: string; card: string; text: string; accent: string }
}

// MODES use getters for name/description so they re-localize on language switch.
export const MODES: Mode[] = [
  { id: 'light',      get name() { return t('theme.mode.light.name') },      get description() { return t('theme.mode.light.desc') },      tier: 'free',    preview: { bg: '#F5F1E8', card: '#FFFFFF', text: '#2D2820', accent: '#D4915A' } },
  { id: 'dark',       get name() { return t('theme.mode.dark.name') },       get description() { return t('theme.mode.dark.desc') },       tier: 'free',    preview: { bg: '#15171C', card: '#1F232B', text: '#E8E8EC', accent: '#D4915A' } },
  { id: 'enterprise', get name() { return t('theme.mode.enterprise.name') }, get description() { return t('theme.mode.enterprise.desc') }, tier: 'premium', preview: { bg: '#0F1729', card: '#1A2540', text: '#E2E8F0', accent: '#94A3B8' } },
  { id: 'startup',    get name() { return t('theme.mode.startup.name') },    get description() { return t('theme.mode.startup.desc') },    tier: 'premium', preview: { bg: '#FFFAF0', card: '#FFFFFF', text: '#1A2E22', accent: '#10B981' } },
  { id: 'custom',     get name() { return t('theme.mode.custom.name') },     get description() { return t('theme.mode.custom.desc') },     tier: 'premium', preview: { bg: '#F5F1E8', card: '#FFFFFF', text: '#2D2820', accent: '#D4915A' } },
]

export type ThemeState = {
  mode: ModeId
  accent: AccentId
  customHex: string  // for mode === 'custom'
}

const DEFAULT: ThemeState = { mode: 'light', accent: 'orange', customHex: '#D4915A' }

export function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const v = JSON.parse(raw)
      // Backward-compat: old format stored just the accent id as string
      if (typeof v === 'string') {
        const accent = ACCENTS.find((a) => a.id === v)?.id ?? 'orange'
        return { ...DEFAULT, accent }
      }
      return { ...DEFAULT, ...v }
    }
  } catch { /* */ }
  return { ...DEFAULT }
}

export function saveTheme(s: ThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function darkenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = Math.max(0, parseInt(full.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(full.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(full.slice(4, 6), 16) - amount)
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

// WCAG luminance for choosing readable button text
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return 0.5
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function pickFg(bg: string): string {
  // White contrast ratio = (1.05) / (lum + 0.05); Black = (lum + 0.05) / 0.05
  const lum = luminance(bg)
  const whiteRatio = 1.05 / (lum + 0.05)
  const blackRatio = (lum + 0.05) / 0.05
  return whiteRatio >= blackRatio ? '#FFFFFF' : '#1A1A1A'
}

export function applyTheme(s: ThemeState) {
  const root = document.documentElement
  // Reset previous mode classes
  for (const m of MODES) root.classList.remove(`mode-${m.id}`)
  root.classList.add(`mode-${s.mode}`)

  // Accent variables
  let accentColor = ''
  if (s.mode === 'custom' && /^#[0-9A-Fa-f]{6}$/.test(s.customHex)) {
    accentColor = s.customHex
    root.style.setProperty('--accent', s.customHex)
    root.style.setProperty('--accent-soft', hexToRgba(s.customHex, 0.12))
    root.style.setProperty('--accent-glow', hexToRgba(s.customHex, 0.25))
    root.style.setProperty('--accent-dark', darkenHex(s.customHex, 30))
  } else {
    const a = ACCENTS.find((x) => x.id === s.accent) || ACCENTS[0]
    accentColor = a.accent
    root.style.setProperty('--accent', a.accent)
    root.style.setProperty('--accent-soft', a.accentSoft)
    root.style.setProperty('--accent-glow', a.accentGlow)
    root.style.setProperty('--accent-dark', a.accentDark)
  }

  // Auto-pick readable foreground for buttons (white or near-black)
  // This avoids unreadable white-on-yellow / white-on-light-orange situations.
  root.style.setProperty('--accent-fg', pickFg(accentColor))
}
