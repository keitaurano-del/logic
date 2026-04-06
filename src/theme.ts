const STORAGE_KEY = 'logic-theme'

export type ThemeId = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan'

export type Theme = {
  id: ThemeId
  name: string
  accent: string
  accentSoft: string
  accentGlow: string
  gradient: string
}

export const themes: Theme[] = [
  {
    id: 'blue',
    name: 'インディゴ',
    accent: '#6366F1',
    accentSoft: 'rgba(99, 102, 241, 0.10)',
    accentGlow: 'rgba(99, 102, 241, 0.22)',
    gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
  },
  {
    id: 'purple',
    name: 'パープル',
    accent: '#8B5CF6',
    accentSoft: 'rgba(139, 92, 246, 0.12)',
    accentGlow: 'rgba(139, 92, 246, 0.25)',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  },
  {
    id: 'green',
    name: 'グリーン',
    accent: '#10B981',
    accentSoft: 'rgba(16, 185, 129, 0.12)',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
  },
  {
    id: 'orange',
    name: 'オレンジ',
    accent: '#F59E0B',
    accentSoft: 'rgba(245, 158, 11, 0.12)',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  },
  {
    id: 'pink',
    name: 'ピンク',
    accent: '#EC4899',
    accentSoft: 'rgba(236, 72, 153, 0.12)',
    accentGlow: 'rgba(236, 72, 153, 0.25)',
    gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
  },
  {
    id: 'cyan',
    name: 'シアン',
    accent: '#06B6D4',
    accentSoft: 'rgba(6, 182, 212, 0.12)',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
  },
]

export function loadTheme(): ThemeId {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    if (id && themes.some((t) => t.id === id)) return id as ThemeId
  } catch { /* */ }
  return 'blue'
}

export function saveTheme(id: ThemeId) {
  localStorage.setItem(STORAGE_KEY, id)
}

export function applyTheme(id: ThemeId) {
  const theme = themes.find((t) => t.id === id) || themes[0]
  const root = document.documentElement
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-soft', theme.accentSoft)
  root.style.setProperty('--accent-glow', theme.accentGlow)
}
