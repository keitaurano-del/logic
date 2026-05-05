import { useMemo, useState, useEffect } from 'react'
import { allLessons, type LessonStep } from '../lessonData'
import { FlameIcon } from '../icons'
import { recordCompletion, getCompletedCount, getStreak, getStudyDates, addXp } from '../stats'
import { RankIllustration } from '../components/RankIllustration'
import { Confetti } from '../components/Confetti'
import { getCurrentTier } from './homeHelpers'
import { t, getLocale } from '../i18n'
import { LessonTapGuide } from '../tutorial/lessonGuide'
import { haptic } from '../platform/haptics'

// カテゴリ表示名
const CATEGORY_LABEL: Record<string, string> = {
  fermi:    'フェルミ推定',
  logic:    'ロジカルシンキング',
  case:     'ケース面接',
  critical: 'クリティカルシンキング',
  pm:       'プロジェクト管理',
}

// カテゴリアクセントカラー
const CATEGORY_COLOR: Record<string, string> = {
  fermi:    '#F59E0B',
  logic:    'var(--md-sys-color-primary)',
  case:     '#10B981',
  critical: '#7C3AED',
  pm:       '#0EA5E9',
}

interface LessonScreenProps {
  lessonId: number
  onBack: () => void
  onComplete: () => void
  onNextLesson?: () => void
  onReport?: (context: { lessonId: number; lessonTitle: string; question: string }) => void
}

export function LessonScreen({ lessonId, onBack, onComplete, onNextLesson, onReport }: LessonScreenProps) {
  const lesson = useMemo(() => allLessons[lessonId], [lessonId])
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [animClass, setAnimClass] = useState<'answer-bounce' | 'answer-shake' | ''>('')
  const [showCelebration, setShowCelebration] = useState(false)
  // streak演出用: 完了前後のストリーク差分
  const [streakBefore, setStreakBefore] = useState(0)

  useEffect(() => {
    if (!animClass) return
    const timer = setTimeout(() => setAnimClass(''), 500)
    return () => clearTimeout(timer)
  }, [animClass])

  if (!lesson) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, gap: 16 }}>
        <div style={{ fontSize: 16, color: '#7A849E' }}>レッスンが見つかりません (id: {lessonId})</div>
        <button onClick={onBack} style={{ background: 'var(--md-sys-color-primary)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>戻る</button>
      </div>
    )
  }

  const total = lesson.steps.length
  const step: LessonStep = lesson.steps[stepIdx]

  const isLast = stepIdx === total - 1
  const accent = CATEGORY_COLOR[lesson.category] ?? 'var(--md-sys-color-primary)'
  const catLabel = CATEGORY_LABEL[lesson.category] ?? lesson.category

  const handleSubmitWith = (index: number) => {
    setSubmitted(true)
    if (step.type === 'quiz') {
      const correct = step.options[index].correct
      setAnimClass(correct ? 'answer-bounce' : 'answer-shake')
      if (correct) haptic.success()
      else haptic.warning()
    }
  }

  const handleNext = () => {
    if (isLast) {
      setStreakBefore(getStreak())
      recordCompletion(`lesson-${lesson.id}`)
      addXp('lesson')
      setShowCelebration(true)
      return
    }
    setStepIdx((i) => i + 1)
    setSelected(null)
    setSubmitted(false)
    setAnimClass('')
    // SCRUM-196: スライド切り替え時にスクロール位置をリセット
    document.getElementById('app-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // ── Celebration overlay ──────────────────────────────────────────
  if (showCelebration) {
    return (
      <CelebrationScreen
        lessonTitle={lesson.title}
        streakBefore={streakBefore}
        onComplete={onComplete}
        onNextLesson={onNextLesson}
      />
    )
  }

  // ── Main lesson UI ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4FF' }}>
      {/* レッスン左右タップガイド（初回のみ） */}
      <LessonTapGuide />

      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 16px 12px',
        background: '#fff',
        borderBottom: '1px solid #E2E8FF',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#F0F4FF', border: '1px solid #E2E8FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A4259" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: accent, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 1 }}>{catLabel}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</div>
        </div>
        <div style={{
          flexShrink: 0, background: '#EEF2FF', borderRadius: 20,
          padding: '4px 10px', fontSize: 14, fontWeight: 700, color: 'var(--md-sys-color-primary)',
        }}>
          {stepIdx + 1} / {total}
        </div>
      </div>

      {/* プログレスバー（セグメント型） */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={stepIdx + 1}
        aria-label={`進捗 ${stepIdx + 1} / ${total}`}
        style={{ display: 'flex', gap: 4, padding: '8px 16px 0', background: '#fff' }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 9999,
              background: i < stepIdx + 1 ? accent : '#E8EEFF',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* コンテンツ */}
      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

        {step.type === 'explain' ? (
          <ExplainStep
            step={step}
            catLabel={catLabel}
            accent={accent}
            isLast={isLast}
            onNext={handleNext}
          />
        ) : step.type === 'quiz' ? (
          <QuizStep
            step={step}
            catLabel={catLabel}
            accent={accent}
            selected={selected}
            submitted={submitted}
            isLast={isLast}
            animClass={animClass}
            onSelect={(i) => { setSelected(i); handleSubmitWith(i) }}
            onNext={handleNext}
            onReport={onReport ? () => onReport({ lessonId: lesson.id, lessonTitle: lesson.title, question: step.question }) : undefined}
          />
        ) : (
          // think / case は LessonStoriesScreen で処理されるため、旧コンポーネントではスキップ
          <div style={{ padding: 20, color: '#888', fontSize: 14 }}>次へ</div>
        )}
      </div>
    </div>
  )
}

// ── Explain step ─────────────────────────────────────────────────
function ExplainStep({ step, catLabel, accent, isLast, onNext }: {
  step: LessonStep & { type: 'explain' }
  catLabel: string
  accent: string
  isLast: boolean
  onNext: () => void
}) {
  // コンテンツを段落に分割して読みやすく表示
  const paragraphs = (step.content ?? '').split('\n').filter((p: string) => p.trim())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 問題カード */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8FF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
        borderLeft: `4px solid ${accent}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{catLabel}</div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F1523', lineHeight: 1.4, letterSpacing: '-.025em' }}>{step.title}</div>
      </div>

      {/* 説明コンテンツ */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8FF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {paragraphs.map((para: string, i: number) => {
          const isBullet = para.startsWith('×') || para.startsWith('→') || para.startsWith('・')
          const isArrow = para.startsWith('→')
          return (
            <div
              key={i}
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: isBullet ? (isArrow ? 'var(--md-sys-color-primary)' : '#3A4259') : '#3A4259',
                fontWeight: isBullet ? 500 : 400,
                paddingLeft: isArrow ? 10 : isBullet ? 4 : 0,
                borderLeft: isArrow ? `3px solid ${accent}` : 'none',
              } as React.CSSProperties}
            >
              {para}
            </div>
          )
        })}
      </div>

      {/* 次へボタン */}
      <button
        onClick={onNext}
        style={{
          width: '100%', background: accent, color: '#fff',
          border: 'none', borderRadius: 14, padding: '16px 20px',
          fontSize: 18, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 4px 12px ${accent}40`,
        }}
      >
        {isLast ? t('common.complete') : t('common.next')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </div>
  )
}

