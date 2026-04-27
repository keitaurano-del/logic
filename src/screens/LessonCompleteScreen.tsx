/**
 * LessonCompleteScreen - Speak風アニメーション完了画面
 * XPカウントアップ・炎ストリーク・パーティクル爆発
 */
import { useEffect, useState, useRef } from 'react'
import { v3 } from '../styles/tokensV3'
import { getStreak, getXp } from '../stats'
import { getCurrentLevel } from './homeHelpers'

interface LessonCompleteScreenProps {
  userName: string
  lessonTitle: string
  durationSec: number
  onNext: () => void
  onHome: () => void
  prevLevel?: number
}

// ── XPカウントアップ hook ──
function useCountUp(target: number, duration = 1200, delay = 400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const t = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        setVal(Math.round(ease * target))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return val
}

// ── パーティクル ──
interface Particle { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }
const COLORS = ['#70D8BD', '#5FA898', '#FFD166', '#FF6B6B', '#C8F5E9', '#A8EDDF']

function useParticles(active: boolean) {
  const [particles, setParticles] = useState<Particle[]>([])
  const frame = useRef(0)
  useEffect(() => {
    if (!active) return
    const burst = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 38 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 3.5,
      vy: -(Math.random() * 4 + 1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 7 + 3,
      life: 1,
    }))
    setParticles(burst)
    const tick = () => {
      setParticles(prev => {
        const next = prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.18, life: p.life - 0.025 }))
          .filter(p => p.life > 0)
        if (next.length === 0) return next
        frame.current = requestAnimationFrame(tick)
        return next
      })
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [active])
  return particles
}

