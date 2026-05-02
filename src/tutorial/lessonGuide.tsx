import { useEffect, useState } from 'react'
import { tutorial } from './tutorialStorage'

/**
 * レッスン左右タップガイド
 * 初回のみ、左右ゴーストを1.2秒表示してフェードアウト
 */
export function LessonTapGuide() {
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(0.45)

  useEffect(() => {
    if (tutorial.hasSeenLesson()) return
    // 少し遅延して表示
    const showTimer = setTimeout(() => setVisible(true), 400)
    // 1.2秒後にフェードアウト開始
    const fadeTimer = setTimeout(() => setOpacity(0), 1600)
    // フェード完了後に非表示
    const hideTimer = setTimeout(() => {
      setVisible(false)
      tutorial.markLesson()
    }, 2200)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  const style: React.CSSProperties = {
    transition: 'opacity 0.6s ease',
    opacity,
    pointerEvents: 'none',
  }

  return (
    <>
      {/* 左エリア */}
      <div style={{
        ...style,
        position: 'fixed',
        top: '50%', left: '10%',
        transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#fff', fontSize: 15, fontWeight: 600,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        zIndex: 100,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        戻る
      </div>
      {/* 右エリア */}
      <div style={{
        ...style,
        position: 'fixed',
        top: '50%', right: '10%',
        transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#fff', fontSize: 15, fontWeight: 600,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        zIndex: 100,
      }}>
        次へ
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </>
  )
}
