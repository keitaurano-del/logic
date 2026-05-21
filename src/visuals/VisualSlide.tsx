import type { ReactNode } from 'react'
import { SparklesIcon } from '../icons'

type Props = {
  title?: string
  caption?: string
  children: ReactNode
  /**
   * フルブリードモード。スマホで Visual を画面いっぱいに表示する用。
   * 外側コンテナの padding (24px) を打ち消し、内側カードの padding を最小化する。
   * Pyramid のプロトタイプとして導入。後方互換のためデフォルト false。
   */
  fullBleed?: boolean
}

/**
 * 概念図解スライド共通の wrapper
 * Logic v3 本体トーン（Slate Blue / Inter）で統一
 */
export function VisualSlide({ title, caption, children, fullBleed = false }: Props) {
  // fullBleed 時は親コンテナ (padding 24px) を打ち消す negative margin を当てる
  // 外側ラッパーだけ全幅にし、title / caption は元の余白内に残す
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--accent-soft)',
        borderRadius: 99,
        padding: '6px 12px',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--brand)',
        alignSelf: 'flex-start',
        letterSpacing: '.04em',
      }}>
        <SparklesIcon width={12} height={12} />
        図解で理解する
      </span>

      {title && (
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.35,
          margin: 0,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h1>
      )}

      <div
        data-fullbleed={fullBleed || undefined}
        style={{
          background: 'var(--bg-card)',
          border: fullBleed ? 'none' : '1px solid var(--border-light)',
          borderRadius: fullBleed ? 0 : 16,
          padding: fullBleed ? '12px 8px' : 16,
          boxShadow: fullBleed ? 'none' : 'var(--shadow-card)',
          // LessonStoriesScreen の左右 padding (24px) を打ち消して画面いっぱいに
          marginLeft: fullBleed ? -24 : 0,
          marginRight: fullBleed ? -24 : 0,
        }}
      >
        {children}
      </div>

      {caption && (
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {caption}
        </p>
      )}
    </div>
  )
}
