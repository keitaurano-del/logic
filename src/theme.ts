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
  { id: 'blue',   get name() { return t('theme.accent.blue') },   accent: '#6C8EF5', accentSoft: 'rgba(108,142,245,0.16)', accentGlow: 'rgba(108,142,245,0.25)', accentDark: '#9BB3FA' },
  { id: 'purple', get name() { return t('theme.accent.purple') }, accent: '#8B5CF6', accentSoft: 'rgba(139,92,246,0.12)',  accentGlow: 'rgba(139,92,246,0.25)',  accentDark: '#7C3AED' },
  { id: 'green',  get name() { return t('theme.accent.green') },  accent: '#10B981', accentSoft: 'rgba(16,185,129,0.12)',  accentGlow: 'rgba(16,185,129,0.25)',  accentDark: '#059669' },
  { id: 'pink',   get name() { return t('theme.accent.pink') },   accent: '#EC4899', accentSoft: 'rgba(236,72,153,0.12)',  accentGlow: 'rgba(236,72,153,0.25)',  accentDark: '#DB2777' },
  { id: 'cyan',   get name() { return t('theme.accent.cyan') },   accent: '#06B6D4', accentSoft: 'rgba(6,182,212,0.12)',   accentGlow: 'rgba(6,182,212,0.25)',   accentDark: '#0891B2' },
]

// Mode (light/dark)
export type ModeId = 'light' | 'dark'

export type Mode = {
  id: ModeId
  name: string
  description: string
  preview: { bg: string; card: string; text: string; accent: string }
}

// MODES use getters for name/description so they re-localize on language switch.
export const MODES: Mode[] = [
  { id: 'light',      get name() { return t('theme.mode.light.name') },      get description() { return t('theme.mode.light.desc') },      preview: { bg: '#EEF1FA', card: '#FFFFFF', text: '#0D1220', accent: '#2E45A8' } },
  { id: 'dark',       get name() { return t('theme.mode.dark.name') },       get description() { return t('theme.mode.dark.desc') },       preview: { bg: '#1A1F2E', card: '#252C40', text: '#E8ECF4', accent: '#6C8EF5' } },
]

export type ThemeState = {
  mode: ModeId
  accent: AccentId
}

// 2026-04-27: v3 dark is the default.
const DEFAULT: ThemeState = { mode: 'dark', accent: 'orange' }

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
      const merged = { ...DEFAULT, ...v } as ThemeState
      // UI-1: premium テーマ削除 (sepia/forest/indigo/rose/slate) や旧削除 id
      // (custom/enterprise/startup/mono)、未知の id を localStorage に保存済みの
      // ユーザーは DEFAULT(dark) に安全フォールバック。MODES に存在しない id を
      // 適用すると mode-* クラスが無スタイル化するのを防ぐ。
      if (!MODES.some((m) => m.id === merged.mode)) {
        merged.mode = DEFAULT.mode
      }
      return merged
    }
  } catch { /* */ }
  return { ...DEFAULT }
}

export function saveTheme(s: ThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// Lightweight helpers for the Settings light/dark toggle.
export function getMode(): ModeId {
  return loadTheme().mode
}

export function setMode(mode: ModeId): void {
  const next: ThemeState = { ...loadTheme(), mode }
  saveTheme(next)
  applyTheme(next)
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
  const body = document.body
  // Reset and apply mode classes on BOTH <html> and <body>.
  // <body> needs the class because `body.theme-v3.mode-{x}` is the active
  // selector in tokens.css (used to win specificity over `.mode-{x}` alone).
  // `document.body` may be null when applyTheme runs from main.tsx before
  // <body> parses; the null check keeps that path safe.
  for (const m of MODES) {
    root.classList.remove(`mode-${m.id}`)
    if (body) body.classList.remove(`mode-${m.id}`)
  }
  root.classList.add(`mode-${s.mode}`)
  if (body) body.classList.add(`mode-${s.mode}`)

  // Accent variables
  const a = ACCENTS.find((x) => x.id === s.accent) || ACCENTS[0]
  const accentColor = a.accent
  root.style.setProperty('--accent', a.accent)
  root.style.setProperty('--accent-soft', a.accentSoft)
  root.style.setProperty('--accent-glow', a.accentGlow)
  root.style.setProperty('--accent-dark', a.accentDark)

  // Auto-pick readable foreground for buttons (white or near-black)
  // This avoids unreadable white-on-yellow / white-on-light-orange situations.
  root.style.setProperty('--accent-fg', pickFg(accentColor))

  // Sync <meta name="theme-color"> with the active mode so the browser's
  // URL bar / status area matches the page background. Dark UA otherwise
  // shows a stale light color on cold start. Each mode returns its own bg
  // (matches the --bg-primary defined for that mode in tokens.css).
  const THEME_COLOR_BY_MODE: Record<ModeId, string> = {
    light:  '#EEF1FA',
    dark:   '#1A1F2E',
  }
  const themeColor = THEME_COLOR_BY_MODE[s.mode] ?? '#1A1F2E'
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = themeColor
}
