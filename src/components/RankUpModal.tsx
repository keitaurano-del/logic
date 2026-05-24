/**
 * RankUpModal - Phase 2 (称号獲得・豪華版)
 *
 * 16段階の称号 (TitleKey) が変わった瞬間に表示する。
 *   - 称号バッジ画像が回転しながら降りてくる
 *   - 周囲に放射状スパークル光線 (lvup-sparkle-rotate + pulse)
 *   - 豪華目の紙吹雪 (Phase1 より粒数 1.8倍 + 色を金・銀含む)
 *   - Capacitor Haptics で2連発 (heavy → success)
 */
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import { getBadgeImagePath, getTitleI18nKey, type TitleKey } from '../screens/homeHelpers'
import './levelup.css'

interface Props {
  prevTitleKey: TitleKey
  newTitleKey: TitleKey
  newLevel: number
  onClose: () => void
}

/**
 * 豪華目の紙吹雪。unmount 時に止められるよう interval id を返す。
 * canvas-confetti は document.body に canvas を生やすグローバル portal なので
 * cleanup 側で `confetti.reset()` を必ず呼んで canvas をクリアする。
 */
function fireRankConfetti(): number {
  const duration = 2200
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 38,
    spread: 360,
    ticks: 70,
    zIndex: 10001,
    colors: ['#FFD700', '#FFC04C', '#FFFFFF', '#6C8EF5', '#8B5CF6', '#3D5FC4', '#E0E0E0'],
  }

  // 初回ドーンと大量
  confetti({
    ...defaults,
    particleCount: 90,
    origin: { x: 0.5, y: 0.45 },
  })

  // その後ぱらぱら降らせる
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }
    const particleCount = 55 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.3 + 0.05 },
    })
  }, 240)
  return interval
}

/** 中央のバッジ周辺に描く 12 本の放射状ライン */
function SparkleBurst() {
  // 12 本のライン (透明 SVG で軽量に)
  const lines = Array.from({ length: 12 }, (_, i) => i)
  return (
    <div
      aria-hidden="true"
      className="lvup-sparkle-rotate"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        className="lvup-sparkle-pulse"
        style={{
          position: 'relative',
          width: 220,
          height: 220,
        }}
      >
        {lines.map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: 88,
              marginLeft: -1.5,
              marginTop: -44,
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brand) 70%, transparent) 35%, #FFD700 100%)',
              transform: `rotate(${(360 / lines.length) * i}deg) translateY(-72px)`,
              transformOrigin: 'center 44px',
              borderRadius: 2,
              filter: 'blur(.5px)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function RankUpModal({ prevTitleKey, newTitleKey, newLevel, onClose }: Props) {
  const firedRef = useRef(false)
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    haptic.heavy()
    const intervalId = fireRankConfetti()
    const t1 = setTimeout(() => haptic.success(), 350)
    const t2 = setTimeout(() => setPhase(1), 1000)
    const t3 = setTimeout(() => setPhase(2), 1600)
    // unmount 時に紙吹雪 interval と canvas をクリアする
    // (画面遷移などで onClose を経由せず unmount された場合の残留対策)
    return () => {
      clearInterval(intervalId)
      confetti.reset()
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rankup-title"
      className="lvup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 8, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          width: 'min(100%, 380px)',
          background: 'var(--bg-card)',
          borderRadius: 24,
          padding: '36px 24px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,.6), 0 0 0 1px color-mix(in srgb, var(--brand) 45%, transparent), 0 0 60px color-mix(in srgb, var(--brand) 30%, transparent)',
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {/* 上端: 「新しい称号を獲得！」 */}
        <div
          className="lvup-title"
          id="rankup-title"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '.18em',
            color: '#FFD700',
            textTransform: 'uppercase',
            marginBottom: 10,
            textShadow: '0 0 12px rgba(255,215,0,.5)',
          }}
        >
          {t('rankup.heading')}
        </div>

        {/* バッジ + スパークル */}
        <div
          style={{
            position: 'relative',
            width: 220,
            height: 220,
            margin: '4px auto 8px',
          }}
        >
          <SparkleBurst />
          <div
            className="lvup-badge-drop"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={getBadgeImagePath(newTitleKey)}
              alt={t(getTitleI18nKey(newTitleKey))}
              style={{
                width: 140,
                height: 140,
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 24px rgba(255,215,0,.55)) drop-shadow(0 0 28px color-mix(in srgb, var(--brand) 45%, transparent))',
              }}
            />
          </div>
        </div>

        {/* 称号名 (prev → new) */}
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity .5s ease, transform .5s ease',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '-.01em',
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            {t(getTitleI18nKey(newTitleKey))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 18 }}>
            {t(getTitleI18nKey(prevTitleKey))} <span style={{ margin: '0 6px' }}>→</span>{' '}
            <span style={{ color: 'var(--brand)', fontWeight: 800 }}>{t(getTitleI18nKey(newTitleKey))}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.7 }}>
            {t('rankup.message', { level: String(newLevel) })}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onClose}
          disabled={phase < 2}
          style={{
            width: '100%',
            background: phase >= 2 ? 'linear-gradient(135deg, #FFD700, #FFB347)' : 'var(--bg-tertiary, #2a2d3a)',
            color: phase >= 2 ? '#2A1F00' : 'var(--text-muted)',
            padding: '14px 0',
            borderRadius: 99,
            fontSize: 15,
            fontWeight: 900,
            border: 'none',
            cursor: phase >= 2 ? 'pointer' : 'wait',
            letterSpacing: '.02em',
            boxShadow: phase >= 2 ? '0 8px 24px rgba(255,180,0,.4)' : 'none',
            transition: 'all .35s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          {t('rankup.next')}
        </button>
      </div>
    </div>
  )
}
