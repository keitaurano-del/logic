/**
 * LevelUpModal - Phase 1
 *
 * レッスン完了でレベルが上がった瞬間に表示するフルスクリーンモーダル。
 *   - 数字カウントアップアニメ (prevLevel → newLevel)
 *   - 紙吹雪 (canvas-confetti)
 *   - Capacitor Haptics で軽い振動 (heavy 一発)
 */
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import { getCurrentLevel } from '../screens/homeHelpers'
import './levelup.css'

interface Props {
  prevLevel: number
  newLevel: number
  onClose: () => void
}

function useCountUp(from: number, to: number, duration = 800, delay = 400) {
  const [val, setVal] = useState(from)
  useEffect(() => {
    if (from === to) return
    const timer = setTimeout(() => {
      const start = Date.now()
      const diff = to - from
      const tick = () => {
        const elapsed = Date.now() - start
        const t = Math.min(elapsed / duration, 1)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3)
        setVal(Math.round(from + diff * eased))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [from, to, duration, delay])
  return val
}

/**
 * 軽量・1.5秒くらいの紙吹雪。
 * unmount 時に停止できるよう interval id を返す。
 * canvas-confetti は内部で document.body に <canvas> を生やすグローバル portal なので
 * cleanup 側で `confetti.reset()` も必ず呼んで canvas を消すこと。
 */
function fireConfetti(): number {
  const duration = 1500
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 32,
    spread: 360,
    ticks: 60,
    zIndex: 10001,
    colors: ['#6C8EF5', '#8B5CF6', '#3D5FC4', '#FFD700', '#FFFFFF'],
  }
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }
    const particleCount = 30 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.3 + 0.1 },
    })
  }, 220)
  return interval
}

export function LevelUpModal({ prevLevel, newLevel, onClose }: Props) {
  const animatedLevel = useCountUp(prevLevel, newLevel, 800, 500)
  const lv = getCurrentLevel((newLevel - 1) * 101) // for color
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    haptic.heavy()
    const intervalId = fireConfetti()
    // unmount 時に interval を止め、グローバル canvas もクリアする
    // (画面遷移などで onClose を経由せず unmount された場合の残留対策)
    return () => {
      clearInterval(intervalId)
      confetti.reset()
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lvup-title"
      className="lvup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(8, 12, 30, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="lvup-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(100%, 360px)',
          background: 'var(--bg-card)',
          borderRadius: 24,
          padding: '36px 28px 28px',
          boxShadow: '0 18px 64px rgba(0,0,0,.5), 0 0 0 1px color-mix(in srgb, var(--brand) 35%, transparent)',
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {/* 上端のラベル */}
        <div
          className="lvup-title"
          id="lvup-title"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '.18em',
            color: 'var(--brand)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {t('levelup.heading')}
        </div>

        {/* メイン: 数字カウントアップ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 4,
            margin: '10px 0 6px',
            color: lv.color,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            letterSpacing: '-.04em',
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 22, color: 'var(--text-muted)' }}>Lv.</span>
          <span style={{ fontSize: 88, textShadow: `0 0 24px color-mix(in srgb, ${lv.color} 60%, transparent)` }}>
            {animatedLevel}
          </span>
        </div>

        {/* prev → new */}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22, fontWeight: 600 }}>
          Lv.{prevLevel} <span style={{ color: 'var(--text-muted)' }}>→</span>{' '}
          <span style={{ color: lv.color, fontWeight: 800 }}>Lv.{newLevel}</span>
        </div>

        {/* メッセージ */}
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          {t('levelup.message')}
        </div>

        {/* 閉じる */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            background: 'var(--brand)',
            color: 'var(--accent-fg, #fff)',
            padding: '14px 0',
            borderRadius: 99,
            fontSize: 15,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '.02em',
            boxShadow: '0 6px 18px color-mix(in srgb, var(--brand) 35%, transparent)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          {t('levelup.next')}
        </button>
      </div>
    </div>
  )
}
