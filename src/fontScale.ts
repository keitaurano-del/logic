import { t } from './i18n'

// DF-F2: ユーザーが文字サイズを選べる仕組み。
// 本文の文字サイズ指定は inline / CSS とも rem 基準（1rem = 15px）に統一してある。
// ここで documentElement(html) の font-size を 15px * scale に設定すると、
// rem 基準が動いて全テキスト（tokens の --font-* も inline fontSize も）が一括スケールする。
// tokens.css の --font-* は calc(px * scale) ではなく rem 値なので、root スケールと
// 二重に掛からない（一本化済み）。
const STORAGE_KEY = 'logic-font-scale'

// rem の基準。src/index.css の html { font-size: 15px } と一致させること。
const BASE_FONT_PX = 15

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

// documentElement(html) の font-size を 15px * scale に設定して rem 基準を動かす。
// これで rem を使う全テキスト（CSS の rem 値・tokens の --font-*・inline の rem fontSize）
// が一括スケールする。--font-scale も後方互換のため引き続き公開する（直接 calc には
// 使われないが、独自に参照しているコードがあっても破綻しないように）。
export function applyFontScale(id: FontScaleId): void {
  const scale = scaleValue(id)
  const root = document.documentElement
  root.style.fontSize = `${BASE_FONT_PX * scale}px`
  root.style.setProperty('--font-scale', String(scale))
}

export function setFontScale(id: FontScaleId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch { /* */ }
  applyFontScale(id)
}
