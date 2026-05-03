import React, { useEffect, useState } from 'react'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LightbulbIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { API_BASE } from './apiBase'
import { t } from '../i18n'

const BASE_STATS = [
  { label: '日本の人口', value: '約1億2,400万人' },
  { label: '世帯数', value: '約5,700万世帯' },
  { label: '平均世帯人数', value: '2.17人' },
  { label: '労働力人口', value: '約6,900万人' },
  { label: '東京都の人口', value: '約1,400万人' },
  { label: '国土面積', value: '約37.8万km²' },
  { label: 'コンビニ数', value: '約5.6万店' },
  { label: '電柱数', value: '約3,500万本' },
  { label: '自動車保有数', value: '約7,800万台' },
  { label: '小学校数', value: '約1.9万校' },
  { label: '鉄道利用者数/日', value: '約4,800万人' },
  { label: 'GDP', value: '約600兆円' },
  { label: '平均年収', value: '約460万円' },
  { label: 'スマホ普及率', value: '約97%' },
  { label: '平均寿命', value: '約84歳' },
  { label: '会社数', value: '約368万社' },
]

function BaseDataPanel() {
  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>参考データ</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        {BASE_STATS.map((s) => (
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
    document.title = 'フェルミ推定 — Logic'
  }, [])

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.question, userInput: answer }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setFeedback({
        feedback: data.feedback ?? '',
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
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('label.fermi')}</div>
      </div>

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
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16 }}>
          {error}
        </div>
      )}

      {!feedback ? (
        <Button variant="primary" size="lg" block onClick={handleSubmit} disabled={!answer.trim() || loading}>
          {loading ? '採点中…' : '送信する'}
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
      <div className="screen-header" style={{ marginBottom: 32 }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('label.fermi')}</div>
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
            placeholder="計算式や考え方を書いてみよう..."
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
        <div className="submit-meta">回答後に AI が採点します</div>
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={!answer.trim() || loading || feedback != null}>
          {loading ? '採点中…' : 'Submit answer'}
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
          <div className="feedback-title">AI フィードバック</div>
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
        {loadingQ ? '次の問題を生成中…' : '次の問題へ'}
      </Button>
    </>
  )
}
