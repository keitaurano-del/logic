/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import { tutorial } from './tutorialStorage'

interface CoachmarkProps {
  /** ハイライト対象要素のref */
  targetRef: React.RefObject<HTMLElement | null>
  /** コーチマーク閉じたとき（スキップ or タップ） */
  onDismiss: () => void
}

export function HomeCoachmark({ targetRef, onDismiss }: CoachmarkProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (targetRef.current) {
      setRect(targetRef.current.getBoundingClientRect())
    }
  }, [targetRef])

  const dismiss = () => {
    tutorial.markHome()
    onDismiss()
  }

  if (!rect) return null

  const PADDING = 8
  const h = { top: rect.top - PADDING, left: rect.left - PADDING, width: rect.width + PADDING * 2, height: rect.height + PADDING * 2 }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'transparent',
      }}
    >
      {/* オーバーレイ全体をボタン化（背景タップで dismiss） */}
      <button
        type="button"
        aria-label="チュートリアルを閉じる"
        onClick={dismiss}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      />
      {/* 上 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h.top, background: 'rgba(0,0,0,0.72)', pointerEvents: 'none' }} />
      {/* 左 */}
      <div style={{ position: 'absolute', top: h.top, left: 0, width: h.left, height: h.height, background: 'rgba(0,0,0,0.72)', pointerEvents: 'none' }} />
      {/* 右 */}
      <div style={{ position: 'absolute', top: h.top, left: h.left + h.width, right: 0, height: h.height, background: 'rgba(0,0,0,0.72)', pointerEvents: 'none' }} />
      {/* 下 */}
      <div style={{ position: 'absolute', top: h.top + h.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.72)', pointerEvents: 'none' }} />

      {/* ハイライト枠 */}
      <div
        style={{
          position: 'absolute',
          top: h.top, left: h.left, width: h.width, height: h.height,
          borderRadius: 16,
          boxShadow: '0 0 0 3px rgba(255,255,255,0.6)',
          pointerEvents: 'none',
        }}
      />

      {/* 吹き出し */}
      <div
        style={{
          position: 'absolute',
          top: h.top + h.height + 16,
          left: 16, right: 16,
          background: 'var(--bg-card)',
          borderRadius: 14,
          padding: '16px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}
      >
        {/* 三角 */}
        <div style={{
          position: 'absolute', top: -8, left: 32,
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #fff',
        }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          まずここから始めましょう。<br />タップして今日の問題を開いてみましょう。
        </p>
        <button
          onClick={dismiss}
          style={{
            marginTop: 14, width: '100%',
            background: '#6C8EF5', color: '#fff',
            border: 'none', borderRadius: 10, padding: '12px 0',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          さっそくやってみよう！
        </button>
      </div>

      {/* スキップ */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', bottom: 40, right: 20,
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer',
        }}
      >
        スキップする
      </button>
    </div>
  )
}

/** ホーム画面でコーチマークを表示すべきか */
export function useShouldShowHomeCoachmark() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    // 少し遅延させて画面描画後に表示
    const t = setTimeout(() => {
      if (!tutorial.hasSeenHome()) setShow(true)
    }, 600)
    return () => clearTimeout(t)
  }, [])
  return [show, () => setShow(false)] as const
}
