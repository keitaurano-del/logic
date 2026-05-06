/**
 * Logic v3 Design Tokens
 * 仕様書: docs/DESIGN_V3.md §2 / docs/HIG_MATERIAL_AUDIT_20260504.md §2
 *
 * `m3` ブロックが canonical の Material 3 Color Roles。
 * Phase 6 (PR #122) で legacy `color` block は削除済み。
 * 色は CSS 変数 (`var(--bg-primary)` 等) を直接使用すること。
 * 単一情報源は src/styles/tokens.css の `:root` / `body.theme-v3` ブロック。
 */
export const tokensV3 = {
  // ── Material 3 Color Roles (canonical) ──
  m3: {
    primary:                   '#6C8EF5',
    onPrimary:                 '#FFFFFF',
    primaryContainer:          '#2E45A8',
    onPrimaryContainer:        '#DDE5FF',
    secondary:                 '#BCC6DC',
    onSecondary:               '#26314A',
    secondaryContainer:        '#3C4661',
    onSecondaryContainer:      '#D8E2F9',
    tertiary:                  '#F5BFA0',
    onTertiary:                '#4A2510',
    tertiaryContainer:         '#643C24',
    onTertiaryContainer:       '#FFDCC4',
    error:                     '#FFB4AB',
    onError:                   '#690005',
    errorContainer:            '#93000A',
    onErrorContainer:          '#FFDAD6',
    surface:                   '#1A1F2E',
    onSurface:                 '#E8ECF4',
    surfaceVariant:            '#252C40',
    onSurfaceVariant:          '#8FA3C8',
    surfaceContainerLowest:    '#13182A',
    surfaceContainerLow:       '#1E2438',
    surfaceContainer:          '#252C40',
    surfaceContainerHigh:      '#2E3652',
    surfaceContainerHighest:   '#37405F',
    outline:                   '#8FA3C8',
    outlineVariant:            'rgba(255,255,255,.09)',
    inverseSurface:            '#E8ECF4',
    inverseOnSurface:          '#1A1F2E',
    inversePrimary:            '#3E59B0',
    scrim:                     'rgba(0,0,0,.55)',
    surfaceTint:               '#6C8EF5',
  },

  radius: {
    card: 16, // shape-lg, was 20
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

