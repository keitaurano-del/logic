import { useState, useEffect, useRef } from 'react'
import { getStreak, getLevelInfo, type LevelInfo } from './stats'
import './Reward.css'

type Props = {
  xpEarned: number
  lessonTitle: string
  onContinue: () => void
}

export default function Reward({ xpEarned, lessonTitle, onContinue }: Props) {
  const [phase, setPhase] = useState<'xp' | 'streak' | 'level'>('xp')
  const [displayXp, setDisplayXp] = useState(0)
  const [showStreak, setShowStreak] = useState(false)
  const [showLevel, setShowLevel] = useState(false)
  const streak = getStreak()
  const levelInfo = getLevelInfo()
  const prevLevelRef = useRef<LevelInfo | null>(null)

  // Check if level changed
  useEffect(() => {
    // Store level info from before this XP was added
    // (It's already added by the time we render, so we approximate)
    const prev = { ...levelInfo }
    prev.xp -= xpEarned
    prevLevelRef.current = prev
  }, [])

  // XP count-up animation
  useEffect(() => {
    if (phase !== 'xp') return
    const duration = 1200
    const steps = 30
    const increment = xpEarned / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), xpEarned)
      setDisplayXp(current)
      if (step >= steps) {
        clearInterval(timer)
        setTimeout(() => setPhase('streak'), 600)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [phase, xpEarned])

  // Streak phase
  useEffect(() => {
    if (phase !== 'streak') return
    setShowStreak(true)
    setTimeout(() => setPhase('level'), 1200)
  }, [phase])

  // Level phase
  useEffect(() => {
    if (phase !== 'level') return
    setShowLevel(true)
  }, [phase])

  const leveledUp = prevLevelRef.current && prevLevelRef.current.level < levelInfo.level

  return (
    <div className="rw-screen">
      <div className="rw-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rw-particle" style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }} />
        ))}
      </div>

      <div className="rw-content">

        <div className="rw-mascot">
          <span style={{ fontSize: 64 }}>✨</span>
        </div>

        <p className="rw-label">{lessonTitle}</p>
        <h2 className="rw-title">完了！</h2>

        {/* XP Earned */}
        <div className={`rw-xp-card ${phase !== 'xp' ? 'done' : ''}`}>
          <span className="rw-xp-plus">+</span>
          <span className="rw-xp-num">{displayXp}</span>
          <span className="rw-xp-unit">XP</span>
        </div>

        {/* Streak */}
        <div className={`rw-streak ${showStreak ? 'show' : ''}`}>
          <span className="rw-streak-fire">🔥</span>
          <div className="rw-streak-text">
            <span className="rw-streak-count">{streak}日連続</span>
            <span className="rw-streak-msg">
              {streak >= 7 ? 'すごい！1���間連続です！' :
               streak >= 3 ? 'いい調子！続けましょう！' :
               streak >= 1 ? '今日も学習できまし���！' : '学習開始！'}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div className={`rw-level ${showLevel ? 'show' : ''}`}>
          {leveledUp ? (
            <div className="rw-levelup">
              <span className="rw-levelup-badge">LEVEL UP!</span>
              <span className="rw-levelup-num">Lv.{levelInfo.level}</span>
              <span className="rw-levelup-title">{levelInfo.title}</span>
            </div>
          ) : (
            <div className="rw-level-bar-area">
              <div className="rw-level-labels">
                <span className="rw-level-badge">Lv.{levelInfo.level} {levelInfo.title}</span>
                <span className="rw-level-xp">{levelInfo.xp} / {levelInfo.nextXp} XP</span>
              </div>
              <div className="rw-level-bar">
                <div className="rw-level-fill" style={{ width: `${levelInfo.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <button
          className={`rw-continue ${showLevel ? 'show' : ''}`}
          onClick={onContinue}
        >
          続ける
        </button>
      </div>
    </div>
  )
}
