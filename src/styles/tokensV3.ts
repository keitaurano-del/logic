/**
 * Logic v3 Design Tokens
 * 仕様書: docs/DESIGN_V3.md §2
 */
export const tokensV3 = {
  color: {
    bg: '#082121',
    card: '#1A3A39',
    card2: '#234D4B',
    cardSoft: '#163938',
    accent: '#70D8BD',
    accentSoft: 'rgba(112,216,189,.16)',
    accentGlow: 'rgba(112,216,189,.25)',
    warm: '#F4A261',
    warmSoft: 'rgba(244,162,97,.16)',
    text: '#F5FAF9',       // メインテキスト: 辝度を微上げ
    text2: '#C4D8D6',       // サブテキスト: #A3B8B7 → #C4D8D6（コントラスト比改善）
    text3: '#9AB3B1',       // プレースホルダー等: #7A8E8D → #9AB3B1（読みやすさ改善）
    line: 'rgba(255,255,255,.05)',
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
    cta: '0 4px 16px rgba(112,216,189,.25)',
  },
  motion: {
    tap: 'transform .12s ease, opacity .12s ease',
    fade: 'opacity .2s ease',
  },
} as const

export const v3 = tokensV3
