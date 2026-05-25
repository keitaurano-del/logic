// ttsReadings — TTS 読み上げ用テキストの記号正規化レイヤー
//
// 役割:
//   画面に表示するテキストは一切変えず、speak() に渡す「読み上げ専用テキスト」だけを
//   変換する。TTS エンジンが記号を誤読する問題（例: 「×」を「ばつ」と読む）を
//   ルールベースで補正する。Logic は数式・フェルミ推定など数学コンテンツが多いため、
//   「×」は基本「かける」が正しい読みとなる。
//
// 方針:
//   ルールベース版。文脈依存ケース（◯×マーク文脈で × を「ばつ」と読むべき等）は
//   将来 AI で補強する。現時点ではデフォルトを数式読み（× → かける）に倒す。
//   過剰変換を避けるため、< > 〜 など別用途（HTML タグ・範囲・波線装飾）と
//   衝突しやすい記号は「数式文脈（前後が英数字 or 空白）」に限定して変換する。

const isJaDigit = (ch: string): boolean => {
  // 半角数字 / 全角数字
  return /[0-9０-９]/.test(ch)
}

const isMathOperand = (ch: string | undefined): boolean => {
  // 比較演算子の前後に来てよい文字 = 数式のオペランドらしいもの。
  // 半角/全角の英数字、小数点、閉じ/開き括弧、空白を許容する。
  if (ch === undefined || ch === '') return true // 文字列端は「空白扱い」で許可
  return /[0-9０-９a-zA-Zａ-ｚＡ-Ｚ.．,，)）(（\s]/.test(ch)
}

/**
 * 読み上げ用にテキストを正規化する。表示テキストは変更しない用途。
 * @param text 読み上げ対象テキスト
 * @param lang 'ja-JP' | 'en-US'
 */
export function normalizeForSpeech(text: string, lang: 'ja-JP' | 'en-US'): string {
  if (!text) return text
  return lang === 'ja-JP' ? normalizeJa(text) : normalizeEn(text)
}

// ── ja-JP ──────────────────────────────────────────────────────
// 過剰変換に注意。日本語の通常文・ひらがな・漢字には触れない。

function normalizeJa(text: string): string {
  let out = ''
  const chars = Array.from(text)

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const prev = chars[i - 1]
    const next = chars[i + 1]

    switch (ch) {
      // 無条件変換（誤読が明確で別用途と衝突しない記号）
      case '×':
        out += 'かける'
        continue
      case '÷':
        out += 'わる'
        continue
      case '=':
      case '＝':
        out += 'イコール'
        continue
      case '±':
        out += 'プラスマイナス'
        continue
      case '%':
      case '％':
        out += 'パーセント'
        continue
      case '◯':
      case '○':
        out += 'まる'
        continue
      case '△':
        out += 'さんかく'
        continue
      case '□':
        out += 'しかく'
        continue
      case '&':
      case '＆':
        out += 'と'
        continue
      case '°':
        out += '度'
        continue
      case '→':
      case '⇒':
        // 「やじるし」と読ませない。読点相当に置換。
        out += '、'
        continue
    }

    // 2 文字の複合記号（≠ ≒ などは単独コードポイントなので switch で拾えるが、
    // ≦= のような並びは想定しない。ここでは単独コードポイントのみ扱う）
    switch (ch) {
      case '≠':
        out += 'ノットイコール'
        continue
      case '≒':
        out += 'ニアリーイコール'
        continue
      case '≦':
      case '≤':
        out += '以下'
        continue
      case '≧':
      case '≥':
        out += '以上'
        continue
    }

    // 文脈限定変換 — 数式文脈（前後がオペランドらしい）のときだけ変換する。
    // HTML タグ (<div>) や矢印 (->) と誤認しないため。
    if (ch === '<' || ch === '＜') {
      if (isMathOperand(prev) && isMathOperand(next) && (isDigitish(prev) || isDigitish(next))) {
        out += 'より小さい'
        continue
      }
      out += ch
      continue
    }
    if (ch === '>' || ch === '＞') {
      if (isMathOperand(prev) && isMathOperand(next) && (isDigitish(prev) || isDigitish(next))) {
        out += 'より大きい'
        continue
      }
      out += ch
      continue
    }

    // 範囲チルダ「3〜5」→「3から5」。前後が数字のときだけ変換する。
    if (ch === '〜' || ch === '~' || ch === '～') {
      if (isJaDigit(prev ?? '') && isJaDigit(next ?? '')) {
        out += 'から'
        continue
      }
      out += ch
      continue
    }

    // 通常文字（ひらがな・漢字・英字など）はそのまま
    out += ch
  }

  return out
}

// 数式文脈判定の補助: 比較演算子の左右どちらかに数字があるかを確認する用。
function isDigitish(ch: string | undefined): boolean {
  if (ch === undefined) return false
  return /[0-9０-９]/.test(ch)
}

// ── en-US ──────────────────────────────────────────────────────
// 軽め。深追いしない。

function normalizeEn(text: string): string {
  if (!text) return text
  return text
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/≠/g, ' not equal to ')
    .replace(/[%％]/g, ' percent ')
}
