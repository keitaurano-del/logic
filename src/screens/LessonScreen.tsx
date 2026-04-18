import { useMemo, useState, useEffect } from 'react'
import { allLessons, type LessonStep } from '../lessonData'
import { recordCompletion, getCompletedCount } from '../stats'
import { ArrowRightIcon } from '../icons'
import { Button } from '../components/Button'
import { RankIllustration } from '../components/RankIllustration'
import { Confetti } from '../components/Confetti'
import { getCurrentTier } from './homeHelpers'
import { t, getLocale } from '../i18n'

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
  logic:    '#3B5BDB',
  case:     '#10B981',
  critical: '#7C3AED',
  pm:       '#0EA5E9',
}

interface LessonScreenProps {
  lessonId: number
  onBack: () => void
  onComplete: () => void
  onReport?: (context: { lessonId: number; lessonTitle: string; question: string }) => void
}

export function LessonScreen({ lessonId, onBack, onComplete, onReport }: LessonScreenProps) {
  const lesson = useMemo(() => allLessons[lessonId], [lessonId])
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [animClass, setAnimClass] = useState<'answer-bounce' | 'answer-shake' | ''>('')
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (!animClass) return
    const timer = setTimeout(() => setAnimClass(''), 500)
    return () => clearTimeout(timer)
  }, [animClass])

  if (!lesson) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, gap: 16 }}>
        <div style={{ fontSize: 14, color: '#7A849E' }}>レッスンが見つかりません (id: {lessonId})</div>
        <button onClick={onBack} style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>戻る</button>
      </div>
    )
  }

  const total = lesson.steps.length
  const step: LessonStep = lesson.steps[stepIdx]
  const progressPct = ((stepIdx + 1) / total) * 100
  const isLast = stepIdx === total - 1
  const accent = CATEGORY_COLOR[lesson.category] ?? '#3B5BDB'
  const catLabel = CATEGORY_LABEL[lesson.category] ?? lesson.category

  const handleSubmit = () => {
    setSubmitted(true)
    if (selected != null && step.type === 'quiz') {
      const correct = step.options[selected].correct
      setAnimClass(correct ? 'answer-bounce' : 'answer-shake')
    }
  }

  const handleNext = () => {
    if (isLast) {
      recordCompletion(`lesson-${lesson.id}`)
      setShowCelebration(true)
      return
    }
    setStepIdx((i) => i + 1)
    setSelected(null)
    setSubmitted(false)
    setAnimClass('')
  }

  // ── Celebration overlay ──────────────────────────────────────────
  if (showCelebration) {
    const completedNow = getCompletedCount()
    const xp = completedNow * 100
    const tier = getCurrentTier(xp)
    const level = tier.level
    const levelTitle = getLocale() === 'ja' ? tier.title : tier.titleEn

    return (
      <>
        <Confetti />
        <div style={{
          position: 'fixed', inset: 0,
          background: 'var(--bg-hero)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '32px 24px',
          textAlign: 'center',
        }}>
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 360, height: 360, background: 'radial-gradient(circle, rgba(158,179,240,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ animation: 'celebrate-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <RankIllustration level={level} size={152} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginTop: 24, marginBottom: 6, animation: 'celebrate-pop 0.5s 0.08s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            {t('lesson.completedH1')}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, animation: 'fade-in-up 0.4s 0.15s ease-out both' }}>
            Lv.{level} · {levelTitle}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--xp-bg)', border: '1px solid rgba(234,179,8,0.35)', color: '#FCD34D', borderRadius: 'var(--radius-full)', padding: '10px 22px', fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 40, animation: 'xp-badge-in 0.55s 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            ＋100 XP
          </div>
          <Button variant="primary" size="lg" onClick={onComplete} style={{ width: '100%', maxWidth: 280 } as React.CSSProperties}>
            {t('common.next')} <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      </>
    )
  }

  // ── Main lesson UI ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4FF' }}>

      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
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
          <div style={{ fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 1 }}>{catLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1523', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</div>
        </div>
        <div style={{
          flexShrink: 0, background: '#EEF2FF', borderRadius: 20,
          padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#3B5BDB',
        }}>
          {stepIdx + 1} / {total}
        </div>
      </div>

      {/* プログレスバー */}
      <div style={{ height: 4, background: '#E8EEFF' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: accent, transition: 'width 0.35s ease', borderRadius: '0 2px 2px 0' }} />
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
        ) : (
          <QuizStep
            step={step}
            catLabel={catLabel}
            accent={accent}
            selected={selected}
            submitted={submitted}
            isLast={isLast}
            animClass={animClass}
            onSelect={setSelected}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onReport={onReport ? () => onReport({ lessonId: lesson.id, lessonTitle: lesson.title, question: step.question }) : undefined}
          />
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
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{catLabel}</div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F1523', lineHeight: 1.4, letterSpacing: '-.025em' }}>{step.title}</div>
      </div>

      {/* 説明コンテンツ */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8FF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {paragraphs.map((para: string, i: number) => {
          const isBullet = para.startsWith('✓') || para.startsWith('×') || para.startsWith('→') || para.startsWith('・')
          const isArrow = para.startsWith('→')
          return (
            <div
              key={i}
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                color: isBullet ? (isArrow ? '#3B5BDB' : '#3A4259') : '#3A4259',
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
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
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
function QuizStep({ step, catLabel, accent, selected, submitted, isLast, onSelect, onSubmit, onNext, onReport }: {
  step: LessonStep & { type: 'quiz' }
  catLabel: string
  accent: string
  selected: number | null
  submitted: boolean
  isLast: boolean
  animClass: string
  onSelect: (i: number) => void
  onSubmit: () => void
  onNext: () => void
  onReport?: () => void
}) {
  const isCorrect = submitted && selected != null && step.options[selected].correct

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 問題カード */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8FF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(15,21,35,.06)',
        borderLeft: `4px solid ${accent}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{catLabel}</div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 17, fontWeight: 800, color: '#0F1523', lineHeight: 1.5, letterSpacing: '-.02em' }}>{step.question}</div>
      </div>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          let textColor = '#0F1523'

          if (submitted && correct) {
            bg = '#ECFDF3'; border = '1.5px solid #12B76A'
            badgeBg = '#12B76A'; badgeBorder = '#12B76A'; badgeColor = '#fff'
            shadow = '0 2px 8px rgba(18,183,106,.15)'
          } else if (submitted && isSelected && !correct) {
            bg = '#FEF3F2'; border = '1.5px solid #F04438'
            badgeBg = '#F04438'; badgeBorder = '#F04438'; badgeColor = '#fff'
          } else if (isSelected) {
            bg = '#EEF2FF'; border = `1.5px solid ${accent}`
            badgeBorder = accent; badgeColor = accent
            shadow = `0 2px 8px ${accent}20`
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onSelect(i)}
              style={{
                background: bg, border, borderRadius: 14,
                padding: '14px 16px',
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
                fontSize: 11, fontWeight: 700, color: badgeColor, flexShrink: 0,
              }}>
                {submitted && correct
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : submitted && isSelected && !correct
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : badgeLabel
                }
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: textColor, flex: 1, lineHeight: 1.45 }}>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* フィードバックパネル */}
      {submitted && (
        <div style={{
          borderRadius: 16, padding: '16px 18px',
          background: isCorrect ? '#ECFDF3' : '#FEF3F2',
          border: `1px solid ${isCorrect ? '#12B76A' : '#F04438'}`,
          borderLeft: `4px solid ${isCorrect ? '#12B76A' : '#F04438'}`,
          animation: 'scale-in 0.2s ease-out both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: isCorrect ? '#12B76A' : '#F04438',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {isCorrect
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1523' }}>
              {isCorrect ? t('lesson.correctMark') : t('lesson.wrongMark')}
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#3A4259', lineHeight: 1.7 }}>{step.explanation}</div>
        </div>
      )}

      {/* ボタンエリア */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!submitted ? (
          <button
            disabled={selected == null}
            onClick={onSubmit}
            style={{
              width: '100%',
              background: selected == null ? '#D1D9F0' : accent,
              color: '#fff', border: 'none', borderRadius: 14,
              padding: '16px 20px', fontSize: 15, fontWeight: 700,
              cursor: selected == null ? 'default' : 'pointer',
              boxShadow: selected == null ? 'none' : `0 4px 12px ${accent}40`,
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            回答する
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              width: '100%', background: accent, color: '#fff',
              border: 'none', borderRadius: 14, padding: '16px 20px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 12px ${accent}40`,
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
              fontSize: 11, color: '#B0B8CC', textDecoration: 'none',
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
