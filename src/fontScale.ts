import { t } from './i18n'

// DF-F2: ユーザーが文字サイズを選べる仕組み。
// tokens.css の type scale (--font-*) は calc(基準px * var(--font-scale)) で
// 定義されており、ここで documentElement / body に --font-scale を設定すると
// 全テキストが一括スケールする。
const STORAGE_KEY = 'logic-font-scale'

export type FontScaleId = 'standard' | 'large' | 'xlarge'

export type FontScaleOption = {
  id: FontScaleId
  name: string
  scale: number
  // プレビュー用のサンプル文字サイズ(px)。実 UI へは影響しない表示専用値。
  previewPx: number
}

// 標準=1.0 / 大=1.15 / 特大=1.3
export const FONT_SCALES: FontScaleOption[] = [
  { id: 'standard', get name() { return t('appearanceSettings.fontSize.standard') }, scale: 1.0,  previewPx: 16 },
  { id: 'large',    get name() { return t('appearanceSettings.fontSize.large') },    scale: 1.15, previewPx: 19 },
  { id: 'xlarge',   get name() { return t('appearanceSettings.fontSize.xlarge') },   scale: 1.3,  previewPx: 22 },
]

const DEFAULT_ID: FontScaleId = 'standard'

export function loadFontScale(): FontScaleId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && FONT_SCALES.some((f) => f.id === raw)) {
      return raw as FontScaleId
    }
  } catch { /* */ }
  return DEFAULT_ID
}

function scaleValue(id: FontScaleId): number {
  return FONT_SCALES.find((f) => f.id === id)?.scale ?? 1.0
}

// --font-scale を documentElement / body に適用する。
// body は applyTheme が body.theme-v3.mode-* で token を解決する都合に合わせて
// 両方へ設定し、どちらの要素を起点に calc が評価されても確実にスケールが効くようにする。
export function applyFontScale(id: FontScaleId): void {
  const scale = scaleValue(id)
  const root = document.documentElement
  root.style.setProperty('--font-scale', String(scale))
  if (document.body) {
    document.body.style.setProperty('--font-scale', String(scale))
  }
}

export function setFontScale(id: FontScaleId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch { /* */ }
  applyFontScale(id)
}
