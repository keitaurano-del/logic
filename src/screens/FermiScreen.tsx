import { useEffect, useState } from 'react'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { API_BASE } from './apiBase'

interface FermiScreenProps {
  onBack: () => void
}

interface FermiQuestion {
  question: string
  hint: string
}

interface FermiFeedback {
  score: number
  feedback: string
  answer: string
  logic: string
}

const STARTER: FermiQuestion = {
  question: '日本にある電柱の本数はどれくらい?',
  hint: '国土面積と都市部の電柱密度から推定してみよう。住宅街では電柱は何 m 間隔だろう? 過疎地と都市部で密度の差を考慮するとより精度が上がります。',
}

interface FermiState {
  question: FermiQuestion
  answer: string
  loading: boolean
  loadingQ: boolean
  feedback: FermiFeedback | null
  error: string | null
  setAnswer: (v: string) => void
  handleSubmit: () => Promise<void>
  handleNext: () => Promise<void>
}

function useFermiState(): FermiState {
  const [question, setQuestion] = useState<FermiQuestion>(STARTER)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingQ, setLoadingQ] = useState(false)
  const [feedback, setFeedback] = useState<FermiFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Fermi — Logic'
  }, [])

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.question, answer }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setFeedback({
        score: data.score ?? 0,
        feedback: data.feedback ?? '',
        answer: data.answer ?? '',
        logic: data.logic ?? '',
      })
      recordCompletion('fermi')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    setLoadingQ(true)
    setError(null)
    setFeedback(null)
    setAnswer('')
    try {
      const res = await fetch(`${API_BASE}/api/fermi/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setQuestion({
        question: data.question ?? STARTER.question,
        hint: data.hint ?? STARTER.hint,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingQ(false)
    }
  }

  return { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext }
}

export function FermiScreen({ onBack }: FermiScreenProps) {
  const isDesktop = useIsDesktop()
  const state = useFermiState()
  return isDesktop ? <FermiDesktop onBack={onBack} state={state} /> : <FermiMobile onBack={onBack} state={state} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/lesson.html)
// ============================================================
function FermiMobile({ onBack, state }: { onBack: () => void; state: FermiState }) {
  const { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext } = state

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">FERMI</div>
      </div>

      <div className="eyebrow accent">FERMI ESTIMATE</div>
      <h1 className="lesson-question">{question.question}</h1>

      <div className="hint-card" style={{ marginTop: 'var(--s-4)' }}>
        <div className="hint-icon">💡</div>
        <div>
          <div className="hint-title">HINT</div>
          <div className="hint-body">{question.hint}</div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--s-4)' }}>
        <label className="label">Your answer</label>
        <textarea
          className="textarea"
          rows={6}
          placeholder="計算式や考え方を書いてみよう..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading || feedback != null}
        />
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!feedback ? (
        <Button variant="primary" size="lg" block onClick={handleSubmit} disabled={!answer.trim() || loading}>
          {loading ? '採点中…' : '送信する'}
        </Button>
      ) : (
        <FermiFeedbackBlock feedback={feedback} onNext={handleNext} loadingQ={loadingQ} />
      )}
    </div>
  )
}

// ============================================================
// Desktop layout (matches mocks/logic-v3/desktop/lesson.html)
// ============================================================
function FermiDesktop({ onBack, state }: { onBack: () => void; state: FermiState }) {
  const { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext } = state

  return (
    <div className="lesson-main">
      <div className="screen-header" style={{ marginBottom: 32 }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">FERMI ESTIMATE</div>
      </div>

      <div className="progress" style={{ marginBottom: 56 }}>
        <div className="progress-fill" style={{ width: '30%' }} />
      </div>

      <div style={{ marginBottom: 40, maxWidth: 760 }}>
        <div className="eyebrow accent" style={{ marginBottom: 16 }}>FERMI ESTIMATE</div>
        <h1 className="lesson-question">{question.question}</h1>
      </div>

      <div className="lesson-grid">
        <div className="answer-card">
          <span className="answer-label">YOUR ANSWER</span>
          <textarea
            placeholder="計算式や考え方を書いてみよう..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || feedback != null}
          />
        </div>

        <aside className="hint-card">
          <div className="eyebrow accent" style={{ marginBottom: 14, display: 'block' }}>HINT</div>
          <div className="hint-icon">💡</div>
          <div className="hint-body">{question.hint}</div>
        </aside>
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13, marginBottom: 'var(--s-4)' }}>
          {error}
        </div>
      )}

      <div className="submit-row">
        <div className="submit-meta">回答後に AI が採点します</div>
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={!answer.trim() || loading || feedback != null}>
          {loading ? '採点中…' : 'Submit answer'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </div>

      {feedback && <FermiFeedbackBlock feedback={feedback} onNext={handleNext} loadingQ={loadingQ} />}
    </div>
  )
}

function FermiFeedbackBlock({
  feedback,
  onNext,
  loadingQ,
}: {
  feedback: FermiFeedback
  onNext: () => void
  loadingQ: boolean
}) {
  return (
    <>
      <div className="feedback-card" style={{ marginTop: 'var(--s-4)' }}>
        <div className="feedback-head">
          <div className="feedback-check">
            <CheckIcon />
          </div>
          <div className="feedback-title">Score {feedback.score} / 10</div>
        </div>
        <div className="feedback-text" style={{ whiteSpace: 'pre-wrap' }}>
          {feedback.feedback}
        </div>
        {feedback.answer && (
          <div style={{ marginTop: 'var(--s-3)' }}>
            <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>推定解</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: '#047857', whiteSpace: 'pre-wrap' }}>
              {feedback.answer}
            </div>
          </div>
        )}
        {feedback.logic && (
          <div style={{ marginTop: 'var(--s-3)' }}>
            <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>計算ロジック</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: '#047857', whiteSpace: 'pre-wrap' }}>
              {feedback.logic}
            </div>
          </div>
        )}
      </div>
      <Button variant="primary" size="lg" block onClick={onNext} disabled={loadingQ} style={{ marginTop: 'var(--s-4)' }}>
        {loadingQ ? '次の問題を生成中…' : '次の問題へ'}
      </Button>
    </>
  )
}
