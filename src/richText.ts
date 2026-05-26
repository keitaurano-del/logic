/**
 * Lightweight, dependency-free markdown subset for lesson content.
 *
 * 既存レッスン本文（200+ レッスン）が使っている記法に合わせた安全側パーサ。
 * - 太字 `**...**`
 * - 箇条書き（行頭 `- ` または `・`）
 * - 番号リスト（行頭 `1. ` / `2) ` など）
 * - 見出し `## ` / `### `
 * - コードフェンス ``` ``` ```（既存コンテンツに ~200 個ある）
 * - 段落・改行
 *
 * 設計方針:
 * - 曖昧なら描画しない（literal な `*` や記号、`→ × ÷` 等はそのまま素通し）。
 * - 表示用パース（parseRichText）と読み上げ用 strip（stripMarkup）を同じ前提で実装し、
 *   ズレを防ぐ。
 *
 * このモジュールは React に依存しない（純データ）。描画は RichLessonText が担当。
 */

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }

export type Block =
  | { type: 'heading'; level: 2 | 3; tokens: InlineToken[] }
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'bullets'; items: InlineToken[][] }
  | { type: 'numbers'; items: { marker: string; tokens: InlineToken[] }[] }
  | { type: 'code'; text: string }

// ── 行分類用の正規表現 ────────────────────────────────────────────────
// 見出し: 行頭 `## ` または `### `（`#` 1個は本文中の `#1` 等と衝突するので不採用）
const HEADING_RE = /^(#{2,3})\s+(.*)$/
// 箇条書き: 行頭 `- ` または `・`（`・` は直後スペース有無どちらも許容）
//   注: 行頭限定。文中の `・`（例「論理・分析」）はマッチしないので bullet 化されない。
const BULLET_RE = /^[-]\s+(.*)$/
const BULLET_NAKAGURO_RE = /^・\s*(.*)$/
// 番号リスト: 行頭 `1. ` / `1) ` / 全角は対象外
const NUMBER_RE = /^(\d{1,2})[.)]\s+(.*)$/

/**
 * 改行表記を正規化する。
 * レッスンデータは TS 文字列リテラルなので通常は実改行だが、
 * 一部に literal な `\n`（バックスラッシュ+n）が混ざるケースがあるため吸収する。
 */
function normalizeNewlines(input: string): string {
  return input.replace(/\\n/g, '\n').replace(/\r\n/g, '\n')
}

/**
 * インライン要素（太字のみ）をトークン化する。
 *
 * 安全側ルール:
 * - `**...**` が閉じている場合のみ太字化。中身が空(`****`)や閉じていない `**` は
 *   literal テキストとして残す。
 */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let i = 0
  let buf = ''
  const flush = () => {
    if (buf) {
      tokens.push({ type: 'text', value: buf })
      buf = ''
    }
  }
  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      // 閉じ `**` を探す（直後が `**` の空ボールドは無効）
      const close = text.indexOf('**', i + 2)
      if (close > i + 2) {
        const inner = text.slice(i + 2, close)
        // 中身に改行が混ざるケースは太字扱いしない（誤検出回避）
        if (!inner.includes('\n')) {
          flush()
          tokens.push({ type: 'bold', value: inner })
          i = close + 2
          continue
        }
      }
      // 閉じなし or 空 → literal の `*` として扱う
      buf += '*'
      i += 1
      continue
    }
    buf += text[i]
    i += 1
  }
  flush()
  return tokens
}

/**
 * レッスン本文（markdown サブセット）をブロック配列にパースする。
 */
