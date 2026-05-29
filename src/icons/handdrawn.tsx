/**
 * 手描きアクセント素材（UI 刷新 第2弾・方針 A: エディトリアル×手描き図解）
 *
 * 正本: docs/UI_RENEWAL_ASSETS_20260529.md（designer / 凜）の SVG path をそのまま React 化。
 * - すべて単色 stroke のみ（fill なし）。stroke="currentColor" なので親要素の
 *   `color: var(--accent)` 等でテーマ追従する（直書き hex は残さない）。
 * - viewBox は素材ごとに固有。CSS の width/height でサイズ調整（線幅は viewBox 比で伸縮）。
 * - 装飾要素なので aria-hidden（意味は隣接テキストが担う）。
 *
 * 命名は feedback_logic_lesson_visual_hybrid のアイコン命名規則（小文字+ハイフン）に
 * 対応するキャメルケースのコンポーネント名で公開する。
 */
import type { SVGProps } from 'react'

type AccentProps = SVGProps<SVGSVGElement>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** underline-single — 見出し直下の基本下線。一番出番が多い。 */
export function UnderlineSingle(p: AccentProps) {
  return (
    <svg viewBox="0 0 240 40" aria-hidden="true" {...p}>
      <path d="M8 26 C 60 18, 110 30, 162 22 S 220 18, 232 24" {...stroke} />
    </svg>
  )
}

/** underline-double — 二重下線。より強い強調・章タイトル向け。 */
export function UnderlineDouble(p: AccentProps) {
  return (
    <svg viewBox="0 0 240 48" aria-hidden="true" {...p}>
      <path d="M8 20 C 60 13, 120 25, 232 17" {...stroke} />
      <path d="M14 34 C 70 29, 130 39, 226 31" {...stroke} />
    </svg>
  )
}

/** underline-scribble — 走り書き下線。カジュアルな強調・空状態の見出し向け。 */
export function UnderlineScribble(p: AccentProps) {
  return (
    <svg viewBox="0 0 240 44" aria-hidden="true" {...p}>
      <path d="M10 30 C 50 18, 70 34, 110 22 S 170 34, 200 22 220 28 232 24" {...stroke} />
    </svg>
  )
}

/** frame-circle — 手描きの楕円囲み。1単語・1数字を丸で囲む強調。 */
export function FrameCircle(p: AccentProps) {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" {...p}>
      <path d="M40 22 C 90 8, 165 12, 182 48 C 196 80, 150 108, 96 108 C 40 108, 8 86, 12 54 C 15 30, 30 22, 60 18" {...stroke} />
    </svg>
  )
}

/** frame-box — 手描きの四角囲み。短いフレーズ・ラベルの囲み。 */
export function FrameBox(p: AccentProps) {
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true" {...p}>
      <path d="M16 24 C 80 16, 150 20, 206 18 M204 16 C 210 50, 208 80, 206 102 M208 100 C 150 110, 70 104, 18 106 M16 104 C 10 70, 12 46, 14 22" {...stroke} />
    </svg>
  )
}

/** arrow-right — 横方向の手描き矢印。「A → B」の関係、CTA 誘導。 */
export function ArrowRightHand(p: AccentProps) {
  return (
    <svg viewBox="0 0 220 80" aria-hidden="true" {...p}>
      <path d="M12 44 C 70 36, 130 50, 196 40" {...stroke} />
      <path d="M176 22 C 188 30, 196 38, 200 40 C 194 46, 186 56, 178 66" {...stroke} />
    </svg>
  )
}

/** arrow-curved — 曲がる矢印。注釈から要素を指す・補足の引き出し。 */
export function ArrowCurved(p: AccentProps) {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" {...p}>
      <path d="M24 22 C 14 64, 60 100, 150 92" {...stroke} />
      <path d="M128 76 C 140 84, 150 90, 156 92 C 148 98, 140 106, 134 114" {...stroke} />
    </svg>
  )
}

/** arrow-down — 縦方向の矢印。ロードマップのステップ降下・縦の流れ。 */
export function ArrowDownHand(p: AccentProps) {
  return (
    <svg viewBox="0 0 80 120" aria-hidden="true" {...p}>
      <path d="M40 14 C 36 50, 44 80, 40 104" {...stroke} />
      <path d="M20 84 C 30 94, 36 100, 40 106 C 46 100, 54 92, 62 82" {...stroke} />
    </svg>
  )
}

/** mark-check — 手描きチェック。完了・正解・良い例マーカー。 */
export function MarkCheck(p: AccentProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...p}>
      <path d="M22 54 C 30 62, 36 70, 44 80 C 56 56, 70 34, 86 18" {...stroke} />
    </svg>
  )
}

/** mark-cross — 手描きバツ。誤り・悪い例マーカー（check と対で使う）。 */
export function MarkCross(p: AccentProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...p}>
      <path d="M24 22 C 40 40, 58 60, 78 80" {...stroke} />
      <path d="M78 22 C 60 42, 42 60, 22 80" {...stroke} />
    </svg>
  )
}

/** mark-circle-dot — 手描きの小さな丸。箇条書きの bullet・チェックリストの○。 */
export function MarkCircleDot(p: AccentProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...p}>
      <path d="M40 16 C 70 14, 90 36, 84 60 C 78 84, 44 90, 26 74 C 10 60, 16 26, 46 18" {...stroke} />
    </svg>
  )
}

/** mark-sparkle — 4点の手描ききらめき。達成・新着・ハイライト（旧 🎉✨ の SVG 置換候補）。 */
export function MarkSparkle(p: AccentProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...p}>
      <path d="M50 14 C 54 36, 58 44, 80 50 C 58 56, 54 64, 50 86 C 46 64, 42 56, 20 50 C 42 44, 46 36, 50 14 Z" {...stroke} />
    </svg>
  )
}

/** wave-divider — 波線の区切り。セクション間の hairline 代替・装飾区切り。 */
export function WaveDivider(p: AccentProps) {
  return (
    <svg viewBox="0 0 240 40" aria-hidden="true" {...p}>
      <path d="M8 22 C 28 8, 48 36, 68 22 C 88 8, 108 36, 128 22 C 148 8, 168 36, 188 22 C 208 8, 228 16, 232 20" {...stroke} />
    </svg>
  )
}

/** bracket-heading-tick — 見出し左肩の鉤括弧。セクション見出しの前置きマーク。 */
export function BracketHeadingTick(p: AccentProps) {
  return (
    <svg viewBox="0 0 240 56" aria-hidden="true" {...p}>
      <path d="M14 12 C 12 24, 13 36, 16 44" {...stroke} />
      <path d="M14 12 C 60 8, 130 9, 226 7" {...stroke} />
    </svg>
  )
}

/** lines-list-hint — 3本の手描き線。空状態の「ここに項目が並びます」プレースホルダ挿絵。 */
export function LinesListHint(p: AccentProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...p}>
      <path d="M16 30 C 40 26, 70 24, 88 26 M16 50 C 40 46, 64 45, 80 47 M16 70 C 36 67, 52 66, 64 68" {...stroke} />
    </svg>
  )
}

/** callout-speech — 手描きの吹き出し。ヒント・気づきの装飾枠。 */
export function CalloutSpeech(p: AccentProps) {
  return (
    <svg viewBox="0 0 200 130" aria-hidden="true" {...p}>
      <path d="M28 18 C 100 10, 178 14, 184 50 C 188 78, 160 92, 96 92 L70 92 L48 116 L52 90 C 24 84, 12 66, 14 46 C 16 28, 18 22, 34 18" {...stroke} />
    </svg>
  )
}
