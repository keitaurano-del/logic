import { useState } from 'react'
import { t } from '../i18n'
import { loginWithGoogle, isSupabaseConfigured, type User } from '../supabase'

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 2.9-2.3 5.4-4.8 7v5.8h7.7c4.5-4.2 7.4-10.3 7.4-17.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-5.8c-2.2 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6C6.5 42.8 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.5 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6H2.6C1 17.4 0 20.6 0 24s1 6.6 2.6 9.5l7.9-4.7z"/>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 12.8l7.9 4.7C12.4 13.7 17.7 9.5 24 9.5z"/>
    </svg>
  )
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ready = isSupabaseConfigured()

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error) setError(t('auth.genericError'))
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--bg)',
    }}>
      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--primary)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 40,
          boxShadow: 'var(--shadow-md)',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="var(--primary)"/>
            <path d="M12 20h16M20 12l8 8-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Logic</h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginTop: 8 }}>
          {t('auth.tagline')}
        </p>
      </div>

      {/* Login card */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '28px 24px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
          {t('auth.welcomeTitle')}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          {t('auth.welcomeDesc')}
        </p>

        {error && (
          <div style={{
            fontSize: 16, color: 'var(--danger)',
            padding: '10px 14px',
            background: 'rgba(220,38,38,0.06)',
            borderRadius: 10,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading || !ready}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            width: '100%', padding: '14px 20px',
            border: '1.5px solid var(--border)',
            borderRadius: 14,
            background: loading ? 'var(--bg-secondary)' : 'var(--bg-card)',
            cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
            fontSize: 18, fontWeight: 700, color: 'var(--text)',
            opacity: (loading || !ready) ? 0.6 : 1,
            transition: 'all 150ms',
          }}
        >
          {loading ? (
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{t('auth.loggingIn')}</span>
          ) : (
            <>
              <GoogleIcon />
              {t('auth.googleBtn')}
            </>
          )}
        </button>

        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          {t('auth.termsNote')}
        </p>
      </div>
    </div>
  )
}
