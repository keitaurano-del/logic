/**
 * LoginGate — ログイン必須機能へのアクセスゲート
 * SCRUM-181: 未ログインユーザーへの自然なログイン誘導
 */
import type { ReactNode } from 'react'
import { CloudIcon, BarChartIcon, BotIcon } from '../icons'

interface LoginGateProps {
  featureName: string        // 「AI問題生成」「ロールプレイ」など
  featureIcon: ReactNode     // SVGアイコン
  featureDesc: string        // 機能説明
  onLogin: () => void        // ログインボタン押下
  onBack: () => void         // 「あとで」
}

export function LoginGate({ featureName, featureIcon, featureDesc, onLogin, onBack }: LoginGateProps) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
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
        background: `color-mix(in srgb, var(--brand) 9%, transparent)`,
        border: `1.5px solid color-mix(in srgb, var(--brand) 25%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand)',
        marginBottom: 24,
        position: 'relative',
      }}>
        {featureIcon}
        {/* ロックアイコン */}
        <div style={{
          position: 'absolute', bottom: -6, right: -6,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-primary)', border: `1.5px solid ${'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={'var(--text-secondary)'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      {/* テキスト */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
          {featureName}を使うには<br />ログインが必要だよ
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {featureDesc}
        </div>
      </div>

      {/* メリット */}
      <div style={{
        width: '100%', background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {[
          { icon: <CloudIcon width={18} height={18} />, text: '学習記録がクラウドに保存される' },
          { icon: <BarChartIcon width={18} height={18} />, text: '進捗・XP・レベルが永続する' },
          { icon: <BotIcon width={18} height={18} />, text: 'AI機能（問題生成・ロールプレイ）が使える' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: `color-mix(in srgb, var(--brand) 8%, transparent)`, color: 'var(--brand)', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* CTAボタン */}
      <button
        onClick={onLogin}
        style={{
          width: '100%', padding: '16px 0',
          borderRadius: 14, border: 'none',
          background: 'var(--brand)', color: '#fff',
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
          borderRadius: 14, border: `1px solid ${'var(--border)'}`,
          background: 'transparent', color: 'var(--text-secondary)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        あとで
      </button>

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        すでにアカウントをお持ちの方は登録画面からログインできます
      </div>
    </div>
  )
}
