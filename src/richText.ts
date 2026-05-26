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
  /**
   * インラインアイコン。`[icon:name]` 記法でパースされる。
   * `name` は src/components/RichLessonText.tsx の ICON_REGISTRY のキー。
   * 未登録 name は parse 時点では token として保持されるが、描画側で無害に無視される
   * （= literal にもアイコンにもならず消える。クラッシュさせない）。
   */
  | { type: 'icon'; name: string }

/** callout（注記ボックス）の種類。描画側でアイコン・色を出し分ける。 */
export type CalloutKind = 'tip' | 'warn' | 'point' | 'note'

export type Block =
  | { type: 'heading'; level: 2 | 3; tokens: InlineToken[] }
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'bullets'; items: InlineToken[][] }
  | { type: 'numbers'; items: { marker: string; tokens: InlineToken[] }[] }
  | { type: 'code'; text: string }
  /**
   * 注記ボックス。`:::tip` 〜 `:::` の囲み記法でパースされる。
   * 中身は再帰的にブロックパースされる（段落・リスト・太字・アイコンが使える）。
   */
  | { type: 'callout'; kind: CalloutKind; blocks: Block[] }

// ── 行分類用の正規表現 ────────────────────────────────────────────────
// 見出し: 行頭 `## ` または `### `（`#` 1個は本文中の `#1` 等と衝突するので不採用）
const HEADING_RE = /^(#{2,3})\s+(.*)$/
// 箇条書き: 行頭 `- ` または `・`（`・` は直後スペース有無どちらも許容）
//   注: 行頭限定。文中の `・`（例「論理・分析」）はマッチしないので bullet 化されない。
const BULLET_RE = /^[-]\s+(.*)$/
const BULLET_NAKAGURO_RE = /^・\s*(.*)$/
// 番号リスト: 行頭 `1. ` / `1) ` / 全角は対象外
const NUMBER_RE = /^(\d{1,2})[.)]\s+(.*)$/
// callout 開きフェンス: 行頭 `:::tip` / `:::warn` / `:::point` / `:::note`
//   （kind 省略時は note 扱い）。閉じは `:::` 単独行。
//   `:::` 3 連続は本文の通常テキスト（コロン3個並び）には実質出現しないので衝突安全。
const CALLOUT_OPEN_RE = /^:::\s*(tip|warn|point|note)?\s*$/
const CALLOUT_CLOSE_RE = /^:::\s*$/

/** callout kind 文字列を正規化する。未知/未指定は 'note'。 */
function normalizeCalloutKind(raw: string | undefined): CalloutKind {
  if (raw === 'tip' || raw === 'warn' || raw === 'point') return raw
  return 'note'
}

/**
 * `from` 行以降に、対応する閉じフェンス `:::` 単独行が存在するか探す。
 * 見つかればその行 index、無ければ -1 を返す。
 *
 * 用途: kind 省略の裸 `:::` を open と扱ってよいか（=対応 close があるか）の判定。
 * splitBody 等で callout が途中分断され、孤立 close `:::` だけがチャンクに残った場合に
 * spurious callout を生むのを防ぐためのガード。kind 明示の open はこの判定を経ない。
 */
function findMatchingClose(lines: string[], from: number): number {
  for (let j = from; j < lines.length; j++) {
    if (CALLOUT_CLOSE_RE.test(lines[j].trim())) return j
  }
  return -1
}

/**
 * 改行表記を正規化する。
 * レッスンデータは TS 文字列リテラルなので通常は実改行だが、
 * 一部に literal な `\n`（バックスラッシュ+n）が混ざるケースがあるため吸収する。
 */
function normalizeNewlines(input: string): string {
  return input.replace(/\\n/g, '\n').replace(/\r\n/g, '\n')
}

/**
 * インラインアイコン記法 `[icon:name]`。
 *
 * 区切り設計の意図（衝突安全性）:
 * - `:name:` ショートコードは禁止。本文に「3:1」「10:30」「費用 2:1」のような
 *   コロン区切りが多く、誤検出してテキストをアイコン化してしまうため。
 * - `[icon:` という固定プレフィックスで始まり `]` で閉じる囲み記法に限定する。
 *   `icon:` リテラルプレフィックスがあるので、比率・時刻・通常テキストとは衝突しない。
 * - `name` は英小文字・数字・ハイフンのみ許可（`[a-z0-9-]+`）。日本語や記号は弾く。
 *   これにより本文中の `[補足]` 等の角括弧表現も誤検出しない（`icon:` で始まらない）。
 */
const INLINE_ICON_RE = /^\[icon:([a-z0-9-]+)\]/