export function parseRichText(input: string): Block[] {
  const src = normalizeNewlines(input)
  const lines = src.split('\n')
  const blocks: Block[] = []

  let para: string[] = []
  const flushPara = () => {
    if (para.length === 0) return
    const text = para.join('\n').trim()
    if (text) blocks.push({ type: 'paragraph', tokens: parseInline(text) })
    para = []
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // ── コードフェンス ──
    if (trimmed.startsWith('```')) {
      flushPara()
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i += 1
      }
      // 終端フェンスをスキップ（無くてもブロックは閉じる）
      if (i < lines.length) i += 1
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }

    // ── 空行 → 段落区切り ──
    if (trimmed === '') {
      flushPara()
      i += 1
      continue
    }

    // ── 見出し ──
    const heading = trimmed.match(HEADING_RE)
    if (heading) {
      flushPara()
      const level = heading[1].length === 2 ? 2 : 3
      blocks.push({ type: 'heading', level: level as 2 | 3, tokens: parseInline(heading[2].trim()) })
      i += 1
      continue
    }

    // ── 箇条書き（連続行をまとめる） ──
    if (BULLET_RE.test(trimmed) || BULLET_NAKAGURO_RE.test(trimmed)) {
      flushPara()
      const items: InlineToken[][] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        const m = t.match(BULLET_RE) ?? t.match(BULLET_NAKAGURO_RE)
        if (!m) break
        items.push(parseInline(m[1].trim()))
        i += 1
      }
      blocks.push({ type: 'bullets', items })
      continue
    }

    // ── 番号リスト（連続行をまとめる） ──
    if (NUMBER_RE.test(trimmed)) {
      flushPara()
      const items: { marker: string; tokens: InlineToken[] }[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(NUMBER_RE)
        if (!m) break
        items.push({ marker: `${m[1]}.`, tokens: parseInline(m[2].trim()) })
        i += 1
      }
      blocks.push({ type: 'numbers', items })
      continue
    }

    // ── 通常テキスト行 → 段落バッファに追加 ──
    para.push(line)
    i += 1
  }
  flushPara()
  return blocks
}

/**
 * 読み上げ用に markdown 記法を剥がした素のテキストを返す。
 *
 * speak() に渡す前に通すことで「アスタリスク」「ハイフン」「シャープ」等を
 * そのまま読み上げてしまう事故を防ぐ。normalizeForSpeech（記号→読み変換）の
 * 前段で 1 回だけ適用する想定。
 *
 * 表示側 parseRichText と同じ記法定義を使い、剥がした結果を自然な文に均す。
 */
export function stripMarkup(input: string): string {
  if (!input) return ''
  const src = normalizeNewlines(input)
  const out: string[] = []
  const lines = src.split('\n')
  let inCode = false
  for (const raw of lines) {
    const trimmed = raw.trim()

    if (trimmed.startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) {
      // コードブロックの中身はそのまま（記号読みは normalizeForSpeech 側に委ねる）
      if (trimmed) out.push(trimmed)
      continue
    }

    if (trimmed === '') continue

    // 見出しマーカー除去
    const heading = trimmed.match(HEADING_RE)
    if (heading) {
      out.push(stripInline(heading[2].trim()))
      continue
    }
    // 箇条書きマーカー除去
    const bullet = trimmed.match(BULLET_RE) ?? trimmed.match(BULLET_NAKAGURO_RE)
    if (bullet) {
      out.push(stripInline(bullet[1].trim()))
      continue
    }
    // 番号マーカーは「1.」を残すと「いってん」と読むので除去（番号自体は読み上げ不要）
    const num = trimmed.match(NUMBER_RE)
    if (num) {
      out.push(stripInline(num[2].trim()))
      continue
    }
    out.push(stripInline(trimmed))
  }
  // 行を「。」相当の区切りで繋ぐ（normalizeForSpeech 側がさらに整える）
  return out.join('\n')
}

/**
 * インラインの太字記法を剥がす（中身は残す）。
 * 読み上げ用なので、ペアにならず残った `**`（2 個以上連続のアスタリスク）も除去する
 * —「アスタリスク」と読み上げる事故を防ぐため。単独の `*`（脚注 *1 等）は残す。
 */
function stripInline(text: string): string {
  const tokens = parseInline(text)
  const joined = tokens.map((tk) => tk.value).join('')
  // 連続アスタリスク（**, *** ...）を除去。単独 * は temporarily 残す。
  return joined.replace(/\*{2,}/g, '')
}
