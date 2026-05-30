/**
 * LessonCompleteScreen - クールな完了画面
 * グラデーションリング・XPカウントアップ・炎ストリーク
 * 紙吹雪なし、シャープでモダンなデザイン
 */
import { useEffect, useState } from 'react'
import { getStreak, getXp } from '../stats'
import { FlameIcon, ArrowUpIcon, StarIcon } from '../icons'
import { getCurrentLevel } from './homeHelpers'
import { haptic } from '../platform/haptics'
import { getCardStats } from '../flashcardData'
import { getWrongAnswerStats } from '../wrongAnswerStore'
import { t } from '../i18n'

interface LessonCompleteScreenProps {
  userName: string
  lessonTitle: string
  durationSec: number
  onNext: () => void
  onHome: () => void
  onOpenReview?: () => void
  prevLevel?: number
  /**
   * TTS 読み上げモードで完走した直後など、同コース次レッスンに自動で
   * 進めたい場合に true を渡す。約 2 秒の表示後に onNext() を発火する。
   * 表示中に手動操作（次へ / ホーム / 復習）を行うと自動遷移はキャンセル。
   */
  autoAdvance?: boolean
}

function useCountUp(target: number, duration = 900, delay = 500) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const t = Math.min((Date.now() - start) / duration, 1)
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOut
        setVal(Math.round(ease * target))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return val
}

