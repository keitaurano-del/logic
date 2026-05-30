import { useState } from 'react'
import { sendMagicLink, isSupabaseConfigured, type User } from '../supabase'
import { t } from '../i18n'

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void
}

type Step = 'email' | 'sent'

export function LoginScreen({ onLoginSuccess: _onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const ready = isSupabaseConfigured()

  const BG = 'var(--bg-slate-deep)'
  const TEXT = 'var(--text-on-hero)'
  const TEXT2 = 'var(--text-on-hero-muted)'
  const BORDER = 'var(--border-on-dark)'
  const INPUT_BG = 'var(--bg-input-on-dark)'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    background: INPUT_BG,
    color: TEXT,
    fontSize: '1.0667rem',
    fontFamily: "'Noto Sans JP', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  async function handleSendLink() {
    if (!email) { setError(t('auth.errEmailRequired')); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendMagicLink(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/invalid-email') setError(t('auth.invalidEmail'))
      else if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else if (result.error === 'auth/not-configured') setError(t('auth.errNotConfigured'))
      else setError(t('auth.errSendLinkFailed'))
      return
    }
    setStep('sent')
  }

  async function handleResend() {
    if (loading) return
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendMagicLink(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else setError(t('auth.errSendLinkFailed'))
      return
    }
    setSuccessMsg(t('auth.linkResent'))
  }

  const title = step === 'sent' ? t('auth.linkSentTitle') : t('auth.loginTitle')

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px',
      background: BG,
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      <h1 style={{
        fontSize: '1.7333rem', fontWeight: 700, color: TEXT,
        margin: '0 0 32px', textAlign: 'center',
        letterSpacing: '0.02em',
      }}>{title}</h1>

      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {error && (
          <div role="alert" aria-live="polite" style={{ fontSize: '0.9333rem', color: 'var(--md-sys-color-error)', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 10 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div role="status" aria-live="polite" style={{ fontSize: '0.9333rem', color: 'var(--success-mid)', padding: '10px 14px', background: 'var(--success-soft)', borderRadius: 10 }}>
            {successMsg}
          </div>
        )}

        {step === 'email' ? (
          <>
            <input
              type="email"
              aria-label={t('auth.emailLabel')}
              placeholder={t('auth.emailLabel')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              onKeyDown={e => { if (e.key === 'Enter') handleSendLink() }}
            />
            <button
              onClick={handleSendLink}
              disabled={loading || !ready}
              style={{
                width: '100%', padding: '16px',
                background: loading ? 'var(--accent-soft)' : 'var(--brand-grad-h)',
                border: 'none', borderRadius: 12,
                fontSize: '1.0667rem', fontWeight: 700, color: 'var(--accent-fg)',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? t('auth.processing') : t('auth.sendLinkBtn')}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.9333rem', color: TEXT2, margin: '0 0 4px', textAlign: 'center', lineHeight: 1.6 }}>
              {t('auth.linkSentTo', { email })}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 16 }}>
              <button
                onClick={handleResend}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '0.9333rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', padding: '10px 0', opacity: loading ? 0.5 : 1 }}
              >
                {t('auth.linkResend')}
              </button>
              <button
                onClick={() => { setStep('email'); setError(''); setSuccessMsg('') }}
                style={{ background: 'none', border: 'none', color: TEXT2, fontSize: '0.9333rem', cursor: 'pointer', padding: '8px 0' }}
              >
                {t('auth.backToLogin')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
