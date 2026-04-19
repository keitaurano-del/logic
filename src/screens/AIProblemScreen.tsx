import { useState } from 'react'
import type { AIProblemSet } from '../aiProblemStore'
import type { QuizStep } from '../lessonData'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

interface AIProblemScreenProps {
  problem: AIProblemSet
  onBack: () => void
  onReport?: (context: { lessonTitle: string; question: string }) => void
}

export function AIProblemScreen({ problem, onBack, onReport }: AIProblemScreenProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [thinkingNote, setThinkingNote] = useState('')

  const steps = problem.steps || []
  const step = steps[stepIdx]
  const quizStep = step?.type === 'quiz' ? (step as QuizStep) : null
  const progress = steps.length > 0 ? ((stepIdx + 1) / steps.length) * 100 : 0

  const isAnswered = selected !== null
  const isCorrect = selected != null && quizStep?.options[selected]?.correct

  const handleSelect = (i: number) => {
    if (isAnswered) return
    setSelected(i)
    if (quizStep?.options[i]?.correct) setCorrectCount((c) => c + 1)
  }

  const handleNext = () => {
    if (stepIdx + 1 >= steps.length) {
      recordCompletion(`ai-problem-${problem.id}`)
      setFinished(true)
    } else {
      setStepIdx((i) => i + 1)
      setSelected(null)
    }
  }

  if (finished) {
    const pct = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">結果</div>
        </div>
        <div className="eyebrow accent">AI 問題の結果</div>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.025em' }}>{problem.title}</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>スコア</div>
          <div className="display" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}%</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {correctCount} / {steps.length} 問正解
          </div>
        </section>
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">
              {pct >= 80 ? '素晴らしい！' : pct >= 60 ? 'よくできました！' : '復習しましょう。'}
            </div>
          </div>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack}>戻る</Button>
      </div>
    )
  }

  if (!step) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        </div>
        <div className="card">問題が見つかりません</div>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text"><b>{stepIdx + 1}</b> / {steps.length}</div>
      </div>

      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>{problem.category}</div>
      <h2 style={{ fontSize: 20, lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
        {quizStep ? quizStep.question : (step.type === 'explain' ? step.title : '')}
      </h2>

      {quizStep ? (
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
      ) : (
        <div style={{ marginTop: 'var(--s-3)' }}>
          <div className="card" style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginBottom: 12 }}>
            {step.type === 'explain' ? step.content : '解説を読んでください。'}
          </div>
          {/* SCRUM-82: 思考プロセス入力ボックス */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              自分の言葉でまとめてみよう（任意）
            </label>
            <textarea
              value={thinkingNote}
              onChange={(e) => setThinkingNote(e.target.value)}
              placeholder="理解したことや気づいたことをメモ..."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px',
                fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 12, background: 'var(--bg-card)',
                color: 'var(--text)', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {isAnswered && quizStep?.explanation && (
        <div className="feedback-card" style={{ marginTop: 'var(--s-3)' }}>
          <div className="feedback-head">
            <div className="feedback-check">
              {isCorrect ? <CheckIcon /> : <span style={{ fontSize: 16 }}>✕</span>}
            </div>
            <div className="feedback-title">{isCorrect ? '正解！' : '不正解'}</div>
          </div>
          <div className="feedback-text" style={{ whiteSpace: 'pre-wrap' }}>{quizStep.explanation}</div>
          {onReport && (
            <button
              onClick={() => onReport({ lessonTitle: problem.title, question: quizStep.question })}
              style={{ marginTop: 'var(--s-3)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              {t('report.linkText')}
            </button>
          )}
        </div>
      )}

      {(isAnswered || !quizStep) && (
        <Button variant="primary" size="lg" block onClick={handleNext} style={{ marginTop: 'var(--s-3)' }}>
          {stepIdx + 1 >= steps.length ? '結果を見る' : '次の問題'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
