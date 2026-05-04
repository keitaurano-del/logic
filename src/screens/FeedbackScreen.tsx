import { useState } from 'react'
import { ArrowLeftIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { API_BASE } from './apiBase'
import { getLocale } from '../i18n'
import { haptic } from '../platform/haptics'

interface FeedbackScreenProps {
  onBack: () => void
}

const CATEGORIES = ['機能追加', 'バグ報告', 'UI改善', 'コンテンツ', 'その他'] as const

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const locale = getLocale()
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim() || sending) return
    haptic.light()
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message: message.trim(), locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      setSent(true)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">フィードバック</div>
        </div>
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckIcon width={32} height={32} color="white" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>ありがとうございます！</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            フィードバックを受け取りました。<br />アプリ改善に活かします。
          </p>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack} style={{ marginTop: 32 }}>
          ホームに戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">フィードバック</div>
      </div>

      <div>
        <div className="eyebrow accent">ベータ版</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>ご意見・ご要望</h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 6 }}>
          アプリをより良くするためのフィードバックをお聞かせください
        </p>
      </div>

      {/* カテゴリ */}
      <div>
        <label style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          カテゴリ
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '7px 14px',
                borderRadius: 99,
                border: `1.5px solid ${category === c ? 'var(--primary)' : 'var(--border)'}`,
                background: category === c ? 'var(--brand-soft)' : 'var(--bg-card)',
                color: category === c ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ */}
      <div>
        <label style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          内容
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="気になった点、改善してほしい点、欲しい機能など..."
          rows={5}
          style={{
            width: '100%', padding: '14px 16px',
            fontSize: 16, fontFamily: 'inherit',
            border: '1.5px solid var(--border)',
            borderRadius: 14, background: 'var(--bg-card)',
            color: 'var(--text)', outline: 'none', resize: 'vertical',
            boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {message.length} 文字
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 16, color: 'var(--danger)', padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: 10 }}>
          {error}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        block
        onClick={handleSubmit}
        disabled={!message.trim() || sending}
      >
        {sending ? '送信中...' : '送信する'}
      </Button>
    </div>
  )
}
