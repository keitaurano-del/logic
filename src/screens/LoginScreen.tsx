import { useState } from 'react'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { t } from '../i18n'
import { loginWithGoogle, loginWithEmail, signupWithEmail, isFirebaseConfigured, type User } from '../firebase'

interface LoginScreenProps {
  onBack: () => void
  onLoginSuccess: (user: User) => void
}

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 2.9-2.3 5.4-4.8 7v5.8h7.7c4.5-4.2 7.4-10.3 7.4-17.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-5.8c-2.2 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6C6.5 42.8 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.5 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6H2.6C1 17.4 0 20.6 0 24s1 6.6 2.6 9.5l7.9-4.7z"/>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 12.8l7.9 4.7C12.4 13.7 17.7 9.5 24 9.5z"/>
    </svg>
  )
}

function authErrorMessage(code: string): string {
  if (code === 'auth/wrong-password') return t('auth.wrongPassword')
  if (code === 'auth/user-not-found') return t('auth.userNotFound')
  if (code === 'auth/email-already-in-use') return t('auth.emailInUse')
  if (code === 'auth/weak-password') return t('auth.weakPassword')
  if (code === 'auth/invalid-email') return t('auth.invalidEmail')
  if (code === 'Firebase が設定されていません') return t('auth.firebaseNotConfigured')
  return t('auth.genericError')
}

export function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firebaseReady = isFirebaseConfigured()

  async function handleEmailSubmit() {
    setError('')
    if (!email || !password) { setError(t('auth.invalidEmail')); return }
    setLoading(true)
    const result = tab === 'login'
      ? await loginWithEmail(email, password)
      : await signupWithEmail(email, password)
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error) setError(authErrorMessage(result.error))
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error) setError(authErrorMessage(result.error))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    fontSize: 15, fontFamily: 'inherit',
    border: '1.5px solid var(--border)',
    borderRadius: 14, background: 'var(--bg-card)',
    color: 'var(--text)', outline: 'none',
    transition: 'border-color 150ms',
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">
          {tab === 'login' ? t('auth.loginTab') : t('auth.signupTab')}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', background: 'var(--bg-secondary)',
        borderRadius: 14, padding: 4, gap: 4,
      }}>
        {(['login', 'signup'] as const).map((key) => (
          <button key={key} onClick={() => { setTab(key); setError('') }} style={{
            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
            borderRadius: 11, fontSize: 14, fontWeight: 700,
            background: tab === key ? 'var(--bg-card)' : 'transparent',
            color: tab === key ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: tab === key ? 'var(--shadow-sm)' : 'none',
            transition: 'all 150ms',
          }}>
            {key === 'login' ? t('auth.loginTab') : t('auth.signupTab')}
          </button>
        ))}
      </div>

      {/* Firebase not configured warning */}
      {!firebaseReady && (
        <div style={{
          background: 'var(--warning-soft)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '12px 14px',
          fontSize: 13, color: '#92400E',
        }}>
          ⚠ {t('auth.firebaseNotConfigured')}
        </div>
      )}

      {/* Email form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            {t('auth.emailLabel')}
          </label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            {t('auth.passwordLabel')}
          </label>
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
          />
        </div>
        {error && (
          <div style={{ fontSize: 13, color: 'var(--danger)', padding: '8px 12px', background: 'rgba(220,38,38,0.06)', borderRadius: 10 }}>
            {error}
          </div>
        )}
        <Button variant="primary" size="lg" block onClick={handleEmailSubmit} disabled={loading || !firebaseReady}>
          {loading ? '...' : tab === 'login' ? t('auth.loginBtn') : t('auth.signupBtn')}
        </Button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('auth.orDivider')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Google sign in */}
      <button onClick={handleGoogle} disabled={loading || !firebaseReady} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '14px', border: '1.5px solid var(--border)',
        borderRadius: 14, background: 'var(--bg-card)', cursor: firebaseReady ? 'pointer' : 'not-allowed',
        fontSize: 15, fontWeight: 600, color: 'var(--text)',
        opacity: (loading || !firebaseReady) ? 0.5 : 1,
        transition: 'opacity 150ms',
      }}>
        <GoogleIcon />
        {t('settings.loginGoogle')}
      </button>
    </div>
  )
}
