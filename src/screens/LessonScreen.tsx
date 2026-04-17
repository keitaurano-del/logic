import { useMemo, useState, useEffect } from 'react'
import { allLessons, type LessonStep } from '../lessonData'
import { recordCompletion, getCompletedCount } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { RankIllustration } from '../components/RankIllustration'
import { Confetti } from '../components/Confetti'
import { getCurrentTier, RANK_TIERS } from './homeHelpers'
import { t, getLocale } from '../i18n'

// カテゴリ→担当哲学者レベルマッピング
const CATEGORY_PHILOSOPHER: Record<string, number> = {
  fermi: 5,  // アリストテレス（分解の達人）
  logic: 3,  // ソクラテス（問答法）
  case:  6,  // デカルト（方法論的思考）
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

  // Auto-clear animation class after 500ms
  useEffect(() => {
    if (!animClass) return
    const t = setTimeout(() => setAnimClass(''), 500)
    return () => clearTimeout(t)
  }, [animClass])

  if (!lesson) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label={t('common.back')} onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
        </div>
        <div className="card empty">レッスンが見つかりません (id: {lessonId})</div>
      </div>
    )
  }

  const total = lesson.steps.length
  const step: LessonStep = lesson.steps[stepIdx]
  const progressPct = ((stepIdx + 1) / total) * 100
  const isLast = stepIdx === total - 1

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
          {/* Glow */}
          <div style={{
            position: 'absolute', top: -60, left: '50%',
            transform: 'translateX(-50%)',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(158,179,240,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ animation: 'celebrate-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <RankIllustration level={level} size={152} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30, fontWeight: 900, color: '#fff',
            letterSpacing: '-0.03em', marginTop: 24, marginBottom: 6,
            animation: 'celebrate-pop 0.5s 0.08s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {t('lesson.completedH1')}
          </h1>

          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.6)',
            marginBottom: 24,
            animation: 'fade-in-up 0.4s 0.15s ease-out both',
          }}>
            Lv.{level} · {levelTitle}
          </p>

          {/* XP badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--xp-bg)', border: '1px solid rgba(234,179,8,0.35)',
            color: '#FCD34D', borderRadius: 'var(--radius-full)',
            padding: '10px 22px', fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.01em', marginBottom: 40,
            animation: 'xp-badge-in 0.55s 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            ＋100 XP
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onComplete}
            style={{ width: '100%', maxWidth: 280 } as React.CSSProperties}
          >
            {t('common.next')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      </>
    )
  }

  // ── Main lesson UI ───────────────────────────────────────────────
  const philosopherLevel = CATEGORY_PHILOSOPHER[lesson.category] ?? 1
  const philosopherTier = RANK_TIERS.find((t) => t.level === philosopherLevel) ?? RANK_TIERS[0]
  const isJa = getLocale() === 'ja'

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">
          <b>{stepIdx + 1}</b> / {total}
        </div>
      </div>

      <div className="progress" style={{ marginBottom: 'var(--s-3)' }}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* 哲学者キャラクターバブル */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: 'var(--bg-secondary)', borderRadius: 16,
        padding: '12px 14px', marginBottom: 'var(--s-3)',
        animation: 'scale-in 0.25s ease-out both',
      }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <RankIllustration level={philosopherLevel} size={52} />
        </div>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--brand)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
          }}>
            {isJa ? philosopherTier.title : philosopherTier.titleEn} より
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{isJa ? philosopherTier.tipJa : philosopherTier.tipEn}"
          </div>
        </div>
      </div>

      {step.type === 'explain' ? (
        <div className="stack">
          <div className="eyebrow accent">{lesson.category.toUpperCase()}</div>
          <h1 className="lesson-question">{step.title}</h1>
          <div className="card" style={{ marginTop: 'var(--s-4)' }}>
            <p style={{ fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {step.content}
            </p>
          </div>
          <Button variant="primary" size="lg" block onClick={handleNext}>
            {isLast ? t('common.complete') : t('common.next')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      ) : (
        <div className="stack">
          <div className="eyebrow accent">{lesson.category.toUpperCase()} · {t('label.question')}</div>
          <h1 className="lesson-question">{step.question}</h1>

          <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
            {step.options.map((opt, i) => {
              const isSelected = selected === i
              const showResult = submitted
              const correct = opt.correct

              let cls = 'card card-compact'
              if (showResult) {
                if (correct) cls += ' option-correct'
                else if (isSelected) cls += ' option-wrong'
              } else if (isSelected) {
                cls += ' option-selected'
              }

              // Apply answer animation to relevant options
              if (showResult && animClass) {
                if (animClass === 'answer-bounce' && correct) cls += ' answer-bounce'
                if (animClass === 'answer-shake' && isSelected && !correct) cls += ' answer-shake'
              }

              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={cls}
                  style={{
                    cursor: submitted ? 'default' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: 15,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s-3)',
                    borderColor: submitted && correct
                      ? 'var(--success)'
                      : submitted && isSelected
                      ? 'var(--danger)'
                      : isSelected
                      ? 'var(--brand)'
                      : undefined,
                    background: submitted && correct
                      ? 'var(--success-soft)'
                      : submitted && isSelected
                      ? 'rgba(220, 38, 38, 0.06)'
                      : isSelected
                      ? 'var(--brand-soft)'
                      : undefined,
                  }}
                >
                  <span
                    style={{
                      width: 26, height: 26,
                      borderRadius: '999px',
                      border: '1.5px solid currentColor',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      color: submitted && correct
                        ? 'var(--success)'
                        : submitted && isSelected
                        ? 'var(--danger)'
                        : isSelected
                        ? 'var(--brand)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {submitted && correct && (
                    <CheckIcon width={18} height={18} color="var(--success)" />
                  )}
                </button>
              )
            })}
          </div>

          {submitted && (
            <div className="feedback-card" style={{ animation: 'scale-in 0.2s ease-out both' }}>
              <div className="feedback-head">
                <div className="feedback-check"><CheckIcon /></div>
                <div className="feedback-title">
                  {selected != null && step.options[selected].correct
                    ? t('lesson.correctMark')
                    : t('lesson.wrongMark')}
                </div>
              </div>
              <div className="feedback-text">{step.explanation}</div>
            </div>
          )}

          {/* 誤り報告リンク (クイズ問題表示中) */}
          {onReport && (
            <div style={{ textAlign: 'center', marginTop: 'var(--s-1)' }}>
              <button
                onClick={() => onReport({ lessonId: lesson.id, lessonTitle: lesson.title, question: step.question })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text-muted)',
                  textDecoration: 'underline', padding: '4px 8px',
                }}
              >
                {t('report.linkText')}
              </button>
            </div>
          )}

          {!submitted ? (
            <Button variant="primary" size="lg" block disabled={selected == null} onClick={handleSubmit}>
              回答する
            </Button>
          ) : (
            <Button variant="primary" size="lg" block onClick={handleNext}>
              {isLast ? t('common.complete') : t('common.next')}
              <ArrowRightIcon width={16} height={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