/**
 * インライン要素（太字・アイコン）をトークン化する。
 *
 * 安全側ルール:
 * - `**...**` が閉じている場合のみ太字化。中身が空(`****`)や閉じていない `**` は
 *   literal テキストとして残す。
 * - `[icon:name]` はアイコントークン化。それ以外の `[...]` は literal のまま残す。
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
    // ── インラインアイコン `[icon:name]` ──
    if (text[i] === '[') {
      const m = INLINE_ICON_RE.exec(text.slice(i))
      if (m) {
        flush()
        tokens.push({ type: 'icon', name: m[1] })
        i += m[0].length
        continue
      }
      // `[icon:` で始まらない `[` は literal の角括弧として素通し
    }
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

    // ── callout 注記ボックス `:::tip` 〜 `:::` ──
    //   開き `:::kind` を見つけたら、閉じ `:::` までを集めて再帰パースする。
    //
    //   孤立 close ガード（防御層）:
    //   `:::` 単独行（kind 省略）は CALLOUT_OPEN_RE にもマッチするため、splitBody 等で
    //   callout が途中分断されて「閉じ `:::` だけ」が残ったチャンクでは、本来 close で
    //   あるべき行を open と誤認し、後続テキストを丸ごと囲む spurious callout を生む。
    //   これを無害化するため、kind 省略の裸 `:::` は「後続に対応する裸 close `:::` が
    //   存在する場合のみ」open として扱う。対応 close が無い孤立 `:::` は literal でも
    //   アイコンでもなく単に無視（行を捨てる）して事故を防ぐ。
    //   kind 明示（`:::tip` 等）は従来どおり常に open として扱う（閉じが無くても末尾まで取込）。
    const calloutOpen = trimmed.match(CALLOUT_OPEN_RE)
    if (calloutOpen) {
      const hasKind = !!calloutOpen[1]
      const closeIdx = hasKind ? -1 : findMatchingClose(lines, i + 1)
      if (!hasKind && closeIdx < 0) {
        // 対応 close の無い孤立した裸 `:::` → 無視して次行へ（spurious callout 防止）
        i += 1
        continue
      }
      flushPara()
      const inner: string[] = []
      i += 1
      while (i < lines.length && !CALLOUT_CLOSE_RE.test(lines[i].trim())) {
        inner.push(lines[i])
        i += 1
      }
      // 閉じフェンスをスキップ（無くてもブロックは閉じる）
      if (i < lines.length) i += 1
      blocks.push({
        type: 'callout',
        kind: normalizeCalloutKind(calloutOpen[1]),
        blocks: parseRichText(inner.join('\n')),
      })
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

    // callout フェンス（`:::tip` / `:::`）はマーカーなので読み上げない。
    // 中身の行は通常テキストとして後続の分岐で処理される。
    if (CALLOUT_OPEN_RE.test(trimmed) || CALLOUT_CLOSE_RE.test(trimmed)) continue

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
 * 絵文字（および一部の装飾用 Unicode 記号）を除去する正規表現。
 *
 * レッスン本文ではアイコンに加えて絵文字も許可しているため、読み上げ時に
 * TTS が「電球 絵文字」「チェックマーク」等と読み上げてしまう事故を防ぐ。
 *
 * 対象: 主要な emoji ブロック（Misc Symbols and Pictographs / Emoticons /
 * Transport & Map / Supplemental Symbols / Dingbats の絵文字相当 / 地域表示記号）
 * + Variation Selector(FE0F) + ZWJ(200D) + skin-tone modifier。
 *
 * 注意: 数式・矢印で使う `×` `÷` `→` `≠` 等は対象外（残す）。これらは
 * normalizeForSpeech 側で読みに変換される。`✓` `✗` のような callout 用記号は
 * 本文ではアイコン化を推奨するが、もし生テキストで混ざっていても誤読しないよう除去する。
 */
//   注: Variation Selector(FE0F) / ZWJ(200D) / skin-tone modifier(1F3FB-1F3FF) は
//   それ単体だと「結合文字を character class に入れている」と ESLint に警告されるため
//   絵文字本体パターンとは別の alternation（`|`）に分けて除去する。
const EMOJI_RE = new RegExp(
  '[\\u{1F300}-\\u{1F5FF}\\u{1F600}-\\u{1F64F}\\u{1F680}-\\u{1F6FF}\\u{1F900}-\\u{1FAFF}\\u{2600}-\\u{27BF}]' +
    '|[\\u{1F1E6}-\\u{1F1FF}]' + // 地域表示記号（国旗）
    '|\\u{FE0F}|\\u{200D}' + // Variation Selector-16 / ZWJ
    '|[\\u{1F3FB}-\\u{1F3FF}]', // skin-tone modifier
  'gu',
)

/**
 * インラインの太字・アイコン記法を剥がす（太字は中身を残す、アイコンは丸ごと除去）。
 * 読み上げ用なので:
 * - ペアにならず残った `**`（2 個以上連続のアスタリスク）も除去する
 *   —「アスタリスク」と読み上げる事故を防ぐため。単独の `*`（脚注 *1 等）は残す。
 * - アイコントークン（`[icon:name]`）は読み上げ対象から完全に外す（value を持たない）。
 * - 絵文字も除去する（TTS が絵文字名を読み上げる事故を防ぐ）。
 */
function stripInline(text: string): string {
  const tokens = parseInline(text)
  // icon トークンは value を持たないので空文字に畳む。text/bold は value を残す。
  const joined = tokens.map((tk) => (tk.type === 'icon' ? '' : tk.value)).join('')
  // 連続アスタリスク（**, *** ...）を除去。単独 * は temporarily 残す。
  const noAsterisk = joined.replace(/\*{2,}/g, '')
  // 絵文字を除去（残った余分な連続スペースは normalizeForSpeech 側で吸収される）。
  return noAsterisk.replace(EMOJI_RE, '')
}
