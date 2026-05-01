import { useState } from 'react'
import { loginWithGoogle, loginWithEmail, signupWithEmail, resetPasswordForEmail, isSupabaseConfigured, type User } from '../supabase'

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void
  initialTab?: 'google' | 'email'
}

// SCRUM-235: シンプルなダークUI。スクショ参考。タブ・二段階認証なし。
export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const ready = isSupabaseConfigured()

  // ── カラー（ダークテーマ固定） ──
  const BG = '#1A1F2E'          // 背景（Slate Blue）
  const CARD = 'transparent'
  const TEXT = '#FFFFFF'
  const TEXT2 = 'rgba(255,255,255,0.55)'
  const ACCENT = '#6C8EF5'      // Slate Blue（450nm集中色）
  const BORDER = 'rgba(255,255,255,0.15)'
  const INPUT_BG = 'rgba(255,255,255,0.07)'
  const GOOGLE_BTN_BG = '#FFFFFF'

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
    if (result.error) setError('Googleログインに失敗しました。もう一度お試しください。')
  }

  async function handleSubmit() {
    if (mode === 'reset') {
      if (!email) { setError('メールアドレスを入力してください'); return }
      setError(''); setSuccessMsg(''); setLoading(true)
      const result = await resetPasswordForEmail(email)
      setLoading(false)
      if (result.error) setError('リセットメールの送信に失敗しました')
      else setSuccessMsg('パスワードリセット用のリンクをメールで送りました')
      return
    }

    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return }
    setError(''); setSuccessMsg(''); setLoading(true)

    if (mode === 'login') {
      const result = await loginWithEmail(email, password)
      setLoading(false)
      if (result.user) { onLoginSuccess(result.user); return }
      setError('メールアドレスまたはパスワードが正しくありません')
    } else {
      if (password.length < 6) { setLoading(false); setError('パスワードは6文字以上にしてください'); return }
      const result = await signupWithEmail(email, password)
      setLoading(false)
      if (result.user) {
        // 登録完了メール送信（バックグラウンド、失敗しても続行）
        fetch('/api/send-welcome-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {})
        onLoginSuccess(result.user)
        return
      }
      if (result.error === 'auth/email-already-in-use') setError('このメールアドレスは既に登録されています')
      else setError('アカウント作成に失敗しました。もう一度お試しください。')
    }
  }

  const title = mode === 'reset' ? 'パスワードリセット' : 'ログイン'
  const btnLabel = loading
    ? '処理中...'
    : mode === 'login' ? 'ログイン' : mode === 'signup' ? '新規登録' : 'リセットメールを送る'

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
      {/* タイトル */}
      <h1 style={{
        fontSize: 26, fontWeight: 700, color: TEXT,
        margin: '0 0 32px', textAlign: 'center',
        letterSpacing: '0.02em',
      }}>{title}</h1>

      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, background: CARD }}>

        {/* Googleボタン */}
        {mode !== 'reset' && (
          <button
            onClick={handleGoogle}
            disabled={loading || !ready}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', padding: '15px 20px',
              background: GOOGLE_BTN_BG,
              border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, color: '#111',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <GoogleIcon />
            Googleでログイン
          </button>
        )}

        {/* OR 区切り */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{ fontSize: 13, color: TEXT2, flexShrink: 0 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>
        )}

        {/* エラー/成功 */}
        {error && (
          <div style={{ fontSize: 14, color: '#F87171', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 10 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ fontSize: 14, color: '#34D399', padding: '10px 14px', background: 'rgba(52,211,153,0.1)', borderRadius: 10 }}>
            {successMsg}
          </div>
        )}

        {/* メールアドレス入力 */}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        {/* パスワード入力（resetは非表示） */}
        {mode !== 'reset' && (
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          />
        )}

        {/* メインボタン */}
        <button
          onClick={handleSubmit}
          disabled={loading || !ready}
          style={{
            width: '100%', padding: '16px',
            background: loading ? 'rgba(45,212,191,0.5)' : `linear-gradient(135deg, ${ACCENT}, #0EA5E9)`,
            border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700, color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4,
          }}
        >
          {btnLabel}
        </button>

        {/* サブリンク */}
        {mode === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 8 }}>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg('') }}
              style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 14, cursor: 'pointer', padding: '4px 0' }}
            >
              新規登録
            </button>
            <button
              onClick={() => { setMode('reset'); setError(''); setSuccessMsg('') }}
              style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 14, cursor: 'pointer', padding: '4px 0' }}
            >
              パスワードをお忘れですか？
            </button>
          </div>
        )}

        {(mode === 'signup' || mode === 'reset') && (
          <button
            onClick={() => { setMode('login'); setError(''); setSuccessMsg('') }}
            style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 14, cursor: 'pointer', padding: '4px 0', textAlign: 'center', marginTop: 4 }}
          >
            ← ログインに戻る
          </button>
        )}
      </div>
    </div>
  )
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
