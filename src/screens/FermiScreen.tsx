import React, { useEffect, useState } from 'react'
import { recordCompletion, addXp, getDisplayName } from '../stats'
import { getGuestId } from '../guestId'
import { ArrowRightIcon, CheckIcon, LightbulbIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { API_BASE } from './apiBase'
import { t } from '../i18n'

function getBaseStats() {
  return [
    { label: t('fermiScreen.stat.population'), value: t('fermiScreen.stat.populationVal') },
    { label: t('fermiScreen.stat.households'), value: t('fermiScreen.stat.householdsVal') },
    { label: t('fermiScreen.stat.avgHousehold'), value: t('fermiScreen.stat.avgHouseholdVal') },
    { label: t('fermiScreen.stat.workforce'), value: t('fermiScreen.stat.workforceVal') },
    { label: t('fermiScreen.stat.tokyoPop'), value: t('fermiScreen.stat.tokyoPopVal') },
    { label: t('fermiScreen.stat.area'), value: t('fermiScreen.stat.areaVal') },
    { label: t('fermiScreen.stat.conbini'), value: t('fermiScreen.stat.conbiniVal') },
    { label: t('fermiScreen.stat.poles'), value: t('fermiScreen.stat.polesVal') },
    { label: t('fermiScreen.stat.cars'), value: t('fermiScreen.stat.carsVal') },
    { label: t('fermiScreen.stat.schools'), value: t('fermiScreen.stat.schoolsVal') },
    { label: t('fermiScreen.stat.rail'), value: t('fermiScreen.stat.railVal') },
    { label: t('fermiScreen.stat.gdp'), value: t('fermiScreen.stat.gdpVal') },
    { label: t('fermiScreen.stat.income'), value: t('fermiScreen.stat.incomeVal') },
    { label: t('fermiScreen.stat.smartphone'), value: t('fermiScreen.stat.smartphoneVal') },
    { label: t('fermiScreen.stat.lifespan'), value: t('fermiScreen.stat.lifespanVal') },
    { label: t('fermiScreen.stat.companies'), value: t('fermiScreen.stat.companiesVal') },
  ]
}

function BaseDataPanel() {
  const stats = getBaseStats()
  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{t('fermiScreen.refData')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '2px 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface FermiScreenProps {
  onBack: () => void
  onReport?: (context: { lessonTitle: string; question: string }) => void
}

interface FermiQuestion {
  question: string
  hint: string
}

interface FermiFeedback {
  feedback: string
  score?: number
  scoreBreakdown?: string
}

function getStarter(): FermiQuestion {
  return {
    question: t('fermiScreen.starterQuestion'),
    hint: t('fermiScreen.starterHint'),
  }
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
  const [question, setQuestion] = useState<FermiQuestion>(() => getStarter())
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingQ, setLoadingQ] = useState(false)
  const [feedback, setFeedback] = useState<FermiFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = t('fermiScreen.docTitle')
  }, [])

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.question, userInput: answer, guestId: getGuestId() }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setFeedback({
        feedback: data.feedback ?? '',
        score: data.score,
        scoreBreakdown: data.scoreBreakdown,
      })
      recordCompletion('fermi')
      addXp('fermi')
      // スコアをランキングに記録（fire-and-forget）
      if (typeof data.score === 'number') {
        fetch(`${API_BASE}/api/fermi/record-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getGuestId(),
            userName: getDisplayName(),
            score: data.score,
            questionIndex: -1,
            elapsedSec: 0,
            hintUsed: false,
          }),
        }).catch(() => { /* ignore */ })
      }
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
      const starter = getStarter()
      setQuestion({
        question: data.question ?? starter.question,
        hint: data.hint ?? starter.hint,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingQ(false)
    }
  }

  return { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext }
}

export function FermiScreen({ onBack, onReport }: FermiScreenProps) {
  const isDesktop = useIsDesktop()
  const state = useFermiState()
  return isDesktop ? <FermiDesktop onBack={onBack} state={state} onReport={onReport} /> : <FermiMobile onBack={onBack} state={state} onReport={onReport} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/lesson.html)
// ============================================================
function FermiMobile({ onBack, state, onReport }: { onBack: () => void; state: FermiState; onReport?: (context: { lessonTitle: string; question: string }) => void }) {
  const { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext } = state

  return (
    <div className="stack">
      <Header title={t('label.fermi')} onBack={onBack} />

      <div className="eyebrow accent">{t('label.fermi')}</div>
      <h1 className="lesson-question">{question.question}</h1>

      <div className="hint-card" style={{ marginTop: 'var(--s-4)' }}>
        <div className="hint-icon"><LightbulbIcon width={20} height={20} /></div>
        <div>
          <div className="hint-title">{t('label.hint')}</div>
          <div className="hint-body">{question.hint}</div>
                  <BaseDataPanel />
        </div>
      </div>

      <div style={{ marginTop: 'var(--s-4)' }}>
        <label className="label">{t('fermiScreen.yourAnswer')}</label>
        <textarea
          aria-label={t('fermiScreen.answerAria')}
          className="textarea"
          rows={6}
          placeholder={t('fermiScreen.answerPlaceholder')}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading || feedback != null}
        />
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16 }}>
          {error}
        </div>
      )}

      {!feedback ? (
        <Button variant="primary" size="lg" block onClick={handleSubmit} disabled={!answer.trim() || loading}>
          {loading ? t('fermiScreen.scoring') : t('fermiScreen.submit')}
        </Button>
      ) : (
        <FermiFeedbackBlock feedback={feedback} onNext={handleNext} loadingQ={loadingQ} onReport={onReport ? () => onReport({ lessonTitle: t('report.fermiTitle'), question: question.question }) : undefined} />
      )}
    </div>
  )
}

// ============================================================
// Desktop layout (matches mocks/logic-v3/desktop/lesson.html)
// ============================================================
function FermiDesktop({ onBack, state, onReport }: { onBack: () => void; state: FermiState; onReport?: (context: { lessonTitle: string; question: string }) => void }) {
  const { question, answer, loading, loadingQ, feedback, error, setAnswer, handleSubmit, handleNext } = state

  return (
    <div className="lesson-main">
      <div style={{ marginBottom: 32 }}>
        <Header title={t('label.fermi')} onBack={onBack} />
      </div>

      <div className="progress" style={{ marginBottom: 56 }}>
        <div className="progress-fill" style={{ width: '30%' }} />
      </div>

      <div style={{ marginBottom: 40, maxWidth: 760 }}>
        <div className="eyebrow accent" style={{ marginBottom: 16 }}>{t('label.fermi')}</div>
        <h1 className="lesson-question">{question.question}</h1>
      </div>

      <div className="lesson-grid">
        <div className="answer-card">
          <span className="answer-label">{t('label.yourAnswer')}</span>
          <textarea
            aria-label={t('fermiScreen.answerAria')}
            placeholder={t('fermiScreen.answerPlaceholder')}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || feedback != null}
          />
        </div>

        <aside className="hint-card">
          <div className="eyebrow accent" style={{ marginBottom: 14, display: 'block' }}>{t('label.hint')}</div>
          <div className="hint-icon"><LightbulbIcon width={20} height={20} /></div>
          <div className="hint-body">{question.hint}</div>
                  <BaseDataPanel />
        </aside>
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16, marginBottom: 'var(--s-4)' }}>
          {error}
        </div>
      )}

      <div className="submit-row">
        <div className="submit-meta">{t('fermiScreen.submitMeta')}</div>
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={!answer.trim() || loading || feedback != null}>
          {loading ? t('fermiScreen.scoring') : t('fermiScreen.submitDesktop')}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </div>

      {feedback && <FermiFeedbackBlock feedback={feedback} onNext={handleNext} loadingQ={loadingQ} onReport={onReport ? () => onReport({ lessonTitle: t('report.fermiTitle'), question: question.question }) : undefined} />}
    </div>
  )
}

/** Minimal markdown→JSX: handles ##, **, numbered lists, and plain text */
function renderFeedbackMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.JSX.Element[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={key++} style={{ height: 8 }} />)
      continue
    }
    // ## heading
    if (trimmed.startsWith('## ')) {
      const heading = trimmed.slice(3)
      elements.push(
        <div key={key++} className="eyebrow accent" style={{ marginTop: 'var(--s-3)', marginBottom: 'var(--s-1)', fontSize: 14 }}>
          {heading}
        </div>
      )
      continue
    }
    // Numbered list: 1. xxx
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (numMatch) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, fontSize: 15, lineHeight: 1.7, marginBottom: 2 }}>
          <span style={{ color: 'var(--brand)', fontWeight: 700, minWidth: 20 }}>{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} />
        </div>
      )
      continue
    }
    // Bullet list: - xxx
    if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, fontSize: 15, lineHeight: 1.7, marginBottom: 2, paddingLeft: 4 }}>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }} />
        </div>
      )
      continue
    }
    // Plain text (with bold support)
    elements.push(
      <div key={key++} style={{ fontSize: 15, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />
    )
  }
  return elements
}

/** Convert **bold** to <strong> */
function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--brand)">$1</strong>')
}

function FermiFeedbackBlock({
  feedback,
  onNext,
  loadingQ,
  onReport,
}: {
  feedback: FermiFeedback
  onNext: () => void
  loadingQ: boolean
  onReport?: () => void
}) {
  return (
    <>
      <div className="feedback-card" style={{ marginTop: 'var(--s-4)' }}>
        <div className="feedback-head">
          <div className="feedback-check">
            <CheckIcon />
          </div>
          <div className="feedback-title">{t('fermiScreen.feedbackTitle')}</div>
        </div>
        <div className="feedback-text">
          {renderFeedbackMarkdown(feedback.feedback)}
        </div>
        {onReport && (
          <button
            onClick={onReport}
            style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            {t('report.linkText')}
          </button>
        )}
      </div>
      <Button variant="primary" size="lg" block onClick={onNext} disabled={loadingQ} style={{ marginTop: 'var(--s-4)' }}>
        {loadingQ ? t('fermiScreen.nextLoading') : t('fermiScreen.next')}
      </Button>
    </>
  )
}
