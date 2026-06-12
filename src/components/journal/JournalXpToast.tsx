import { useEffect, useState } from 'react'
import { haptic } from '../../platform/haptics'
import { prefersReducedMotion } from '../../platform'

interface JournalXpToastProps {
  xp: number
  label: string
  onDone: () => void
}

function useCountUp(target: number, duration = 800, delay = 250) {
  // a11y: 動きを減らす設定ならカウントアップせず即値表示。
  const reduced = prefersReducedMotion()
  const [val, setVal] = useState(0)
  useEffect(() => {
    // reduced 時はアニメーションを走らせない。表示は下の return で target を即返す。
    if (reduced) return
    let raf = 0
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const tt = Math.min((Date.now() - start) / duration, 1)
        const ease = tt < 0.5 ? 2 * tt * tt : -1 + (4 - 2 * tt) * tt
        setVal(Math.round(ease * target))
        if (tt < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    // unmount 時に遅延 tick と再帰 rAF の両方を確実に止める（unmount 後 setState を防ぐ）。
    return () => {
      clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced, target, duration, delay])
  return reduced ? target : val
}

function RingProgress({ progress, size = 132, stroke = 9 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <defs>
        <linearGradient id="journal-xp-ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5FA898" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--brand) 12%, transparent)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#journal-xp-ring)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  )
}

const CONFETTI_COLORS = ['#2dd4bf', '#5FA898', '#FBBF24', '#F472B6', '#60A5FA', '#A78BFA']

interface ConfettiPiece {
  left: number
  delay: number
  duration: number
  rotate: number
  color: string
  drift: number
  size: number
}

/** JF-4: 軽量な CSS 紙吹雪。乱数で位置・色・落下時間を散らして固定パターンを避ける。
 *  乱数は副作用なので render 中ではなく mount 後の useEffect で一度だけ生成する。 */
function Confetti({ count = 22 }: { count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  useEffect(() => {
    // 乱数生成（副作用）。cascading render を避けるため次の tick に defer する。
    const id = setTimeout(() => {
      setPieces(Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 1.1 + Math.random() * 0.8,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        drift: (Math.random() - 0.5) * 80,
        size: 6 + Math.random() * 6,
      })))
    }, 0)
    return () => clearTimeout(id)
  }, [count])
  return (
    <div className="journal-xp-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="journal-xp-confetti__piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // CSS 変数で各ピースの横ドリフトと初期回転を渡す
            ['--drift' as string]: `${p.drift}px`,
            ['--rot' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}

export function JournalXpToast({ xp, label, onDone }: JournalXpToastProps) {
  const count = useCountUp(xp, 800, 250)
  const ringProgress = xp > 0 ? count / xp : 0

  useEffect(() => {
    haptic.success()
    const t = setTimeout(onDone, 2300)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="journal-xp-toast"
      role="status"
      aria-live="polite"
      aria-label={`+${xp} XP ${label}`}
    >
      <Confetti />
      <div className="journal-xp-toast__card">
        <div className="journal-xp-toast__badge" aria-hidden="true">
          {/* コイン: SVG グラデーションの円 + 星 */}
          <svg width="56" height="56" viewBox="0 0 56 56" className="journal-xp-toast__coin">
            <defs>
              <radialGradient id="journal-xp-coin" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="55%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </radialGradient>
            </defs>
            <circle cx="28" cy="28" r="24" fill="url(#journal-xp-coin)" stroke="#B45309" strokeWidth="2" />
            <circle cx="28" cy="28" r="18" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <path
              d="M28 16l3.2 6.5 7.2 1-5.2 5.1 1.2 7.1L28 32.4 21.6 35.8l1.2-7.1L17.6 23.5l7.2-1z"
              fill="#FFFDF5"
              opacity="0.92"
            />
          </svg>
        </div>

        <div className="journal-xp-toast__ring">
          <RingProgress progress={ringProgress} />
          <div className="journal-xp-toast__center">
            <span className="journal-xp-toast__amount">+{count}</span>
            <span className="journal-xp-toast__unit">XP</span>
          </div>
        </div>

        <div className="journal-xp-toast__label">{label}</div>
      </div>
    </div>
  )
}
