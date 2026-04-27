import { useState } from 'react'
import { t } from '../i18n'
import { loginWithGoogle, loginWithEmail, signupWithEmail, resetPasswordForEmail, isSupabaseConfigured, type User } from '../supabase'
import { v3 } from '../styles/tokensV3'

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void
  initialTab?: 'google' | 'email'
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

type Tab = 'google' | 'email'
type EmailMode = 'login' | 'signup' | 'reset'

export function LoginScreen({ onLoginSuccess, initialTab = 'google' }: LoginScreenProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [emailMode, setEmailMode] = useState<EmailMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const ready = isSupabaseConfigured()

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: `1.5px solid ${v3.color.line}`,
    borderRadius: 12,
    background: v3.color.bg,
    color: v3.color.text,
    fontSize: 16,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnPrimary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '14px 20px',
    border: 'none',
    borderRadius: 14,
    background: loading ? v3.color.line : v3.color.accent,
    cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
    fontSize: 16, fontWeight: 700, color: '#fff',
    opacity: (loading || !ready) ? 0.6 : 1,
    transition: 'all 150ms',
  }

  const btnSecondary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    width: '100%', padding: '14px 20px',
    border: `1.5px solid ${v3.color.line}`,
    borderRadius: 14,
    background: v3.color.card,
    cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
    fontSize: 16, fontWeight: 700, color: v3.color.text,
    opacity: (loading || !ready) ? 0.6 : 1,
    transition: 'all 150ms',
  }

  async function handleGoogle() {
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error) setError(t('auth.genericError'))
  }

  async function handleEmailLogin() {
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await loginWithEmail(email, password)
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error === 'auth/wrong-password' || result.error === 'auth/user-not-found') {
      setError('メールアドレスまたはパスワードが正しくありません')
    } else {
      setError(t('auth.genericError'))
    }
  }

  async function handleEmailSignup() {
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return }
    if (password.length < 6) { setError('パスワードは6文字以上にしてください'); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await signupWithEmail(email, password)
    setLoading(false)
    if (result.user) { onLoginSuccess(result.user); return }
    if (result.error === 'auth/email-already-in-use') {
      setError('このメールアドレスは既に登録されています')
    } else if (result.error === 'auth/weak-password') {
      setError('パスワードが弱すぎます。6文字以上にしてください')
    } else {
      setError(t('auth.genericError'))
    }
  }

  async function handlePasswordReset() {
    if (!email) { setError('メールアドレスを入力してください'); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    const result = await resetPasswordForEmail(email)
    setLoading(false)
    if (result.error) {
      setError('リセットメールの送信に失敗しました')
    } else {
      setSuccessMsg('パスワードリセット用のリンクをメールで送りました')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: v3.color.bg,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72,
          background: v3.color.accent,
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: `0 0 32px ${v3.color.accentGlow}`,
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M12 20h16M20 12l8 8-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: v3.color.text, margin: 0, fontFamily: "'Inter Tight', sans-serif" }}>Logic</h1>
        <p style={{ fontSize: 16, color: v3.color.text2, marginTop: 6 }}>{t('auth.tagline')}</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: v3.color.card,
        borderRadius: 20,
        padding: '28px 24px',
        boxShadow: v3.shadow.card,
        border: `1px solid ${v3.color.line}`,
      }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: v3.color.bg, borderRadius: 12, padding: 4, gap: 2, marginBottom: 24 }}>
          {(['google', 'email'] as Tab[]).map(t2 => (
            <div
              key={t2}
              onClick={() => { setTab(t2); setError(''); setSuccessMsg('') }}
              style={{
                flex: 1, padding: '9px 0', textAlign: 'center',
                fontSize: 14, fontWeight: 700,
                borderRadius: 9,
                background: tab === t2 ? v3.color.card : 'transparent',
                color: tab === t2 ? v3.color.text : v3.color.text2,
                cursor: 'pointer',
                transition: 'all 150ms',
                boxShadow: tab === t2 ? v3.shadow.card : 'none',
              }}
            >
              {t2 === 'google' ? 'Google' : 'メール'}
            </div>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ fontSize: 14, color: '#F04438', padding: '10px 14px', background: 'rgba(240,68,56,0.08)', borderRadius: 10, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ fontSize: 14, color: '#12B76A', padding: '10px 14px', background: 'rgba(18,183,106,0.08)', borderRadius: 10, marginBottom: 16 }}>
            {successMsg}
          </div>
        )}

        {/* Google Tab */}
        {tab === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: v3.color.text2, margin: '0 0 8px', textAlign: 'center' }}>
              Googleアカウントでかんたんログイン
            </p>
            <button onClick={handleGoogle} disabled={loading || !ready} style={btnSecondary}>
              {loading ? (
                <span style={{ fontSize: 14, color: v3.color.text2 }}>{t('auth.loggingIn')}</span>
              ) : (
                <><GoogleIcon />{t('auth.googleBtn')}</>
              )}
            </button>
            {!ready && (
              <p style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', margin: 0 }}>
                ※ 現在 Supabase が未設定のため利用できません
              </p>
            )}
          </div>
        )}

        {/* Email Tab */}
        {tab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Sub-tab: login / signup / reset */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              {(['login', 'signup', 'reset'] as EmailMode[]).map(m => (
                <div
                  key={m}
                  onClick={() => { setEmailMode(m); setError(''); setSuccessMsg('') }}
                  style={{
                    flex: 1, padding: '7px 0', textAlign: 'center',
                    fontSize: 12, fontWeight: 700,
                    borderRadius: 8,
                    background: emailMode === m ? v3.color.accentSoft : 'transparent',
                    color: emailMode === m ? v3.color.accent : v3.color.text3,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {m === 'login' ? 'ログイン' : m === 'signup' ? '新規登録' : 'リセット'}
                </div>
              ))}
            </div>

            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
            />
            {emailMode !== 'reset' && (
              <input
                type="password"
                placeholder={emailMode === 'signup' ? 'パスワード（6文字以上）' : 'パスワード'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                onKeyDown={e => { if (e.key === 'Enter') emailMode === 'login' ? handleEmailLogin() : handleEmailSignup() }}
              />
            )}

            <button
              onClick={emailMode === 'login' ? handleEmailLogin : emailMode === 'signup' ? handleEmailSignup : handlePasswordReset}
              disabled={loading || !ready}
              style={btnPrimary}
            >
              {loading ? t('auth.loggingIn') : emailMode === 'login' ? 'ログイン' : emailMode === 'signup' ? 'アカウント作成' : 'リセットメールを送る'}
            </button>

            {!ready && (
              <p style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', margin: 0 }}>
                ※ 現在 Supabase が未設定のため利用できません
              </p>
            )}
          </div>
        )}

        <p style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          {t('auth.termsNote')}
        </p>
      </div>
    </div>
  )
}
