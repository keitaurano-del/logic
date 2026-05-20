import type { ReactNode } from 'react'
import { SparklesIcon } from '../icons'

type Props = {
  title?: string
  caption?: string
  children: ReactNode
}

/**
 * 概念図解スライド共通の wrapper
 * Logic v3 本体トーン（Slate Blue / Inter）で統一
 */
export function VisualSlide({ title, caption, children }: Props) {
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

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
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
