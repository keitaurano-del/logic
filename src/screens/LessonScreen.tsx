import { useMemo, useState } from 'react'
import { allLessons, type LessonStep } from '../lessonData'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface LessonScreenProps {
  lessonId: number
  onBack: () => void
  onComplete: () => void
}

export function LessonScreen({ lessonId, onBack, onComplete }: LessonScreenProps) {
  const lesson = useMemo(() => allLessons[lessonId], [lessonId])
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!lesson) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
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

  const handleNext = () => {
    if (isLast) {
      recordCompletion(`lesson-${lesson.id}`)
      onComplete()
      return
    }
    setStepIdx((i) => i + 1)
    setSelected(null)
    setSubmitted(false)
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">
          <b>{stepIdx + 1}</b> / {total}
        </div>
      </div>

      <div className="progress" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
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
            {isLast ? '完了する' : '次へ'}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      ) : (
        <div className="stack">
          <div className="eyebrow accent">{lesson.category.toUpperCase()} · QUESTION</div>
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
              } else if (isSelected) cls += ' option-selected'
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
                      width: 26,
                      height: 26,
                      borderRadius: '999px',
                      border: '1.5px solid currentColor',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      color:
                        submitted && correct
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
                  {submitted && correct && <CheckIcon width={18} height={18} color="var(--success)" />}
                </button>
              )
            })}
          </div>

          {submitted && (
            <div className="feedback-card">
              <div className="feedback-head">
                <div className="feedback-check">
                  <CheckIcon />
                </div>
                <div className="feedback-title">
                  {selected != null && step.options[selected].correct ? 'Correct!' : 'もう少し'}
                </div>
              </div>
              <div className="feedback-text">{step.explanation}</div>
            </div>
          )}

          {!submitted ? (
            <Button
              variant="primary"
              size="lg"
              block
              disabled={selected == null}
              onClick={() => setSubmitted(true)}
            >
              回答する
            </Button>
          ) : (
            <Button variant="primary" size="lg" block onClick={handleNext}>
              {isLast ? '完了する' : '次へ'}
              <ArrowRightIcon width={16} height={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
