import { useState } from 'react'
import { loginWithGoogle, sendEmailOtp, verifyEmailOtp, isSupabaseConfigured, type User } from '../supabase'
import { t } from '../i18n'

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void
  initialTab?: 'google' | 'email'
}

type Step = 'email' | 'verify'

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const ready = isSupabaseConfigured()

  const BG = 'var(--bg-slate-deep)'
  const CARD = 'transparent'
  const TEXT = 'var(--text-on-hero)'
  const TEXT2 = 'var(--text-on-hero-muted)'
  const BORDER = 'var(--border-on-dark)'
  const INPUT_BG = 'var(--bg-input-on-dark)'
  const GOOGLE_BTN_BG = '#4285F4'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    background: INPUT_BG,
    color: TEXT,
    fontSize: 16,
    fontFamily: "'Noto Sans JP', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  async function handleGoogle() {
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error) setError(t('auth.errGoogleFailed'))
  }

  async function handleSendCode() {
    if (!email) { setError(t('auth.errEmailRequired')); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendEmailOtp(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/invalid-email') setError(t('auth.invalidEmail'))
      else if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else if (result.error === 'auth/not-configured') setError(t('auth.errNotConfigured'))
      else setError(t('auth.errSendCodeFailed'))
      return
    }
    setStep('verify')
    setCode('')
  }

  async function handleVerify(submittedCode?: string) {
    const c = submittedCode ?? code
    if (c.length !== 6) return
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await verifyEmailOtp(email, c)
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error === 'auth/invalid-code') setError(t('auth.errInvalidCode'))
    else if (result.error === 'auth/code-expired') setError(t('auth.errCodeExpired'))
    else setError(t('auth.errSendCodeFailed'))
  }

  async function handleResend() {
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await sendEmailOtp(email)
    setLoading(false)
    if (result.error) {
      if (result.error === 'auth/rate-limited') setError(t('auth.errRateLimited'))
      else setError(t('auth.errSendCodeFailed'))
      return
    }
    setSuccessMsg(t('auth.codeResent'))
  }

  const title = step === 'verify' ? t('auth.codeLabel') : t('auth.loginTitle')

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
        fontSize: 26, fontWeight: 700, color: TEXT,
        margin: '0 0 32px', textAlign: 'center',
        letterSpacing: '0.02em',
      }}>{title}</h1>

      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, background: CARD }}>

        {step === 'email' && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading || !ready}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', padding: '15px 20px',
                background: GOOGLE_BTN_BG,
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: 'var(--accent-fg)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <GoogleIcon />
              {t('auth.googleBtn')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ fontSize: 13, color: TEXT2, flexShrink: 0 }}>{t('auth.orDivider')}</span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>
          </>
        )}

        {error && (
          <div style={{ fontSize: 14, color: 'var(--md-sys-color-error)', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 10 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ fontSize: 14, color: 'var(--success-mid)', padding: '10px 14px', background: 'var(--success-soft)', borderRadius: 10 }}>
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
              onKeyDown={e => { if (e.key === 'Enter') handleSendCode() }}
            />
            <button
              onClick={handleSendCode}
              disabled={loading || !ready}
              style={{
                width: '100%', padding: '16px',
                background: loading ? 'var(--accent-soft)' : 'var(--brand-grad-h)',
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: 'var(--accent-fg)',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? t('auth.processing') : t('auth.sendCodeBtn')}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: TEXT2, margin: '0 0 8px', textAlign: 'center' }}>
              {t('auth.codeSentTo', { email })}
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              aria-label={t('auth.codeLabel')}
              placeholder="123456"
              value={code}
              onChange={e => {
                const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(next)
                if (next.length === 6) handleVerify(next)
              }}
              style={{ ...inputStyle, letterSpacing: '0.4em', textAlign: 'center', fontSize: 22 }}
              autoComplete="one-time-code"
              autoFocus
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading || code.length !== 6}
              style={{
                width: '100%', padding: '16px',
                background: loading || code.length !== 6 ? 'var(--accent-soft)' : 'var(--brand-grad-h)',
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700, color: 'var(--accent-fg)',
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? t('auth.processing') : t('auth.verifyBtn')}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 8 }}>
              <button
                onClick={handleResend}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', padding: '4px 0' }}
              >
                {t('auth.codeResend')}
              </button>
              <button
                onClick={() => { setStep('email'); setError(''); setSuccessMsg(''); setCode('') }}
                style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 14, cursor: 'pointer', padding: '4px 0' }}
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 2.9-2.3 5.4-4.8 7v5.8h7.7c4.5-4.2 7.4-10.3 7.4-17.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-5.8c-2.2 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6C6.5 42.8 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.5 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6H2.6C1 17.4 0 20.6 0 24s1 6.6 2.6 9.5l7.9-4.7z"/>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 12.8l7.9 4.7C12.4 13.7 17.7 9.5 24 9.5z"/>
    </svg>
  )
}
