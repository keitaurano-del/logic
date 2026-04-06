import { useState } from 'react'
import './ReportProblem.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

const ISSUE_TYPES = [
  { value: 'wrong-answer', label: '答えが間違っている' },
  { value: 'wrong-question', label: '問題文に誤りがある' },
  { value: 'unclear-explanation', label: '解説がわかりにくい' },
  { value: 'typo', label: '誤字・脱字' },
  { value: 'other', label: 'その他' },
]

type Props = {
  lessonTitle: string
  lessonId?: number
  question: string
  options?: { label: string; correct: boolean }[]
  onClose: () => void
}

export default function ReportProblem({ lessonTitle, lessonId, question, options, onClose }: Props) {
  const [issueType, setIssueType] = useState('wrong-answer')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/report-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle,
          lessonId,
          question,
          options,
          issueType,
          comment,
        }),
      })
      if (!res.ok) throw new Error('送信に失敗しました')
      setDone(true)
      setTimeout(() => onClose(), 2000)
    } catch (e: any) {
      setError(e.message || '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rp-overlay" onClick={onClose}>
      <div className="rp-card" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="rp-success">
            <div className="rp-success-icon">✓</div>
            <h3>報告ありがとうございます</h3>
            <p>運営チームで確認します</p>
          </div>
        ) : (
          <>
            <div className="rp-header">
              <h3>🚩 問題を報告</h3>
              <button className="rp-close" onClick={onClose}>×</button>
            </div>

            <div className="rp-question-preview">
              <div className="rp-label">対象の問題</div>
              <div className="rp-question">{question}</div>
            </div>

            <div className="rp-field">
              <div className="rp-label">問題の種類</div>
              <div className="rp-issue-list">
                {ISSUE_TYPES.map(t => (
                  <button
                    key={t.value}
                    className={`rp-issue-btn ${issueType === t.value ? 'active' : ''}`}
                    onClick={() => setIssueType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rp-field">
              <div className="rp-label">詳細（任意）</div>
              <textarea
                className="rp-textarea"
                placeholder="どこが間違っているか、何が不明か..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {error && <div className="rp-error">⚠ {error}</div>}

            <div className="rp-actions">
              <button className="rp-cancel" onClick={onClose}>キャンセル</button>
              <button className="rp-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '送信中...' : '報告を送信'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
