import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { logout } from '../supabase'

interface Props {
  onBack: () => void
  currentUser: { email: string } | null
  onOpenLogin: (tab?: 'google' | 'email') => void
  onLogout: () => void
}

function Row({ label, sub, onClick, danger }: { label: string; sub?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: danger ? '#F04438' : 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {onClick && !danger && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8BFD0" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      )}
    </div>
  )
}

export function AccountSettingsScreen({ onBack, currentUser, onOpenLogin, onLogout }: Props) {
  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await logout()
      onLogout()
    }
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="戻る" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">アカウント</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {currentUser ? (
            <>
              <Row label="メールアドレス" sub={currentUser.email} />
              <Row label="ログアウト" onClick={handleLogout} danger />
            </>
          ) : (
            <>
              <Row label="Googleでログイン" onClick={() => onOpenLogin('google')} />
              <Row label="メールアドレスでログイン" onClick={() => onOpenLogin('email')} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
