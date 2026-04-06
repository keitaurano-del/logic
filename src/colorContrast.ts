// WCAG 2.1 contrast ratio calculator
// https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  const h = m[1]
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

export function contrastRatio(fg: string, bg: string): number {
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  if (!fgRgb || !bgRgb) return 0
  const l1 = relativeLuminance(fgRgb)
  const l2 = relativeLuminance(bgRgb)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA-large' | 'fail'

export function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA-large'
  return 'fail'
}

export function describeContrast(ratio: number): { level: ContrastLevel; label: string; ok: boolean } {
  const level = contrastLevel(ratio)
  const labels: Record<ContrastLevel, string> = {
    AAA: '優秀 (AAA)',
    AA: '基準内 (AA)',
    'AA-large': '大文字のみ可 (AA Large)',
    fail: '読みにくい',
  }
  return { level, label: labels[level], ok: level === 'AAA' || level === 'AA' }
}

// Pick a readable foreground (black or white) for a given background
export function pickReadableForeground(bg: string): '#FFFFFF' | '#000000' {
  return contrastRatio('#FFFFFF', bg) >= contrastRatio('#000000', bg) ? '#FFFFFF' : '#000000'
}
