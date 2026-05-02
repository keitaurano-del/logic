import { useState } from 'react'
import { loginWithGoogle, loginWithEmail, signupWithEmail, isSupabaseConfigured } from '../supabase'

interface OnboardingScreenProps {
  onComplete: () => void
}

// ── カラー（Slate Blue — 450nm帯・心理学的最適集中色） ──
const C = {
  bg: '#F0F2FA',
  teal: '#6C8EF5',
  tealDark: '#4A6BD6',
  darkBg: '#1A1F2E',
  text: '#1A1F2E',
  text2: '#4A5578',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.18)',
  inputBg: 'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.18)',
  error: '#F87171',
  errorBg: 'rgba(248,113,113,0.10)',
}

// ── スライドデータ ──
const SLIDES = [
  {
    bg: '#F0FAFA',
    accentColor: C.teal,
    emojiIcon: '🧠',
    title: '論理思考力を、\n毎日鍛えよう',
    subtitle: 'レッスン・フェルミ推定・AIフィードバックで\nビジネス思考力が着実に伸びる。',
    btnLabel: 'つぎへ',
  },
  {
    bg: '#FFF8EE',
    accentColor: '#F59E0B',
    emojiIcon: '🏆',
    title: 'ランキングで\n仲間と競い合おう',
    subtitle: 'ポイントを積み上げて、あなたの論理力を証明する。',
    btnLabel: 'つぎへ',
  },
  {
    bg: '#F0F4FF',
    accentColor: '#6366F1',
    emojiIcon: '🤖',
    title: 'AIが採点して\nフィードバック',
    subtitle: '回答を送るとAIがすぐに評価。弱点もひと目でわかる。',
    btnLabel: 'はじめる',
  },
]

// ── ウェルカムスライド ─────────────────────────────────────────
function WelcomeSlides({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0)
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const next = () => {
    if (isLast) onDone()
    else setIdx(i => i + 1)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: slide.bg,
      fontFamily: "'Noto Sans JP', sans-serif",
      transition: 'background 0.4s ease',
    }}>
      {/* ビジュアルエリア（上60%） */}
      <div style={{
        flex: '0 0 58%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景デコ */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 30% 40%, ${slide.accentColor}25 0%, transparent 70%)`,
        }} />
        {/* アイコン */}
        <div style={{
          fontSize: 96,
          filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.12))',
          animation: 'float 3s ease-in-out infinite',
          position: 'relative', zIndex: 1,
        }}>
          {slide.emojiIcon}
        </div>
        {/* ドットインジケーター */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 8,
        }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 20 : 8,
              height: 8, borderRadius: 4,
              background: i === idx ? slide.accentColor : `${slide.accentColor}40`,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* テキスト + ボタン（下40%） */}
      <div style={{
        flex: 1,
        background: C.white,
        borderRadius: '24px 24px 0 0',
        padding: '32px 28px 48px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          color: C.text,
          lineHeight: 1.4,
          whiteSpace: 'pre-line',
          margin: '0 0 12px',
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: 15, color: C.text2,
          lineHeight: 1.7, margin: '0 0 32px',
        }}>
          {slide.subtitle}
        </p>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '18px',
            background: `linear-gradient(135deg, ${slide.accentColor}, ${C.tealDark})`,
            border: 'none', borderRadius: 99,
            fontSize: 17, fontWeight: 700, color: C.white,
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${slide.accentColor}50`,
          }}
        >
          {slide.btnLabel}
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  )
}

// ── 登録画面（スクショ参考） ──────────────────────────────────
function RegisterScreen({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ready = isSupabaseConfigured()

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    background: C.inputBg,
    color: C.white,
    fontSize: 16,
    fontFamily: "'Noto Sans JP', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  async function handleGoogle() {
    if (!termsChecked) { setError('利用規約に同意してください'); return }
    setError(''); setLoading(true)
    const result = await loginWithGoogle()
    setLoading(false)
    if (result.user) { onComplete(); return }
    setError('Googleログインに失敗しました。もう一度お試しください。')
  }

  async function handleEmailSignup() {
    if (!termsChecked) { setError('利用規約に同意してください'); return }
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return }
    if (password.length < 6) { setError('パスワードは6文字以上にしてください'); return }
    setError(''); setLoading(true)
    // まずログイン試行、失敗したら新規登録
    const loginResult = await loginWithEmail(email, password)
    if (loginResult.user) { setLoading(false); onComplete(); return }
    const signupResult = await signupWithEmail(email, password)
    setLoading(false)
    if (signupResult.user) { onComplete(); return }
    setError('登録に失敗しました。既に登録済みの場合はログインをお試しください。')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: C.darkBg,
      fontFamily: "'Noto Sans JP', sans-serif",
      padding: '0 24px',
      justifyContent: 'center',
    }}>
      <h1 style={{
        fontSize: 24, fontWeight: 700,
        color: C.white, textAlign: 'center',
        margin: '0 0 28px',
      }}>
        新規アカウント登録
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400, width: '100%', margin: '0 auto' }}>

        {/* 利用規約チェックボックス */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <div
            onClick={() => setTermsChecked(v => !v)}
            style={{
              width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${termsChecked ? C.teal : C.inputBorder}`,
              background: termsChecked ? C.teal : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2, cursor: 'pointer',
            }}
          >
            {termsChecked && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            <span style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/terms.html', '_blank') }}>利用規約</span>と
            <span style={{ color: C.teal, textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/privacy.html', '_blank') }}>プライバシーポリシー</span>に同意する
          </span>
        </label>

        {/* エラー */}
        {error && (
          <div style={{ fontSize: 14, color: C.error, padding: '10px 14px', background: C.errorBg, borderRadius: 10 }}>
            {error}
          </div>
        )}

        {/* Googleボタン */}
        <button
          onClick={handleGoogle}
          disabled={loading || !ready}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            width: '100%', padding: '16px',
            background: C.white, border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700, color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <GoogleIcon />
          Googleで登録
        </button>

        {/* OR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
        </div>

        {/* メール入力 */}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        {/* パスワード入力 */}
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="new-password"
          onKeyDown={e => { if (e.key === 'Enter') handleEmailSignup() }}
        />

        {/* 登録ボタン */}
        <button
          onClick={handleEmailSignup}
          disabled={loading || !ready}
          style={{
            width: '100%', padding: '17px',
            background: loading ? 'rgba(108,142,245,0.4)' : `linear-gradient(135deg, ${C.teal}, #818CF8)`,
            border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700, color: C.white,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '処理中...' : 'Logicをはじめる'}
        </button>

        {/* ログインリンク */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            お持ちのアカウントをお持ちの方は
          </span>
          <button
            onClick={() => {
              // ログイン画面に遷移（AppV3側でlogin画面に飛ばす）
              // onComplete の代わりに login 画面へ — ここでは簡易的に onComplete
              onComplete()
            }}
            style={{
              background: 'none', border: 'none',
              color: C.teal, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'block', margin: '4px auto 0',
            }}
          >
            ログイン
          </button>
        </div>

        {/* 登録せずに始める */}
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 13,
            cursor: 'pointer', padding: '8px 0', textAlign: 'center',
          }}
        >
          登録せずにはじめる
        </button>
      </div>
    </div>
  )
}

// ── GoogleIcon ────────────────────────────────────────────────────
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

// ── メインエクスポート ────────────────────────────────────────────
export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [phase, setPhase] = useState<'slides' | 'register'>('slides')

  if (phase === 'slides') {
    return <WelcomeSlides onDone={() => setPhase('register')} />
  }

  return (
    <RegisterScreen
      onComplete={onComplete}
      onSkip={onComplete}
    />
  )
}
