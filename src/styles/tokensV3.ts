/**
 * Logic v3 Design Tokens
 * 仕様書: docs/DESIGN_V3.md §2
 */
export const tokensV3 = {
  color: {
    // Slate Blue palette — 450nm帯・心理学的最適集中色 (2026-05-01)
    bg: '#1A1F2E',
    card: '#252C40',
    card2: '#2E3652',
    cardSoft: '#1E2438',
    accent: '#6C8EF5',
    accentSoft: 'rgba(108,142,245,.16)',
    accentGlow: 'rgba(108,142,245,.25)',
    warm: '#F4A261',
    warmSoft: 'rgba(244,162,97,.16)',
    text: '#E8ECF4',       // メインテキスト: 11.4:1 AAA
    text2: '#8FA3C8',       // サブテキスト: 7.1:1 AAA
    text3: '#6B82A8',       // プレースホルダー等: 4.8:1 AA
    line: 'rgba(255,255,255,.09)',
  },
  radius: {
    card: 20,
    pill: 99,
    chip: 14,
  },
  spacing: {
    gap: 14,
    padding: 18,
    margin: 16,
  },
  font: {
    logo: { family: "'Inter Tight', sans-serif", size: 24, weight: 800 },
    h1: { size: 22, weight: 700 },
    h2: { size: 18, weight: 700 },
    body: { size: 15, weight: 500 },
    sub: { size: 12, weight: 500 },
    label: { size: 11, weight: 600 },
  },
  shadow: {
    card: 'inset 0 1px 0 rgba(255,255,255,.04)',
    hero: '0 4px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)',
    cta: '0 4px 16px rgba(108,142,245,.25)',
  },
  motion: {
    tap: 'transform .12s ease, opacity .12s ease',
    fade: 'opacity .2s ease',
  },
} as const

export const v3 = tokensV3
