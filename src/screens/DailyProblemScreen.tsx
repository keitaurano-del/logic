import { useState, useEffect } from 'react'
import { generateTodayProblem, isDailyCompleted, markDailyCompleted } from '../dailyProblem'
import type { AIProblemSet } from '../aiProblemStore'
import type { QuizStep } from '../lessonData'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

interface DailyProblemScreenProps {
  onBack: () => void
}

type State = 'loading' | 'ready' | 'done' | 'error'

export function DailyProblemScreen({ onBack }: DailyProblemScreenProps) {
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
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">今日の問題</div>
        </div>
        <div style={{ textAlign: 'center', padding: 'var(--s-8) 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14 }}>今日の問題を生成中…</div>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">今日の問題</div>
        </div>
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          {error}
        </div>
        <Button variant="default" size="lg" block onClick={onBack}>戻る</Button>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">今日の問題</div>
        </div>
        <div className="eyebrow accent">{t('label.todaysChallenge')}</div>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.025em' }}>今日の問題</h1>
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">今日の問題は完了しました！</div>
          </div>
          <div className="feedback-text">また明日チャレンジしましょう。</div>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack}>ホームに戻る</Button>
      </div>
    )
  }

  if (!problem) return null
  const steps = problem.steps || []

  if (finished) {
    const pct = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">結果</div>
        </div>
        <div className="eyebrow accent">{t('label.todaysResult')}</div>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.025em' }}>結果</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>スコア</div>
          <div className="display" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}%</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {correctCount} / {steps.length} 問正解
          </div>
        </section>
        <Button variant="primary" size="lg" block onClick={onBack}>ホームに戻る</Button>
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
    setSelected(i)
    setShowExplanation(true)
    if (quizStep?.options[i]?.correct) setCorrectCount((c) => c + 1)
  }

  const handleNext = () => {
    if (stepIdx + 1 >= steps.length) {
      markDailyCompleted()
      recordCompletion('daily-problem')
      setFinished(true)
    } else {
      setStepIdx((i) => i + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text"><b>{stepIdx + 1}</b> / {steps.length}</div>
      </div>

      <div className="progress">
        <div className="progress-fill" style={{ width: `${stepProgress}%` }} />
      </div>

      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>
        {t('label.todaysChallenge')} · {problem.category}
      </div>
      <h2 style={{ fontSize: 20, lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
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
                  fontSize: 14,
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
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
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
              {isCorrect ? <CheckIcon /> : <span style={{ fontSize: 16 }}>✕</span>}
            </div>
            <div className="feedback-title">{isCorrect ? '正解！' : '不正解'}</div>
          </div>
          <div className="feedback-text" style={{ whiteSpace: 'pre-wrap' }}>{quizStep.explanation}</div>
        </div>
      )}

      {isAnswered && (
        <Button variant="primary" size="lg" block onClick={handleNext} style={{ marginTop: 'var(--s-3)' }}>
          {stepIdx + 1 >= steps.length ? '結果を見る' : '次の問題'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
