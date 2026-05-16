import { useState } from 'react'
import { CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { API_BASE } from './apiBase'
import { getLocale, t } from '../i18n'
import { haptic } from '../platform/haptics'

interface FeedbackScreenProps {
  onBack: () => void
}

// データキー (サーバへ送信する固定値) と表示ラベルを分離
const CATEGORY_DATA = [
  { value: '機能追加', labelKey: 'feedback.cat.feature' },
  { value: 'バグ報告', labelKey: 'feedback.cat.bug' },
  { value: 'UI改善', labelKey: 'feedback.cat.ui' },
  { value: 'コンテンツ', labelKey: 'feedback.cat.content' },
  { value: 'その他', labelKey: 'feedback.cat.other' },
] as const

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const locale = getLocale()
  const [category, setCategory] = useState<string>(CATEGORY_DATA[0].value)
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
      if (!res.ok) throw new Error(data.error || t('feedback.errFallback'))
      setSent(true)
    } catch (e: unknown) {
      setError((e as Error).message || t('feedback.errFallback'))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="stack">
        <Header title={t('feedback.title')} onBack={onBack} />
        <div style={{ marginTop: 40, textAlign: 'center', padding: '0 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckIcon width={32} height={32} color="white" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{t('feedback.thanksHeading')}</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('feedback.thanksBody').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack} style={{ marginTop: 32 }}>
          {t('feedback.backHome')}
        </Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <Header title={t('feedback.title')} onBack={onBack} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="eyebrow accent">{t('feedback.eyebrow')}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{t('feedback.heading')}</h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 6 }}>
          {t('feedback.subhead')}
        </p>
      </div>

      {/* カテゴリ */}
      <div>
        <label style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          {t('feedback.categoryLabel')}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORY_DATA.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 99,
                border: `1.5px solid ${category === c.value ? 'var(--primary)' : 'var(--border)'}`,
                background: category === c.value ? 'var(--brand-soft)' : 'var(--bg-card)',
                color: category === c.value ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ */}
      <div>
        <label style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          {t('feedback.contentLabel')}
        </label>
        <textarea
          aria-label={t('feedback.contentAria')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('feedback.contentPlaceholder')}
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
          {t('feedback.charCount', { n: message.length })}
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
        {sending ? t('feedback.sending') : t('feedback.send')}
      </Button>
      </div>
    </div>
  )
}
