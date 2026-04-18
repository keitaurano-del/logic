import { useMemo, useState, useEffect } from 'react'
import { allLessons, type LessonStep } from '../lessonData'
import { recordCompletion, getCompletedCount } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
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
  const _philosopherTier = RANK_TIERS.find((t) => t.level === philosopherLevel) ?? RANK_TIERS[0]
  void _philosopherTier
  const _isJa = getLocale() === 'ja'
  void _isJa

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4FF' }}>

      {/* スクリーンヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 12px', background: 'rgba(240,244,255,.95)', borderBottom: '1px solid #E2E8FF' }}>
        <button
          onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E2E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1523" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#3A4259' }}>{lesson.title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7A849E' }}>{stepIdx + 1} / {total}</div>
      </div>

      {/* プログレスバー */}
      <div style={{ height: 3, background: '#E8EEFF' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: '#3B5BDB', transition: 'width 0.3s ease' }} />
      </div>

      {/* コンテンツ */}
      <div style={{ padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      
        {step.type === 'explain' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 問題カード */}
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 20, padding: 22, boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 8 }}>{lesson.category.toUpperCase()}</div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 800, color: '#0F1523', lineHeight: 1.45, letterSpacing: '-.025em' }}>{step.title}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '16px 18px', fontSize: 15, lineHeight: 1.75, color: '#3A4259', whiteSpace: 'pre-wrap' }}>
              {step.content}
            </div>
            <button
              onClick={handleNext}
              style={{ width: '100%', background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {isLast ? t('common.complete') : t('common.next')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 問題カード */}
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 20, padding: 22, boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 8 }}>{lesson.category.toUpperCase()}</div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 800, color: '#0F1523', lineHeight: 1.45, letterSpacing: '-.025em' }}>{step.question}</div>
            </div>

            {/* 選択肢 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {step.options.map((opt, i) => {
                const isSelected = selected === i
                const showResult = submitted
                const correct = opt.correct
                const badgeLabel = String.fromCharCode(65 + i)

                let bg = '#fff'
                let border = '1.5px solid #E2E8FF'
                let badgeBg = 'transparent'
                let badgeBorder = '#E2E8FF'
                let badgeColor = '#7A849E'

                if (showResult && correct) {
                  bg = '#ECFDF3'; border = '1.5px solid #12B76A'
                  badgeBg = '#12B76A'; badgeBorder = '#12B76A'; badgeColor = '#fff'
                } else if (showResult && isSelected && !correct) {
                  bg = '#FEF3F2'; border = '1.5px solid #F04438'
                  badgeBg = '#F04438'; badgeBorder = '#F04438'; badgeColor = '#fff'
                } else if (isSelected) {
                  bg = '#EEF2FF'; border = '1.5px solid #3B5BDB'
                  badgeBorder = '#3B5BDB'; badgeColor = '#3B5BDB'
                }

                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => setSelected(i)}
                    style={{ background: bg, border, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: submitted ? 'default' : 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: badgeBg, border: `1.5px solid ${badgeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: badgeColor, flexShrink: 0 }}>
                      {showResult && correct
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : showResult && isSelected && !correct
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        : badgeLabel
                      }
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F1523', flex: 1, lineHeight: 1.4 }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>

            {/* フィードバック */}
            {submitted && (
              <div style={{ borderRadius: 20, padding: '18px 20px', background: selected != null && step.options[selected].correct ? '#ECFDF3' : '#FEF3F2', borderLeft: `4px solid ${selected != null && step.options[selected].correct ? '#12B76A' : '#F04438'}`, animation: 'scale-in 0.2s ease-out both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: selected != null && step.options[selected].correct ? '#12B76A' : '#F04438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selected != null && step.options[selected].correct
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F1523' }}>
                    {selected != null && step.options[selected].correct ? t('lesson.correctMark') : t('lesson.wrongMark')}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#3A4259', lineHeight: 1.7 }}>{step.explanation}</div>
              </div>
            )}

            {/* 誤り報告 */}
            {onReport && (
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => onReport({ lessonId: lesson.id, lessonTitle: lesson.title, question: step.question })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#7A849E', textDecoration: 'underline', padding: '4px 8px' }}>
                  {t('report.linkText')}
                </button>
              </div>
            )}

            {/* ボタン */}
            {!submitted ? (
              <button disabled={selected == null} onClick={handleSubmit} style={{ width: '100%', background: selected == null ? '#B8BFD0' : '#3B5BDB', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: selected == null ? 'default' : 'pointer' }}>
                回答する
              </button>
            ) : (
              <button onClick={handleNext} style={{ width: '100%', background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLast ? t('common.complete') : t('common.next')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
