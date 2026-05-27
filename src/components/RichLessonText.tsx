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
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { parseRichText, type Block, type CalloutKind, type InlineToken } from '../richText'
import {
  LightbulbIcon,
  FlagIcon,
  CheckCircleIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
  BrainIcon,
  StarIcon,
  ZapIcon,
  ClockIcon,
  ThumbsUpIcon,
  SearchIcon,
  BarChartIcon,
  BookOpenIcon,
  ClipboardListIcon,
  MessageSquareIcon,
  TrophyIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  RefreshIcon,
  BandageIcon,
  FootprintsIcon,
  MicIcon,
} from '../icons'

/**
 * インラインアイコン名 → SVG コンポーネントの対応表。
 *
 * レッスン本文（lesson body / explain step の body）で `[icon:name]` 記法を使うときの
 * name はここに登録されたキーに限る。未登録 name は描画されない（無害フォールバック）。
 *
 * 正準アイコン名（執筆時はこれを使う）:
 * - good  → CheckIcon（良い例・できること）
 * - bad   → XIcon（悪い例・できないこと）
 * - point → CheckCircleIcon（要点・結論。callout の :::point と意味/見た目を統一）
 * - warn  → FlagIcon（注意・落とし穴）
 *
 * エイリアス（内部互換用。執筆では使わない）:
 * - ok / check       → good 相当（CheckIcon）
 * - ng / cross       → bad 相当（XIcon）
 * - idea / tip / bulb → LightbulbIcon（気づき・コツ。要点 point とは役割分担）
 * - caution / flag   → warn 相当（FlagIcon）
 * 他はアイコン名に対応する SVG をそのまま割り当て。
 */
const ICON_REGISTRY: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  // 良い例 / できる / 正しい
  check: CheckIcon,
  good: CheckIcon,
  ok: CheckIcon,
  // 悪い例 / できない / 誤り
  x: XIcon,
  bad: XIcon,
  ng: XIcon,
  cross: XIcon,
  // 要点・結論（callout :::point と統一）
  point: CheckCircleIcon,
  // 気づき・コツ（要点 point とは別役割）
  idea: LightbulbIcon,
  tip: LightbulbIcon,
  bulb: LightbulbIcon,
  // 注意・落とし穴
  warn: FlagIcon,
  caution: FlagIcon,
  flag: FlagIcon,
  // 結論・達成
  conclusion: CheckCircleIcon,
  done: CheckCircleIcon,
  // 直接アイコン名指定
  brain: BrainIcon,
  star: StarIcon,
  zap: ZapIcon,
  clock: ClockIcon,
  thumbsup: ThumbsUpIcon,
  search: SearchIcon,
  sparkles: SparklesIcon,
  chart: BarChartIcon,
  book: BookOpenIcon,
  list: ClipboardListIcon,
  message: MessageSquareIcon,
  trophy: TrophyIcon,
  arrow: ArrowRightIcon,
  up: ArrowUpIcon,
  refresh: RefreshIcon,
  bandage: BandageIcon,
  footprints: FootprintsIcon,
  mic: MicIcon,
}

/**
 * callout kind 別のアイコン・色定義。
 *
 * 4 kind を視覚弁別できるよう、アイコン（形）と色を kind ごとに割り当てる。
 * 色は light/dark 両テーマで定義済みのデザイントークンのみ（hex 直書きしない）。
 * - warn  : 注意・落とし穴 → FlagIcon ＋警告色（amber 系 --warning）
 * - point : 要点・結論     → CheckCircleIcon ＋ブランド色
 * - tip   : コツ・気づき   → LightbulbIcon ＋アクセント色
 * - note  : 補足           → BookOpenIcon ＋中立色（--bg-secondary / --text-secondary）
 *
 * accent = アイコン色＋左ボーダー色、bg = ボックス背景色。
 */
const CALLOUT_STYLE: Record<
  CalloutKind,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; accent: string; bg: string }
> = {
  warn: { Icon: FlagIcon, accent: 'var(--warning)', bg: 'var(--warning-soft)' },
  point: { Icon: CheckCircleIcon, accent: 'var(--brand)', bg: 'var(--brand-soft)' },
  tip: { Icon: LightbulbIcon, accent: 'var(--accent)', bg: 'var(--accent-soft)' },
  note: { Icon: BookOpenIcon, accent: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
}

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
  return tokens.map((tk, i) => {
    if (tk.type === 'bold') {
      return (
        <strong key={i} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {tk.value}
        </strong>
      )
    }
    if (tk.type === 'icon') {
      const Icon = ICON_REGISTRY[tk.name]
      // 未登録 name は描画しない（無害フォールバック、クラッシュさせない）
      if (!Icon) return null
      return (
        <span
          key={i}
          aria-hidden="true"
          style={{
            // テキストに溶け込む inline-flex。文字サイズ相当・色は currentColor 継承。
            display: 'inline-flex',
            alignItems: 'center',
            verticalAlign: 'text-bottom',
            width: '1em',
            height: '1em',
            // 前後の文字との間に半角分の余白（隣接文字とくっつかないように）
            margin: '0 0.15em',
            color: 'inherit',
          }}
        >
          <Icon width="1em" height="1em" />
        </span>
      )
    }
    return <span key={i}>{tk.value}</span>
  })
}

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const text = block.tokens.map((t) => (t.type === 'icon' ? '' : t.value)).join('')
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
                // 中黒「・」グリフは左右に内蔵余白があるため gap は詰める。
                gap: 'var(--s-1)',
                fontSize: 16,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  // 中黒「・」をテキストとして描画。フォント由来なので本文と縦位置が揃い、
                  // 行の高さに追従する（青丸 + translateY のズレを廃止）。
                  color: 'var(--text-secondary)',
                  fontSize: 16,
                  lineHeight: 1.8,
                  userSelect: 'none',
                }}
              >
                ・
              </span>
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
    case 'callout': {
      // kind 別のアイコン＋色。色はテーマ変数のみ（hex 直書きしない）。
      // light/dark 両テーマで定義済みのトークンだけを使い、4 kind を視覚弁別する。
      // - warn  : FlagIcon + 警告色（--warning / --warning-soft）
      // - point : CheckCircleIcon + ブランド色（要点・結論）
      // - tip   : LightbulbIcon + アクセント色（コツ・気づき）
      // - note  : BookOpenIcon + 中立色（補足）
      const style = CALLOUT_STYLE[block.kind]
      const CalloutIcon = style.Icon
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            gap: 'var(--s-3)',
            margin: '0 0 var(--s-4)',
            padding: 'var(--s-4)',
            background: style.bg,
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            borderLeft: `3px solid ${style.accent}`,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              flexShrink: 0,
              color: style.accent,
              transform: 'translateY(0.1em)',
            }}
          >
            <CalloutIcon width={18} height={18} aria-hidden="true" />
          </span>
          {/* 中身を再帰描画。最後の段落の下マージンが余白二重にならないよう margin を畳む */}
          <div style={{ flex: 1, marginBottom: 'calc(var(--s-4) * -1)' }}>
            {block.blocks.map((b, i) => renderBlock(b, i))}
          </div>
        </div>
      )
    }
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
