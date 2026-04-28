import { useState } from 'react'
import { v3 } from '../styles/tokensV3'

// ローカル検証用ベータコードリスト（本番では Supabase DB に繋ぐ）
const VALID_BETA_CODES = ['LOGIC2026', 'EARLYBIRD', 'KEITA0429']
const BETA_CODE_KEY = 'beta_code_verified'

interface BetaCodeScreenProps {
  onSuccess: () => void
  onSkip: () => void
}

export function BetaCodeScreen({ onSuccess, onSkip }: BetaCodeScreenProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('招待コードを入力してください')
      return
    }
    setLoading(true)
    setError('')

    // 将来的には Supabase DB で検証する箇所
    await new Promise((r) => setTimeout(r, 500)) // UX用ミニディレイ
    if (VALID_BETA_CODES.includes(trimmed)) {
      localStorage.setItem(BETA_CODE_KEY, 'true')
      onSuccess()
    } else {
      setError('コードが正しくありません')
    }
    setLoading(false)
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: v3.color.bg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    fontFamily: "'Noto Sans JP', 'Inter Tight', sans-serif",
  }

  const cardStyle: React.CSSProperties = {
    background: v3.color.card,
    borderRadius: v3.radius.card,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 400,
    boxShadow: v3.shadow.hero,
  }

  const headingStyle: React.CSSProperties = {
    color: v3.color.text,
    fontSize: v3.font.h1.size,
    fontWeight: v3.font.h1.weight,
    fontFamily: "'Inter Tight', sans-serif",
    margin: '0 0 8px 0',
    textAlign: 'center',
  }

  const subStyle: React.CSSProperties = {
    color: v3.color.text2,
    fontSize: v3.font.body.size,
    fontWeight: v3.font.body.weight,
    textAlign: 'center',
    margin: '0 0 28px 0',
    lineHeight: 1.6,
  }

  const labelStyle: React.CSSProperties = {
    color: v3.color.text2,
    fontSize: v3.font.label.size,
    fontWeight: v3.font.label.weight,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: `1.5px solid ${error ? '#F87171' : v3.color.line}`,
    borderRadius: 12,
    background: v3.color.bg,
    color: v3.color.text,
    fontSize: 18,
    fontFamily: "'Inter Tight', 'Noto Sans JP', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.12em',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'center',
    transition: 'border-color 150ms',
  }

  const btnPrimaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 20px',
    marginTop: 20,
    border: 'none',
    borderRadius: v3.radius.pill,
    background: loading ? v3.color.accentSoft : v3.color.accent,
    color: loading ? v3.color.text2 : '#082121',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Inter Tight', sans-serif",
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : v3.shadow.cta,
    transition: v3.motion.tap,
  }

  const errorStyle: React.CSSProperties = {
    color: '#F87171',
    fontSize: 13,
    fontWeight: 500,
    marginTop: 8,
    textAlign: 'center',
  }

  const skipStyle: React.CSSProperties = {
    color: v3.color.text3,
    fontSize: 13,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginTop: 20,
    display: 'block',
    textAlign: 'center',
    width: '100%',
    padding: '8px 0',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'color 150ms',
  }

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    background: v3.color.accentSoft,
    color: v3.color.accent,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: v3.radius.chip,
    padding: '4px 10px',
    marginBottom: 20,
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={badgeStyle}>BETA</span>
        </div>

        <h1 style={headingStyle}>招待コードを入力</h1>
        <p style={subStyle}>
          Logicベータ版へようこそ。<br />
          招待コードを入力してアクセスしてください。
        </p>

        <label htmlFor="beta-code-input" style={labelStyle}>
          招待コード
        </label>
        <input
          id="beta-code-input"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="XXXX0000"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          style={inputStyle}
          maxLength={20}
        />

        {error && <p style={errorStyle}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={btnPrimaryStyle}
        >
          {loading ? '確認中...' : 'コードを使用する'}
        </button>

        <button
          onClick={onSkip}
          style={skipStyle}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = v3.color.text2
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = v3.color.text3
          }}
        >
          後で入力する
        </button>
      </div>
    </div>
  )
}
