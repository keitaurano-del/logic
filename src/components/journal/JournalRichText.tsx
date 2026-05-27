/**
 * JournalRichText — ジャーナルの AI 応答（holistic feedback / ai_summary）用の軽量整形描画。
 *
 * Claude API の応答には `**太字**` などの markdown サブセットが混ざることがあり、
 * プレーン表示（white-space: pre-wrap）だと生の `**` が画面に出てしまう。
 * ここでは重い依存を足さず、src/richText.ts の `parseInline` を流用して
 * `**bold**` を `<strong>` に整形し、それ以外の記号は記号を出さずに描画する。
 *
 * レッスン本文用の RichLessonText とは別物（見出し・callout・bullet・icon 等の
 * 過剰な変換はかけない）。AI 応答はほぼプレーン文 + たまに太字、という前提で、
 * 改行（段落区切り・行内改行）だけ保ったまま太字を整形する。
 *
 * - 空行（2 連続改行）→ 段落区切り
 * - 単一改行 → <br>
 * - `**...**` → <strong>（richText.parseInline の bold トークン）
 * - `[icon:name]` トークンは描画しない（journal では使わない想定。来ても記号を出さない）
 * - 生 `*` 単独や閉じない `**` は parseInline 側が literal text として残すが、
 *   念のため描画後に孤立した連続アスタリスクが出ないよう parseInline の挙動に委ねる。
 */
import type { ReactNode } from 'react'
import { parseInline, type InlineToken } from '../../richText'

interface JournalRichTextProps {
  text: string
  className?: string
}

function renderInlineTokens(tokens: InlineToken[], keyPrefix: string): ReactNode[] {
  return tokens.map((tk, i) => {
    if (tk.type === 'bold') {
      return (
        <strong key={`${keyPrefix}-b-${i}`} style={{ fontWeight: 700 }}>
          {tk.value}
        </strong>
      )
    }
    // icon トークンは journal では描画しない（記号も出さない）
    if (tk.type === 'icon') return null
    // 閉じない `**`（連続アスタリスク 2 個以上）は parseInline が literal text として
    // 残すため、生 `**` が画面に出ないよう除去する。単独 `*`（脚注 *1 等）は残す。
    const value = tk.value.replace(/\*{2,}/g, '')
    return <span key={`${keyPrefix}-t-${i}`}>{value}</span>
  })
}

/**
 * 行頭の markdown マーカー（見出し `#`、箇条書き `- ` / `* ` / `・`）を剥がす。
 * AI 応答にこれらが混ざってもプレーン文として読めるようにする（記号を画面に出さない）。
 * リスト記号は中黒「・」に寄せて視覚的に箇条書きとして読めるようにする。
 */
function stripLineMarker(line: string): string {
  // 見出しマーカー `## ` 等 → マーカーだけ除去（本文は残す）
  const heading = line.match(/^#{1,6}\s+(.*)$/)
  if (heading) return heading[1]
  // 箇条書き `- ` / `* ` / `+ ` → 中黒に置換
  const bullet = line.match(/^[-*+]\s+(.*)$/)
  if (bullet) return `・${bullet[1]}`
  return line
}

/** 1 段落内の単一改行を <br> で保持しつつインライン整形する。 */
function renderParagraph(paragraph: string, key: number): ReactNode {
  const lines = paragraph.split('\n').map(stripLineMarker)
  const children: ReactNode[] = []
  lines.forEach((line, li) => {
    if (li > 0) children.push(<br key={`br-${key}-${li}`} />)
    children.push(...renderInlineTokens(parseInline(line), `p${key}-l${li}`))
  })
  // 段落間マージンは journal-summary-card__body の `p + p` で付与する（CSS 側に集約）。
  return (
    <p key={key} style={{ margin: 0, lineHeight: 'inherit' }}>
      {children}
    </p>
  )
}

export function JournalRichText({ text, className }: JournalRichTextProps) {
  const normalized = (text ?? '').replace(/\r\n/g, '\n').trim()
  // 空行（1 つ以上の空行）で段落分割。空段落は捨てる。
  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className={className}>
      {paragraphs.map((p, i) => renderParagraph(p, i))}
    </div>
  )
}

export default JournalRichText
