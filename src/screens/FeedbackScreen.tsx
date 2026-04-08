import { useState } from 'react'
import { ArrowLeftIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface FeedbackScreenProps {
  onBack: () => void
}

const CATEGORIES = ['機能追加', 'バグ報告', 'UI改善', 'その他'] as const

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!message.trim()) return
    const subject = encodeURIComponent(`[Logic フィードバック] ${category}`)
    const body = encodeURIComponent(`カテゴリ: ${category}\n\n${message.trim()}\n\n---\nSent from Logic App`)
    window.location.href = `mailto:keita.urano@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  if (sent) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">FEEDBACK</div>
        </div>
        <div className="feedback-card" style={{ marginTop: 'var(--s-6)' }}>
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">ありがとうございます！</div>
          </div>
          <div className="feedback-text">メールアプリが開きます。送信ボタンを押してフィードバックを送ってください。</div>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack}>ホームに戻る</Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">FEEDBACK</div>
      </div>

      <div className="eyebrow accent">FEEDBACK</div>
      <h1 style={{ fontSize: 26, letterSpacing: '-0.025em' }}>ご要望・フィードバック</h1>

      <div className="card" style={{ marginTop: 'var(--s-4)' }}>
        <label className="label">カテゴリ</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginBottom: 'var(--s-4)' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${category === c ? 'var(--brand)' : 'var(--border)'}`,
                background: category === c ? 'var(--brand-soft)' : 'none',
                color: category === c ? 'var(--brand)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="label">内容</label>
        <textarea
          className="textarea"
          rows={6}
          placeholder="アプリの改善点やほしい機能を教えてください..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          variant="primary" size="lg" block
          onClick={handleSubmit}
          disabled={!message.trim()}
          style={{ marginTop: 'var(--s-4)' }}
        >
          フィードバックを送信
        </Button>
      </div>
    </div>
  )
}
