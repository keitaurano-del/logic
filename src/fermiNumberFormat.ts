// フェルミ推定電卓の数値フォーマット純ロジック。
// i18n / DOM に依存しないので単体テストしやすい形で切り出している。
// 表示は「万 / 億 / 兆」単位（ja）または「K / M / T」（en）に丸めて読みやすくする。

export type FermiLocale = 'ja' | 'en'

// 単位境界（10^4 / 10^8 / 10^12）
const MAN = 1e4 // 万
const OKU = 1e8 // 億
const CHO = 1e12 // 兆

/**
 * 小数を最大1桁に丸めて、末尾の `.0` を落とす。
 * 例: 1.25 → "1.3"、5.0 → "5"、12.0 → "12"
 */
export function roundTo1(n: number): string {
  // toFixed(1) で四捨五入 → 末尾 .0 を除去
  const fixed = n.toFixed(1)
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed
}

/**
 * 数値を日本語の万/億/兆単位（ja）または K/M/T（en）に丸めて返す。
 * - 万未満（|n| < 10000）はそのままロケール区切りで返す
 * - 小数は1桁に丸める（例: 12345 → "1.2万"）
 * - 0・負値・極端に小さい値も正しく扱う
 * - 兆を超える巨大値は兆単位で表示し続ける（例: 3.5e12 → "3.5兆"、1.2e15 → "1200兆"）
 *
 * @param n      対象の数値
 * @param locale 'ja' | 'en'
 */
export function formatJpUnit(n: number, locale: FermiLocale = 'ja'): string {
  if (!Number.isFinite(n)) return '—'

  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : '' // U+2212 マイナス記号（表示用）
  const localeStr = locale === 'ja' ? 'ja-JP' : 'en-US'

  // ja は 10^4(万)/10^8(億)/10^12(兆)、en は 10^3(K)/10^6(M)/10^9(B)/10^12(T)。
  // 単位境界は言語で異なるので、ロケールごとにテーブルを分ける。
  if (locale === 'ja') {
    // 万未満（0 含む）はそのまま。小さな小数も無理に単位化しない。
    if (abs < MAN) {
      return n.toLocaleString(localeStr, { maximumFractionDigits: 4 })
    }
    const units: { threshold: number; label: string }[] = [
      { threshold: CHO, label: '兆' },
      { threshold: OKU, label: '億' },
      { threshold: MAN, label: '万' },
    ]
    for (const u of units) {
      if (abs >= u.threshold) {
        return `${sign}${roundTo1(abs / u.threshold)}${u.label}`
      }
    }
  } else {
    // en: 千未満はそのまま
    if (abs < 1e3) {
      return n.toLocaleString(localeStr, { maximumFractionDigits: 4 })
    }
    const units: { threshold: number; label: string }[] = [
      { threshold: 1e12, label: 'T' },
      { threshold: 1e9, label: 'B' },
      { threshold: 1e6, label: 'M' },
      { threshold: 1e3, label: 'K' },
    ]
    for (const u of units) {
      if (abs >= u.threshold) {
        return `${sign}${roundTo1(abs / u.threshold)}${u.label}`
      }
    }
  }

  // ここには到達しないが保険
  return n.toLocaleString(localeStr, { maximumFractionDigits: 4 })
}

/**
 * 電卓の「= 結果」に出す生の数値表示。
 * - 桁が極端（>= 10^15 または 0 でない |n| < 10^-4）は指数表記
 * - それ以外はロケール区切り（小数最大6桁）
 */
export function formatResult(n: number, locale: FermiLocale = 'ja'): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-4)) return n.toExponential(3)
  const localeStr = locale === 'ja' ? 'ja-JP' : 'en-US'
  return n.toLocaleString(localeStr, { maximumFractionDigits: 6 })
}

/**
 * 電卓の入力式末尾の数値リテラルに単位倍率を掛ける。
 * 例: applyUnitMultiplier("5", 1e4) → "50000"
 *     applyUnitMultiplier("3*2", 1e8) → "3*200000000"
 *     applyUnitMultiplier("1.5", 1e4) → "15000"
 * 末尾が数値リテラルでない（演算子・括弧で終わる、空）場合は null を返し、呼び出し側で no-op にする。
 *
 * @param expr   現在の計算式文字列
 * @param factor 掛ける倍率（万=1e4 / 億=1e8）
 */
export function applyUnitMultiplier(expr: string, factor: number): string | null {
  // 末尾の数値リテラル（整数 or 小数）を取り出す
  const m = expr.match(/(\d+\.?\d*|\.\d+)$/)
  if (!m) return null
  const literal = m[0]
  const num = parseFloat(literal)
  if (!Number.isFinite(num)) return null
  const multiplied = num * factor
  // 浮動小数誤差を抑えるため有効桁を丸めてから文字列化（例: 1.1*1e8 の誤差対策）
  const replacement = String(Number(multiplied.toPrecision(15)))
  return expr.slice(0, expr.length - literal.length) + replacement
}