// SVG グラデーションリング (circumference = 2π×r)
function RingProgress({ progress, size = 140, stroke = 10 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5FA898" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`color-mix(in srgb, var(--brand) 9%, transparent)`} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#ring-grad)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  )
}

export function LessonCompleteScreen(props: LessonCompleteScreenProps) {
  const { lessonTitle, durationSec, onNext, onHome, onOpenReview, prevLevel, autoAdvance } = props
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const streak = getStreak()
  const leveledUp = prevLevel != null && lv.level > prevLevel
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  // TTS 読み上げモード継続: 一定時間後に自動で「次のレッスン」へ進む。
  // ユーザーが手動操作したらキャンセル可能 (cancelAutoAdvance を内部で叩く)。
  const [autoAdvanceCancelled, setAutoAdvanceCancelled] = useState(false)
  const cancelAutoAdvance = () => setAutoAdvanceCancelled(true)
  useEffect(() => {
    if (!autoAdvance || autoAdvanceCancelled) return
    const timer = setTimeout(() => {
      if (!autoAdvanceCancelled) onNext()
    }, 2200)
    return () => clearTimeout(timer)
  }, [autoAdvance, autoAdvanceCancelled, onNext])

  // 2026-05-15 単一有料プラン化:
  //   復習・誤答リストは全プラン解放。due / weak カードがあれば誰でも CTA を出す。
  const cardStats = getCardStats()
  const wrongStats = getWrongAnswerStats()
  const reviewBadgeCount = wrongStats.unresolved + cardStats.due
  const showReviewCta = !!onOpenReview && reviewBadgeCount > 0

  const XP_GAIN = 50
  const xpCount = useCountUp(XP_GAIN, 900, 600)
  const ringProgress = xpCount / XP_GAIN

  // フェーズ制演出
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  useEffect(() => {
    haptic.success()
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const show = (minPhase: number) => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? 'translateY(0px)' : 'translateY(18px)',
    transition: 'opacity 0.45s ease, transform 0.45s ease',
    pointerEvents: phase >= minPhase ? 'auto' : 'none' as React.CSSProperties['pointerEvents'],
  })

  return (
    <div style={{
      background: 'var(--bg-primary)',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Noto Sans JP', sans-serif",
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景: 微細グリッドライン */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(circle at 50% 10%, color-mix(in srgb, var(--brand) 8%, transparent) 0%, transparent 55%),
          linear-gradient(${'var(--border)'} 1px, transparent 1px),
          linear-gradient(90deg, ${'var(--border)'} 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        opacity: 0.6,
      }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
        position: 'relative', zIndex: 1, gap: 0,
      }}>

        {/* リング + XP数値 */}
        <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 24, ...show(1) }}>
          <RingProgress progress={ringProgress} size={140} stroke={10} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '2.5333rem', fontWeight: 900, color: 'var(--brand)',
              letterSpacing: '-.04em', lineHeight: 1,
            }}>+{xpCount}</span>
            <span style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.1em', marginTop: 3 }}>XP</span>
          </div>
        </div>

        {/* タイトル */}
        <div style={{ marginBottom: 6, ...show(1) }}>
          <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.1em', marginBottom: 6 }}>{t('lessonComplete.eyebrow')}</div>
          <div style={{ fontSize: '1.4667rem', fontWeight: 800, lineHeight: 1.35 }}>{t('lessonComplete.titleQuoted', { title: lessonTitle })}</div>
        </div>

        {/* ストリーク + 時間 */}
        <div style={{ width: '100%', display: 'flex', gap: 10, marginTop: 28, marginBottom: 14, ...show(2) }}>
          {/* 炎ストリーク */}
          <div style={{
            flex: 1, borderRadius: 18, padding: '18px 12px', textAlign: 'center',
            background: streak >= 3
              ? 'linear-gradient(145deg, rgba(255,107,43,.15), rgba(255,154,58,.08))'
              : 'var(--bg-card)',
            border: streak >= 3
              ? '1px solid rgba(255,107,43,.35)'
              : `1px solid ${'var(--border)'}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              lineHeight: 1, marginBottom: 6,
              color: streak >= 7 ? '#FF7A1A' : streak >= 3 ? '#FF9F47' : 'var(--text-muted)',
              filter: streak < 1 ? 'grayscale(1) opacity(.25)' : 'none',
            }}>
              {streak >= 7 ? (<><FlameIcon width={24} height={24} /><FlameIcon width={24} height={24} /></>) : streak >= 3 ? <FlameIcon width={28} height={28} /> : <span style={{ fontSize: '1.8667rem' }}>○</span>}
            </div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '1.8667rem', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1,
              color: streak >= 3 ? '#FF7A3A' : 'var(--text-primary)',
            }}>{streak}</div>
            <div style={{ fontSize: '0.7333rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 5 }}>{t('lessonComplete.streakUnit')}</div>
          </div>

          {/* 学習時間 */}
          <div style={{
            flex: 1, borderRadius: 18, padding: '18px 12px', textAlign: 'center',
            background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`,
          }}>
            <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 6 }}></div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '1.8667rem', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1,
            }}>{timeStr}</div>
            <div style={{ fontSize: '0.7333rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 5 }}>{t('lessonComplete.studyTime')}</div>
          </div>

          {/* レベル */}
          <div style={{
            flex: 1, borderRadius: 18, padding: '18px 12px', textAlign: 'center',
            background: leveledUp
              ? `linear-gradient(145deg, color-mix(in srgb, var(--brand) 9%, transparent), color-mix(in srgb, var(--brand) 3%, transparent))`
              : 'var(--bg-card)',
            border: leveledUp
              ? `1px solid color-mix(in srgb, var(--brand) 31%, transparent)`
              : `1px solid ${'var(--border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, marginBottom: 6, color: leveledUp ? 'var(--brand)' : 'var(--text-muted)' }}>
              {leveledUp ? <ArrowUpIcon width={28} height={28} /> : <StarIcon width={28} height={28} />}
            </div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '1.8667rem', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1,
              color: leveledUp ? 'var(--brand)' : 'var(--text-primary)',
            }}>Lv.{lv.level}</div>
            <div style={{ fontSize: '0.7333rem', fontWeight: 600, color: leveledUp ? 'var(--brand)' : 'var(--text-muted)', marginTop: 5 }}>
              {leveledUp ? t('lessonComplete.levelUp') : t('lessonComplete.levelLabel')}
            </div>
          </div>
        </div>

        {/* レベルアップバナー */}
        {leveledUp && (
          <div style={{
            width: '100%', marginBottom: 14,
            background: `linear-gradient(90deg, color-mix(in srgb, var(--brand) 13%, transparent), color-mix(in srgb, var(--brand) 3%, transparent))`,
            border: `1px solid color-mix(in srgb, var(--brand) 25%, transparent)`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            ...show(2),
          }}>
            <ArrowUpIcon width={20} height={20} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: '0.9333rem', fontWeight: 800 }}>
              {t('lessonComplete.levelUpBanner')}<span style={{ color: 'var(--brand)' }}>Lv.{prevLevel} → Lv.{lv.level}</span>
            </span>
          </div>
        )}

        {/* 読み上げモード継続バナー: 自動遷移中のみ表示 */}
        {autoAdvance && !autoAdvanceCancelled && (
          <div style={{
            width: '100%', marginBottom: 14,
            background: `color-mix(in srgb, var(--brand) 14%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--brand) 32%, transparent)`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            ...show(3),
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', boxShadow: `0 0 10px var(--brand)`, animation: 'ttsContinuePulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.8667rem', fontWeight: 700, color: 'var(--brand)' }}>{t('tts.nextLessonHint')}</span>
            <style>{`@keyframes ttsContinuePulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }`}</style>
          </div>
        )}

        {/* CTA */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, ...show(3) }}>
          <button
            onClick={() => { cancelAutoAdvance(); onNext() }}
            style={{
              width: '100%',
              background: 'var(--brand)',
              color: '#FFFFFF',
              padding: '17px 0', borderRadius: 99,
              fontSize: '1.0667rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              letterSpacing: '.02em',
              boxShadow: `0 4px 24px color-mix(in srgb, var(--brand) 27%, transparent)`,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            {autoAdvance && !autoAdvanceCancelled ? t('tts.continueNextLesson') : t('lessonComplete.next')}
          </button>
          {showReviewCta && (
            <button
              onClick={() => { cancelAutoAdvance(); onOpenReview?.() }}
              style={{
                width: '100%',
                background: 'var(--accent-soft)',
                color: 'var(--brand)',
                padding: '14px 0', borderRadius: 99,
                fontSize: '0.9333rem', fontWeight: 700, cursor: 'pointer',
                border: `1px solid color-mix(in srgb, var(--brand) 25%, transparent)`,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              {t('lessonComplete.reviewNow', { n: String(reviewBadgeCount) })}
            </button>
          )}
          <button
            onClick={() => {
              cancelAutoAdvance()
              onHome()
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: `1px solid ${'var(--border)'}`,
              color: 'var(--text-secondary)',
              padding: '14px 0', borderRadius: 99,
              fontSize: '0.9333rem', fontWeight: 600, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            {autoAdvance && !autoAdvanceCancelled ? t('tts.skipNextLesson') : t('lessonComplete.home')}
          </button>
        </div>
      </div>
    </div>
  )
}
