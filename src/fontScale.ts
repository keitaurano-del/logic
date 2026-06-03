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

// FB-27: 全体的に文字を底上げ。デフォルトを一段大きく（旧「大」相当）にする。
// 倍率（内部値 scale）と保存値（id）は据え置きで後方互換を保ち、表示ラベルだけ付け替える:
//   id 'standard'(1.0)  → ラベル「小」    （旧「標準」の倍率）
//   id 'large'   (1.15) → ラベル「標準」  （旧「大」の倍率。新デフォルト）
//   id 'xlarge'  (1.3)  → ラベル「大」    （旧「特大」の倍率）
// 既に id を保存しているユーザーの見た目（倍率）は一切変わらない。未設定ユーザーの
// デフォルトだけが 1.0 → 1.15 に底上げされる。
export const FONT_SCALES: FontScaleOption[] = [
  { id: 'standard', get name() { return t('appearanceSettings.fontSize.small') },  scale: 1.0,  previewPx: 16 },
  { id: 'large',    get name() { return t('appearanceSettings.fontSize.medium') }, scale: 1.15, previewPx: 19 },
  { id: 'xlarge',   get name() { return t('appearanceSettings.fontSize.largeNew') }, scale: 1.3, previewPx: 22 },
]

// 未設定ユーザーのデフォルトは新「標準」(= 旧「大」, id 'large', 1.15)。
const DEFAULT_ID: FontScaleId = 'large'

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
