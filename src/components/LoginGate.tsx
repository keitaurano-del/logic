/**
 * LoginGate — ログイン必須機能へのアクセスゲート
 * SCRUM-181: 未ログインユーザーへの自然なログイン誘導
 */
import { v3 } from '../styles/tokensV3'

interface LoginGateProps {
  featureName: string        // 「AI問題生成」「ロールプレイ」など
  featureIcon: string        // 絵文字アイコン
  featureDesc: string        // 機能説明
  onLogin: () => void        // ログインボタン押下
  onBack: () => void         // 「あとで」
}

export function LoginGate({ featureName, featureIcon, featureDesc, onLogin, onBack }: LoginGateProps) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: v3.color.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
      gap: 0,
    }}>
      {/* アイコン */}
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: `${v3.color.accent}18`,
        border: `1.5px solid ${v3.color.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 24,
        position: 'relative',
      }}>
        <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{featureIcon}</span>
        {/* ロックアイコン */}
        <div style={{
          position: 'absolute', bottom: -6, right: -6,
          width: 24, height: 24, borderRadius: '50%',
          background: v3.color.bg, border: `1.5px solid ${v3.color.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v3.color.text2} strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      {/* テキスト */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: v3.color.text, marginBottom: 10, lineHeight: 1.3 }}>
          {featureName}を使うには<br />ログインが必要だよ
        </div>
        <div style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.7 }}>
          {featureDesc}
        </div>
      </div>

      {/* メリット */}
      <div style={{
        width: '100%', background: v3.color.card,
        borderRadius: v3.radius.card, padding: '16px 20px',
        marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {[
          { icon: '☁️', text: '学習記録がクラウドに保存される' },
          { icon: '📊', text: '進捗・XP・レベルが永続する' },
          { icon: '🤖', text: 'AI機能（問題生成・ロールプレイ）が使える' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* CTAボタン */}
      <button
        onClick={onLogin}
        style={{
          width: '100%', padding: '16px 0',
          borderRadius: 14, border: 'none',
          background: v3.color.accent, color: '#fff',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        無料で登録してはじめる
      </button>
      <button
        onClick={onBack}
        style={{
          width: '100%', padding: '12px 0',
          borderRadius: 14, border: `1px solid ${v3.color.line}`,
          background: 'transparent', color: v3.color.text2,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        あとで
      </button>

      <div style={{ marginTop: 20, fontSize: 12, color: v3.color.text3, textAlign: 'center' }}>
        すでにアカウントをお持ちの方は登録画面からログインできます
      </div>
    </div>
  )
}