// ── Quiz step ────────────────────────────────────────────────────
function QuizStep({ step, catLabel, accent, selected, submitted, isLast, onSelect, onNext, onReport }: {
  step: LessonStep & { type: 'quiz' }
  catLabel: string
  accent: string
  selected: number | null
  submitted: boolean
  isLast: boolean
  animClass: string
  onSelect: (i: number) => void
  onNext: () => void
  onReport?: () => void
}) {
  const isCorrect = submitted && selected != null && step.options[selected].correct

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 問題カード */}
      <div role="group" aria-label="設問" style={{
        background: '#fff', border: '1px solid #E2E8FF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
        borderLeft: `4px solid ${accent}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{catLabel}</div>
        <div aria-live="polite" style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F1523', lineHeight: 1.5, letterSpacing: '-.02em' }}>{step.question}</div>
      </div>

      {/* 選択肢 */}
      <div role="radiogroup" aria-label="選択肢" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i
          const correct = opt.correct
          const badgeLabel = String.fromCharCode(65 + i)

          let bg = '#fff'
          let border = '1.5px solid #E2E8FF'
          let shadow = '0 1px 3px rgba(15,21,35,.06)'
          let badgeBg = 'transparent'
          let badgeBorder = '#E2E8FF'
          let badgeColor = '#7A849E'
          const textColor = '#0F1523'

          if (submitted && correct) {
            bg = '#ECFDF3'; border = '1.5px solid #12B76A'
            badgeBg = '#12B76A'; badgeBorder = '#12B76A'; badgeColor = '#fff'
            shadow = '0 2px 8px rgba(18,183,106,.15)'
          } else if (submitted && isSelected && !correct) {
            bg = '#FEF3F2'; border = '1.5px solid #F04438'
            badgeBg = 'var(--md-sys-color-error)'; badgeBorder = 'var(--md-sys-color-error)'; badgeColor = '#fff'
          } else if (isSelected) {
            bg = '#EEF2FF'; border = `1.5px solid ${accent}`
            badgeBorder = accent; badgeColor = accent
            shadow = `0 2px 8px ${accent}20`
          }

          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              onClick={() => onSelect(i)}
              style={{
                background: bg, border, borderRadius: 14,
                padding: '14px 16px',
                minHeight: 56,
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left', width: '100%',
                boxShadow: shadow,
                transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: badgeBg, border: `1.5px solid ${badgeBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: badgeColor, flexShrink: 0,
              }}>
                {submitted && correct
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : submitted && isSelected && !correct
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : badgeLabel
                }
              </div>
              <span style={{ fontSize: 16, fontWeight: 500, color: textColor, flex: 1, lineHeight: 1.45 }}>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* フィードバックパネル */}
      {submitted && (
        <div role="status" aria-live="assertive" style={{
          borderRadius: 16, padding: '16px 18px',
          background: isCorrect ? '#ECFDF3' : '#FEF3F2',
          border: `1px solid ${isCorrect ? '#12B76A' : 'var(--md-sys-color-error)'}`,
          borderLeft: `4px solid ${isCorrect ? '#12B76A' : 'var(--md-sys-color-error)'}`,
          animation: 'scale-in 0.2s ease-out both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: isCorrect ? '#12B76A' : 'var(--md-sys-color-error)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {isCorrect
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F1523' }}>
              {isCorrect ? t('lesson.correctMark') : t('lesson.wrongMark')}
            </div>
          </div>
          <div style={{ fontSize: 16, color: '#3A4259', lineHeight: 1.7 }}>{step.explanation}</div>
        </div>
      )}

      {/* ボタンエリア: 選択後のみ「次へ」表示 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {submitted && (
          <button
            onClick={onNext}
            style={{
              width: '100%', background: accent, color: '#fff',
              border: 'none', borderRadius: 14, padding: '16px 20px',
              fontSize: 18, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 12px ${accent}40`,
              animation: 'scale-in 0.2s ease-out both',
            }}
          >
            {isLast ? t('common.complete') : t('common.next')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        )}

        {/* 誤り報告 — ボタンの下に小さく */}
        {onReport && (
          <button
            onClick={onReport}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: '#B0B8CC', textDecoration: 'none',
              padding: '4px 0', display: 'block', width: '100%', textAlign: 'center',
            }}
          >
            {t('report.linkText')}
          </button>
        )}
      </div>
    </div>
  )
}

