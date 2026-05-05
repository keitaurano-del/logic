import { useState } from 'react'
import { isPremium } from './subscription'
import { t, getLocale, localeBody } from './i18n'
import './FermiLesson.css'

import { API_BASE } from './apiBase'

const FREE_QUESTIONS_JA = [
  '日本のコンビニは何店舗あるか?',
  '東京都内に信号機は何基あるか?',
  '日本で 1 日に消費されるペットボトルの本数は?',
  '日本の美容院・理髪店の数は?',
  '東京-大阪間を歩いて移動すると何歩になるか?',
  '日本に自動販売機は何台あるか?',
  '日本人が 1 年間に飲むコーヒーの杯数は?',
]

const FREE_QUESTIONS_EN = [
  'How many Starbucks stores are there in the United States?',
  'How many traffic lights are there in New York City?',
  'How many plastic water bottles are consumed in the US per day?',
  'How many hair salons and barber shops are in the US?',
  'How many steps would it take to walk from New York to Los Angeles?',
  'How many vending machines are there in the United States?',
  'How many cups of coffee does an average American drink in a year?',
]

type FermiStep = 'problem' | 'input' | 'feedback'

type Props = {
  onBack: () => void
  onUpgrade: () => void
}

function pickRandom(): string {
  const arr = getLocale() === 'en' ? FREE_QUESTIONS_EN : FREE_QUESTIONS_JA
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function FermiLesson({ onBack, onUpgrade }: Props) {
  const [step, setStep] = useState<FermiStep>('problem')
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState<string>(() => pickRandom())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const premium = isPremium()

  const reset = (newQuestion?: string) => {
    setStep('problem')
    setUserInput('')
    setFeedback('')
    setError(null)
    if (newQuestion) setCurrentQuestion(newQuestion)
    else setCurrentQuestion(pickRandom())
  }

  const submit = async () => {
    if (!userInput.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localeBody({ question: currentQuestion, userInput })),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setFeedback(data.feedback || '')
      setStep('feedback')
    } catch {
      setError(t('fermi.errorFeedback'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAiQuestion = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localeBody({})),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      reset(data.question || pickRandom())
    } catch {
      setError(t('fermi.errorQuestion'))
    } finally {
      setIsLoading(false)
    }
  }

  // Render feedback as simple markdown-ish (handle ## headings and lists)
  // Render markdown-ish: ## headings, - / ・ bullets, 1. ordered, **bold** inline.
  const renderInline = (line: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={j} className="fl-fb-bold">{p.slice(2, -2)}</strong>
      }
      return <span key={j}>{p}</span>
    })
  }
  const renderFeedback = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h4 key={i} className="fl-fb-heading">{line.slice(3)}</h4>
      if (/^[-・]\s/.test(line)) return <li key={i} className="fl-fb-li">{renderInline(line.replace(/^[-・]\s/, ''))}</li>
      if (/^\d+\.\s/.test(line)) return <li key={i} className="fl-fb-li ordered">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>
      if (!line.trim()) return <div key={i} className="fl-fb-spacer" />
      return <p key={i} className="fl-fb-p">{renderInline(line)}</p>
    })
  }

  return (
    <div className="fl-screen">
      <header className="fl-header">
        <button className="fl-back" onClick={onBack}>‹</button>
        <span>{t('fermi.title')}</span>
        <span className="fl-header-spacer" />
      </header>

      <div className="fl-content">
        {step === 'problem' && (
          <>
            <div className="fl-context">
              {t('fermi.context')}<strong>{t('fermi.contextStrong')}</strong>{t('fermi.contextEnd')}
            </div>
            <div className="fl-question-card">
              <div className="fl-question-tag">{t('fermi.questionTag')}</div>
              <h2 className="fl-question-text">{currentQuestion}</h2>
            </div>
            <div className="fl-hint">{t('fermi.hint')}</div>
            <button className="fl-primary-btn" onClick={() => setStep('input')}>{t('fermi.thinkButton')}</button>
          </>
        )}

        {step === 'input' && (
          <>
            <div className="fl-question-mini">{currentQuestion}</div>
            {/* SCRUM-67: 思考プロセスガイド */}
            <div style={{
              background: 'var(--accent-soft)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 4,
            }}>
              <strong>分解のヒント</strong>：「対象・場所・頻度」の順に考えると整理しやすい。
            </div>
            <textarea
              className="fl-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              placeholder={t('fermi.placeholder')}
              rows={10}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
            />
            {error && <div className="fl-error">{error}</div>}
            <button className="fl-primary-btn" onClick={submit} disabled={isLoading || !userInput.trim()}>
              {isLoading ? t('fermi.submitting') : t('fermi.submitButton')}
            </button>
            <button className="fl-secondary-btn" onClick={() => setStep('problem')}>{t('fermi.backButton')}</button>
          </>
        )}

        {step === 'feedback' && (
          <>
            <div className="fl-question-mini">{currentQuestion}</div>
            <div className="fl-user-input-recap">
              <div className="fl-recap-label">{t('fermi.recapLabel')}</div>
              <div className="fl-recap-text">{userInput}</div>
            </div>
            <div className="fl-feedback-card">
              {renderFeedback(feedback)}
            </div>

            {!premium && (
              <div className="fl-upsell">
                <div className="fl-upsell-emoji">⭐</div>
                <div className="fl-upsell-body">
                  <strong>{t('fermi.upsellH')}</strong>
                  <p>{t('fermi.upsellBody')}</p>
                  <button className="fl-upsell-btn" onClick={onUpgrade}>{t('fermi.upsellBtn')}</button>
                </div>
              </div>
            )}

            {premium && (
              <button className="fl-primary-btn" onClick={fetchAiQuestion} disabled={isLoading}>
                {isLoading ? t('fermi.generating') : t('fermi.nextAi')}
              </button>
            )}

            <button className="fl-secondary-btn" onClick={() => reset()}>{t('fermi.tryAnother')}</button>

            <div className="fl-related">
              <div className="fl-related-label">{t('fermi.relatedLabel')}</div>
              <p className="fl-related-link">{t('fermi.relatedDecompose')}</p>
              <p className="fl-related-link">{t('fermi.relatedMece')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