export function LessonCompleteScreen(props: LessonCompleteScreenProps) {
  const { userName, lessonTitle, durationSec, onNext, onHome, prevLevel } = props
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const streak = getStreak()
  const leveledUp = prevLevel != null && lv.level > prevLevel
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  const XP_GAIN = 50
  const xpCount = useCountUp(XP_GAIN, 900, 600)
  const particles = useParticles(true)

  const [phase, setPhase] = useState<'enter' | 'xp' | 'streak' | 'cta'>('enter')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('xp'), 300)
    const t2 = setTimeout(() => setPhase('streak'), 1000)
    const t3 = setTimeout(() => setPhase('cta'), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{
      background: v3.color.bg, minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 背景グロー */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 25%, rgba(112,216,189,.22), transparent 60%)', pointerEvents: 'none' }} />

      {/* パーティクル */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {particles.map(p => (
          <rect
            key={p.id}
            x={`${p.x}%`} y={`${p.y}%`}
            width={p.size} height={p.size}
            rx={p.size / 3}
            fill={p.color}
            opacity={p.life}
            transform={`rotate(${p.id * 30}, ${p.x}, ${p.y})`}
          />
        ))}
      </svg>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', textAlign: 'center', position: 'relative', zIndex: 3,
      }}>

        {/* チェックアイコン */}
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: `linear-gradient(135deg, ${v3.color.accent}, #2dd4bf)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          boxShadow: `0 0 0 12px ${v3.color.accent}18, 0 0 60px ${v3.color.accent}40`,
          animation: 'lc-pop .5s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: v3.color.accent, letterSpacing: '.06em', marginBottom: 6, animation: 'lc-fade .4s .3s both' }}>レッスン完了</div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35, marginBottom: 6, animation: 'lc-fade .4s .4s both' }}>
          お疲れ様でした、<br /><span style={{ color: v3.color.accent }}>{userName || 'ゲスト'}</span> さん
        </div>
        <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 32, animation: 'lc-fade .4s .5s both' }}>
          「{lessonTitle}」
        </div>

        {/* XP獲得カード */}
        <div style={{
          width: '100%', background: v3.color.card, borderRadius: 20,
          padding: '20px 24px', marginBottom: 14,
          border: `1px solid ${v3.color.accent}30`,
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity .4s ease, transform .4s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: v3.color.text3, letterSpacing: '.08em', marginBottom: 12 }}>獲得ポイント</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 52, fontWeight: 900, color: v3.color.accent,
              letterSpacing: '-.04em', lineHeight: 1,
            }}>+{xpCount}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: v3.color.text2, marginTop: 8 }}>XP</span>
          </div>
          {/* XPバー */}
          <div style={{ height: 8, background: `${v3.color.accent}25`, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: v3.color.accent, borderRadius: 99,
              width: `${Math.min((xpCount / XP_GAIN) * 100, 100)}%`,
              transition: 'width .05s linear',
              boxShadow: `0 0 8px ${v3.color.accent}80`,
            }} />
          </div>
          <div style={{ fontSize: 12, color: v3.color.text3, marginTop: 8 }}>
            Lv.{lv.level} · 累計 {xp} XP
          </div>
        </div>

        {/* ストリーク + 学習時間 */}
        <div style={{
          width: '100%', display: 'flex', gap: 10, marginBottom: 14,
          opacity: phase === 'enter' || phase === 'xp' ? 0 : 1,
          transform: phase === 'enter' || phase === 'xp' ? 'translateY(16px)' : 'translateY(0)',
          transition: 'opacity .4s ease, transform .4s ease',
        }}>
          {/* 炎ストリーク */}
          <div style={{
            flex: 1, background: streak >= 3 ? 'linear-gradient(135deg, #FF6B2B22, #FF9A3A22)' : v3.color.card,
            borderRadius: 16, padding: '16px 12px', textAlign: 'center',
            border: streak >= 3 ? '1px solid #FF6B2B40' : `1px solid ${v3.color.line}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 4, filter: streak >= 1 ? 'none' : 'grayscale(1) opacity(.3)' }}>
              {streak >= 7 ? '🔥🔥' : streak >= 3 ? '🔥' : '💧'}
            </div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 24, fontWeight: 900, lineHeight: 1,
              color: streak >= 3 ? '#FF7A3A' : v3.color.text,
            }}>{streak}</div>
            <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 4, fontWeight: 600 }}>日連続</div>
          </div>
          {/* 学習時間 */}
          <div style={{ flex: 1, background: v3.color.card, borderRadius: 16, padding: '16px 12px', textAlign: 'center', border: `1px solid ${v3.color.line}` }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>⏱</div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 900, lineHeight: 1, color: v3.color.text }}>{timeStr}</div>
            <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 4, fontWeight: 600 }}>学習時間</div>
          </div>
        </div>

        {/* レベルアップ表示 */}
        {leveledUp && (
          <div style={{
            width: '100%', background: `linear-gradient(135deg, ${v3.color.accent}20, ${v3.color.accent}08)`,
            border: `1px solid ${v3.color.accent}50`, borderRadius: 16, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
            animation: 'lc-bounce .6s 1.4s cubic-bezier(.34,1.56,.64,1) both',
            opacity: phase === 'enter' || phase === 'xp' ? 0 : 1,
            transition: 'opacity .3s ease',
          }}>
            <div style={{ fontSize: 28 }}>⬆️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.accent }}>レベルアップ！</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Lv.{prevLevel} → <span style={{ color: v3.color.accent }}>Lv.{lv.level}</span></div>
            </div>
          </div>
        )}

        {/* CTAボタン */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
          opacity: phase === 'cta' ? 1 : 0,
          transform: phase === 'cta' ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .4s ease, transform .4s ease',
        }}>
          <button
            onClick={onNext}
            style={{
              width: '100%', background: v3.color.accent, color: v3.color.bg,
              padding: '17px 0', borderRadius: 99, fontSize: 16, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: `0 4px 20px ${v3.color.accent}50`,
            }}
          >
            次のレッスンへ進む →
          </button>
          <button
            onClick={onHome}
            style={{
              width: '100%', background: 'transparent',
              border: `1px solid ${v3.color.line}`, color: v3.color.text2,
              padding: '14px 0', borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ホームに戻る
          </button>
        </div>
      </div>

      <style>{`
        @keyframes lc-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes lc-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lc-bounce {
          0%   { transform: scale(0.7); }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