// ── CelebrationScreen ─────────────────────────────────────────────
// Speak-inspired 2-phase completion screen:
// Phase 1 (0-1.5s): XP / rank reveal
// Phase 2 (1.6s+):  Streak celebration (only when streak increased)
function CelebrationScreen({ lessonTitle, streakBefore, onComplete, onNextLesson }: {
  lessonTitle: string
  streakBefore: number
  onComplete: () => void
  onNextLesson?: () => void
}) {
  const completedNow = getCompletedCount()
  const xp = completedNow * 100
  const tier = getCurrentTier(xp)
  const level = tier.level
  const levelTitle = getLocale() === 'ja' ? tier.title : tier.titleEn
  const newStreak = getStreak()
  const streakIncreased = newStreak > streakBefore

  const [phase, setPhase] = useState<1 | 2>(1)

  useEffect(() => {
    if (!streakIncreased) return
    const t = setTimeout(() => setPhase(2), 1800)
    return () => clearTimeout(t)
  }, [streakIncreased])

  // Phase 2: streak celebration
  if (phase === 2) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg, #1A2E6B 0%, #0F1A44 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '32px 24px', textAlign: 'center',
      }}>
        {/* 炎リングエフェクト */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div style={{
            position: 'absolute', inset: -20,
            borderRadius: '50%', border: '3px solid rgba(251,146,60,.4)',
            animation: 'streak-ring 1.2s ease-out 0.1s both',
          }} />
          <div style={{
            position: 'absolute', inset: -36,
            borderRadius: '50%', border: '2px solid rgba(251,146,60,.2)',
            animation: 'streak-ring 1.2s ease-out 0.3s both',
          }} />
          {/* 炎アイコン */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(145deg, #F97316, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(249,115,22,.5)',
            animation: 'celebrate-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white" style={{ animation: 'streak-flame 1.5s ease-in-out infinite 0.3s' }}>
              <path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-1.5-.5-2.9-1.3-4C14.7 9 13 10 12 10c0-2 1-4 1-4C11 8 9 10 9 11c0 1.7 1.3 3 3 3s3-1.3 3-3c0-.7-.2-1.3-.6-1.8-.4.5-1 .8-1.7.8-1.1 0-2-.9-2-2 0-.7.4-1.3 1-1.7-.3.8-.3 1.7 0 2.5.3-.2.7-.3 1-.3.8 0 1.5.7 1.5 1.5S13.8 11.5 13 11.5c-.5 0-.9-.2-1.2-.6.1.4.2.7.2 1.1 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.7 1-3.3 2.5-4.2C9.2 8.5 9 9.2 9 10c0 1.7 1.3 3 3 3"/>
            </svg>
          </div>
        </div>

        {/* ストリーク数字 */}
        <div style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 88, fontWeight: 900, color: '#F97316',
          letterSpacing: '-0.04em', lineHeight: 1,
          marginTop: 16,
          animation: 'streak-num-pop 0.6s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
          textShadow: '0 0 40px rgba(249,115,22,.4)',
        }}>
          {newStreak}
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 4, animation: 'slide-up-fade 0.4s 0.4s ease-out both' }}>連続学習</div>

        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginTop: 12, animation: 'slide-up-fade 0.4s 0.5s ease-out both' }}>
          {newStreak}日連続！
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', marginTop: 6, marginBottom: 40, animation: 'slide-up-fade 0.4s 0.6s ease-out both' }}>
          学習の習慣が身についています。
        </div>

        {/* 曜日バー（今週の学習記録） */}
        <WeekBar style={{ marginBottom: 40, animation: 'slide-up-fade 0.4s 0.7s ease-out both' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, animation: 'slide-up-fade 0.4s 0.8s ease-out both' }}>
          {onNextLesson && (
            <button
              onClick={onNextLesson}
              style={{
                width: '100%',
                background: '#fff', color: '#1A2E6B',
                border: 'none', borderRadius: 16,
                padding: '18px 24px', fontSize: 18, fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,.2)',
              }}
            >
              次のレッスンへ
            </button>
          )}
          <button
            onClick={onComplete}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
              color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 16,
              padding: '18px 24px', fontSize: 18, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  // Phase 1: XP / rank reveal
  return (
    <>
      <Confetti />
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg, #1E3A8A 0%, var(--md-sys-color-primary) 60%, #4C6EF5 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '32px 24px', textAlign: 'center',
      }}>
        {/* グロー */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 320, height: 320, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* レッスン名バッジ */}
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,.55)', marginBottom: 20,
          animation: 'fade-in-up 0.3s ease-out both',
        }}>
          {lessonTitle} 完了
        </div>

        {/* 哲学者イラスト */}
        <div style={{ animation: 'celebrate-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <RankIllustration level={level} size={140} />
        </div>

        {/* ランク名 */}
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 16, animation: 'fade-in-up 0.35s 0.1s ease-out both' }}>LV.{level}</div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginTop: 2, animation: 'celebrate-pop 0.5s 0.12s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {levelTitle}
        </div>

        {/* XPバッジ */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(234,179,8,.15)', border: '1px solid rgba(234,179,8,.35)',
          color: '#FCD34D', borderRadius: 99,
          padding: '10px 24px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em',
          marginTop: 16, marginBottom: 36,
          animation: 'xp-badge-in 0.55s 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          ＋100
        </div>

        {/* ボタン or 自動遷移メッセージ */}
        {streakIncreased ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 16, color: 'rgba(255,255,255,.4)', animation: 'fade-in-up 0.3s 0.5s ease-out both' }}>
            <FlameIcon width={14} height={14} />
            <span>連続学習を確認中...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, animation: 'fade-in-up 0.3s 0.5s ease-out both' }}>
            {onNextLesson && (
              <button
                onClick={onNextLesson}
                style={{
                  width: '100%',
                  background: '#fff', color: 'var(--md-sys-color-primary)',
                  border: 'none', borderRadius: 16,
                  padding: '16px 24px', fontSize: 18, fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,.15)',
                }}
              >
                次のレッスンへ
              </button>
            )}
            <button
              onClick={onComplete}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                color: '#fff', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 16,
                padding: '16px 24px', fontSize: 18, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// 今週の学習記録バー（完了画面用）
function WeekBar({ style }: { style?: React.CSSProperties }) {
  const rawDates = getStudyDates()
  const studyDates = new Set<string>(rawDates)
  const todayDow = (new Date().getDay() + 6) % 7
  const days = ['月','火','水','木','金','土','日']
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - todayDow)

  const weekDates = days.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  return (
    <div style={{ display: 'flex', gap: 8, ...style }}>
      {days.map((day, i) => {
        const isToday = i === todayDow
        const done = studyDates.has(weekDates[i])
        return (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: done ? 'linear-gradient(135deg,#F97316,#EF4444)' : 'rgba(255,255,255,.1)',
              border: isToday ? '2px solid #F97316' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: done ? '0 2px 8px rgba(249,115,22,.4)' : 'none',
              transition: 'all .2s',
            }}>
              {done && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#F97316' : 'rgba(255,255,255,.4)' }}>{day}</div>
          </div>
        )
      })}
    </div>
  )
}
