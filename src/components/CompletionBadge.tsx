/**
 * CompletionBadge - レッスンの完了回数を視覚化する小さなコンポーネント。
 *
 * 仕様:
 *  - count = 0: 何も描画しない (null を返す)
 *  - count = 1: チェックマーク + フル塗りつぶしの円 (通常の「完了」表示)
 *  - count = 2: チェックマーク + 半分塗りつぶし (リング状) + 数字「2」
 *  - count = 3+: チェックマーク + フル塗りつぶし + 数字「3」「4」… (上限 9+)
 *
 * 配色は brand トークンに統一。半塗りは conic-gradient で 50% リングを表現。
 */
import React from 'react'

interface Props {
  count: number
  size?: number
}

function formatCount(count: number): string {
  if (count >= 10) return '9+'
  return String(count)
}

export function CompletionBadge({ count, size = 28 }: Props) {
  if (count <= 0) return null

  const fontSize = Math.max(10, Math.round(size * 0.42))
  const ringStroke = Math.max(2, Math.round(size * 0.12))

  // 1 回目はチェックマーク (既存の done バッジと同等の見え方)。
  if (count === 1) {
    return (
      <div
        aria-label="1 回完了"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size * 0.43}
          height={size * 0.43}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }

  // 2 回目: 半分リング (左半分のみ塗る) + 数字「2」
  if (count === 2) {
    return (
      <div
        aria-label="2 回完了"
        title="2 回完了"
        style={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        {/* 背景の薄いリング */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `color-mix(in srgb, var(--brand) 15%, transparent)`,
          }}
        />
        {/* 半分だけ塗る (左半分が brand、右半分が透明) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from 180deg, var(--brand) 0deg 180deg, transparent 180deg 360deg)`,
          }}
        />
        {/* 中心の数字 (背景は白丸で抜く) */}
        <div
          style={{
            position: 'absolute',
            inset: ringStroke,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 800,
            color: 'var(--brand)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          2
        </div>
      </div>
    )
  }

  // 3 回以上: フル塗りつぶし + 数字
  const label = formatCount(count)
  return (
    <div
      aria-label={`${count} 回完了`}
      title={`${count} 回完了`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize,
        fontWeight: 800,
        color: '#fff',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        boxShadow: `0 0 0 2px color-mix(in srgb, var(--brand) 25%, transparent)`,
      }}
    >
      {label}
    </div>
  )
}

