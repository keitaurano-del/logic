/**
 * RichLessonText — レッスン本文の軽量リッチテキスト描画。
 *
 * 既存レッスン content（markdown サブセット）を安全にパースして JSX で描画する。
 * react-markdown 等の重い依存は使わず、src/richText.ts の自前パーサを使う。
 *
 * サポート記法:
 * - 太字 `**...**`
 * - 箇条書き（行頭 `- ` / `・`）
 * - 番号リスト（行頭 `1. ` 等）
 * - 見出し `## ` / `### `（先頭ラベルに応じて小さな SVG アイコンを添える）
 * - コードフェンス ``` ```
 *
 * 絵文字は使わない（設計ルール）。アイコンは src/icons の SVG のみ。
 * 色・余白はデザイントークン（var(--brand) 等）を使用、hex 直書きしない。
 */
import type { ReactNode } from 'react'
import { parseRichText, type Block, type InlineToken } from '../richText'
import { LightbulbIcon, FlagIcon, CheckCircleIcon, SparklesIcon } from '../icons'

interface RichLessonTextProps {
  content: string
  /** ルート要素の className（任意）。 */
  className?: string
}

/** 見出しテキストの先頭ラベルから添えるアイコンを判定する。無ければ null。 */
function headingIcon(text: string): ReactNode {
  const head = text.replace(/[【[]/g, '').slice(0, 8)
  if (/ポイント|要点|まとめ|結論/.test(head)) {
    return <CheckCircleIcon width={16} height={16} aria-hidden="true" />
  }
  if (/注意|警告|落とし穴|NG/.test(head)) {
    return <FlagIcon width={16} height={16} aria-hidden="true" />
  }
  if (/ヒント|コツ|考え方|TIP/i.test(head)) {
    return <LightbulbIcon width={16} height={16} aria-hidden="true" />
  }
  if (/例|ケース|サンプル/.test(head)) {
    return <SparklesIcon width={16} height={16} aria-hidden="true" />
  }
  return null
}

function renderInline(tokens: InlineToken[]): ReactNode[] {
  return tokens.map((tk, i) =>
    tk.type === 'bold' ? (
      <strong key={i} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
        {tk.value}
      </strong>
    ) : (
      <span key={i}>{tk.value}</span>
    ),
  )
}

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const text = block.tokens.map((t) => t.value).join('')
      const icon = headingIcon(text)
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s-2)',
            marginTop: 'var(--s-5)',
            marginBottom: 'var(--s-2)',
            color: 'var(--brand)',
            fontSize: block.level === 2 ? 18 : 16,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {icon && (
            <span style={{ display: 'inline-flex', flexShrink: 0, color: 'var(--brand)' }}>{icon}</span>
          )}
          <span>{renderInline(block.tokens)}</span>
        </div>
      )
    }
    case 'bullets':
      return (
        <ul
          key={key}
          style={{
            listStyle: 'none',
            margin: '0 0 var(--s-4)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
          }}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--s-3)',
                fontSize: 16,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 6,
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--brand)',
                  transform: 'translateY(0.5em)',
                }}
              />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    case 'numbers':
      return (
        <ol
          key={key}
          style={{
            listStyle: 'none',
            margin: '0 0 var(--s-4)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
            counterReset: 'rich-num',
          }}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--s-3)',
                fontSize: 16,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  minWidth: 22,
                  height: 22,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--brand-soft)',
                  color: 'var(--brand)',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(0.15em)',
                  padding: '0 6px',
                }}
              >
                {item.marker.replace('.', '')}
              </span>
              <span>{renderInline(item.tokens)}</span>
            </li>
          ))}
        </ol>
      )
    case 'code':
      return (
        <pre
          key={key}
          style={{
            margin: '0 0 var(--s-4)',
            padding: 'var(--s-4)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          }}
        >
          {block.text}
        </pre>
      )
    case 'paragraph':
    default:
      return (
        <p
          key={key}
          style={{
            fontSize: 17,
            lineHeight: 1.85,
            fontWeight: 400,
            color: 'var(--text-primary)',
            margin: '0 0 var(--s-4)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderInline(block.tokens)}
        </p>
      )
  }
}

export function RichLessonText({ content, className }: RichLessonTextProps) {
  const blocks = parseRichText(content)
  return (
    <div className={className} style={{ marginBottom: 'calc(var(--s-4) * -1)' }}>
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  )
}

export default RichLessonText
