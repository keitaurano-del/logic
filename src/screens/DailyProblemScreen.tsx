import { useState, useEffect } from 'react'
import { generateTodayProblem, isDailyCompleted, markDailyCompleted } from '../dailyProblem'
import type { AIProblemSet } from '../aiProblemStore'
import type { QuizStep } from '../lessonData'
import { recordCompletion } from '../stats'
import { recordActivity } from '../activityLog'
import { ArrowRightIcon, CheckIcon, XIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import { useStudyTimer } from '../hooks/useStudyTimer'

interface DailyProblemScreenProps {
  onBack: () => void
}

type State = 'loading' | 'ready' | 'done' | 'error'

export function DailyProblemScreen({ onBack }: DailyProblemScreenProps) {
  // 学習時間計測 — デイリー問題画面の滞在時間を study_sessions に記録
  useStudyTimer({ type: 'daily_problem' })
  const [state, setState] = useState<State>(() => isDailyCompleted() ? 'done' : 'loading')
  const [problem, setProblem] = useState<AIProblemSet | null>(null)
  const [error, setError] = useState('')
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (state !== 'loading') return
    generateTodayProblem()
      .then((p) => { setProblem(p); setState('ready') })
      .catch((e: unknown) => { setError((e as Error).message); setState('error') })
  }, [state])

  if (state === 'loading') {
    return (
      <div className="stack" style={{ padding: '0 20px' }}>
        <Header title={t('dailyProblem.title')} onBack={onBack} />
        <div style={{ textAlign: 'center', padding: 'var(--s-8) 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.0667rem' }}>{t('dailyProblem.loading')}</div>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="stack" style={{ padding: '0 20px' }}>
        <Header title={t('dailyProblem.title')} onBack={onBack} />
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          {error}
        </div>
        <Button variant="default" size="lg" block onClick={onBack}>{t('dailyProblem.back')}</Button>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="stack" style={{ padding: '0 20px' }}>
        <Header title={t('dailyProblem.title')} onBack={onBack} />
        <div className="eyebrow accent">{t('label.todaysChallenge')}</div>
        <h1 style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}>{t('dailyProblem.heading')}</h1>
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">{t('dailyProblem.alreadyDoneTitle')}</div>
          </div>
          <div className="feedback-text">{t('dailyProblem.alreadyDoneBody')}</div>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack}>{t('dailyProblem.backHome')}</Button>
      </div>
    )
  }

  if (!problem) return null
  const steps = problem.steps || []

  if (finished) {
    const pct = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0
    return (
      <div className="stack" style={{ padding: '0 20px' }}>
        <Header title={t('dailyProblem.resultTitle')} onBack={onBack} />
        <div className="eyebrow accent">{t('label.todaysResult')}</div>
        <h1 style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}>{t('dailyProblem.resultHeading')}</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>{t('dailyProblem.scoreLabel')}</div>
          <div className="display" style={{ fontSize: '5.3333rem', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}%</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: '1.0667rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {t('dailyProblem.scoreLine', { correct: correctCount, total: steps.length })}
          </div>
        </section>
        <Button variant="primary" size="lg" block onClick={onBack}>{t('dailyProblem.backHome')}</Button>
      </div>
    )
  }

  const step = steps[stepIdx]
  if (!step) return null
  const quizStep = step.type === 'quiz' ? (step as QuizStep) : null
  const stepProgress = ((stepIdx + 1) / steps.length) * 100
  const isAnswered = selected !== null
  const isCorrect = selected != null && quizStep?.options[selected]?.correct

  const handleSelect = (i: number) => {
    if (isAnswered) return
    const correct = quizStep?.options[i]?.correct
    if (correct) haptic.success()
    else haptic.warning()
    setSelected(i)
    setShowExplanation(true)
    if (correct) setCorrectCount((c) => c + 1)
  }

  const handleNext = () => {
    if (stepIdx + 1 >= steps.length) {
      markDailyCompleted()
      recordCompletion('daily-problem')
      recordActivity({
        type: 'daily-problem',
        id: new Date().toISOString().slice(0, 10),
        title: t('dailyProblem.title'),
      })
      setFinished(true)
    } else {
      setStepIdx((i) => i + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  return (
    <div className="stack" style={{ padding: '0 20px' }}>
      <Header title={`${stepIdx + 1} / ${steps.length}`} onBack={onBack} />

      <div className="progress">
        <div className="progress-fill" style={{ width: `${stepProgress}%` }} />
      </div>

      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>
        {t('label.todaysChallenge')} · {problem.category}
      </div>
      <h2 style={{ fontSize: '1.6rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
        {quizStep ? quizStep.question : (step.type === 'explain' ? step.title : '')}
      </h2>

      {quizStep && (
        <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
          {quizStep.options.map((opt, i) => {
            const isSelected = selected === i
            const showCorrect = isAnswered && opt.correct
            const showWrong = isAnswered && isSelected && !opt.correct
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="card card-compact"
                style={{
                  cursor: isAnswered ? 'default' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '1.0667rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--s-3)',
                  borderColor: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : undefined,
                  background: showCorrect ? 'rgba(16,185,129,0.06)' : showWrong ? 'rgba(220,38,38,0.06)' : isSelected ? 'var(--brand-soft)' : undefined,
                }}
              >
                <span style={{
                  width: 26, height: 26,
                  borderRadius: '999px',
                  border: '1.5px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9333rem', fontWeight: 700, flexShrink: 0,
                  color: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : 'var(--text-muted)',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {showExplanation && quizStep?.explanation && (
        <div className="feedback-card" style={{ marginTop: 'var(--s-3)' }}>
          <div className="feedback-head">
            <div className="feedback-check">
              {isCorrect ? <CheckIcon /> : <XIcon />}
            </div>
            <div className="feedback-title">{isCorrect ? t('dailyProblem.correctMark') : t('dailyProblem.wrongMark')}</div>
          </div>
          <div className="feedback-text" style={{ whiteSpace: 'pre-wrap' }}>{quizStep.explanation}</div>
        </div>
      )}

      {isAnswered && (
        <Button variant="primary" size="lg" block onClick={handleNext} style={{ marginTop: 'var(--s-3)' }}>
          {stepIdx + 1 >= steps.length ? t('dailyProblem.viewResult') : t('dailyProblem.nextQuestion')}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
