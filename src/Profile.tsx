import { useState, useEffect } from 'react'
import { getCompletedLessons, getStreak, getStudyHours, getTotalStudyDays } from './stats'
import { loginWithGoogle, logout, onAuthChange, type User } from './supabase'
import { loadGuestUser, updateGuestId } from './guestUser'
import { isDevMode, setDevMode as persistDevMode } from './devMode'
import { BETA_MODE } from './subscription'
import SubscriptionManagement from './SubscriptionManagement'
import { resetAllData } from './dataReset'
import { loadReminderPref, scheduleDailyReminder, cancelDailyReminder, requestNotificationPermission, isNative } from './notifications'
import { t, getLocale, setLocale } from './i18n'
import './Profile.css'

type ProfileProps = {
  onFeedback?: () => void
  onPricing?: () => void
  onDeviation?: () => void
  onTheme?: () => void
  onRanking?: () => void
}

export default function Profile({ onFeedback, onPricing, onDeviation, onTheme, onRanking }: ProfileProps) {
  const completedLessons = getCompletedLessons()
  const streak = getStreak()
  const studyHours = getStudyHours()
  const totalDays = getTotalStudyDays()

  const [showSettings, setShowSettings] = useState(false)
  const [devMode, setDevMode] = useState(isDevMode())
  const [notifications, setNotifications] = useState(() => localStorage.getItem('logic-notifications') !== 'off')
  const [reminderPref, setReminderPref] = useState(loadReminderPref())
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [guest, setGuest] = useState(loadGuestUser())
  const [editingId, setEditingId] = useState(false)
  const [idDraft, setIdDraft] = useState(guest.id)
  const [idError, setIdError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u))
    return unsubscribe
  }, [])

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    setAuthError('')
    const { error } = await loginWithGoogle()
    if (error) setAuthError(error)
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  const toggleNotifications = () => {
    const next = !notifications
    setNotifications(next)
    localStorage.setItem('logic-notifications', next ? 'on' : 'off')
  }
  const toggleDevModeFn = () => {
    const next = !devMode
    setDevMode(next)
    persistDevMode(next)
  }
  const handleResetProgress = () => {
    if (confirm('学習データをすべてリセットしますか？この操作は取り消せません。')) {
      localStorage.clear()
      location.reload()
    }
  }

  return (
    <div className="profile">
      {/* Settings Panel */}
      {showSettings && (
        <div className="pf-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="pf-settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pf-settings-header">
              <button className="pf-settings-back" onClick={() => setShowSettings(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <h2 className="pf-settings-title">設定</h2>
              <div style={{ width: 24 }} />
            </div>

            <div className="pf-settings-body">
              <div className="pf-settings-group">
                <h3 className="pf-settings-group-title">アカウント</h3>
                {user ? (
                  <div className="pf-settings-account">
                    <div className="pf-settings-user">
                      {user.user_metadata?.avatar_url && <img className="pf-settings-avatar" src={user.user_metadata.avatar_url} alt="" />}
                      <div className="pf-settings-user-info">
                        <span className="pf-settings-user-name">{user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''}</span>
                        <span className="pf-settings-user-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="pf-settings-item" onClick={handleLogout}>
                      <span className="pf-settings-label">ログアウト</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <>
                    {authError && <p className="pf-auth-error">{authError}</p>}
                    <div className="pf-settings-item" onClick={handleGoogleLogin}>
                      <span className="pf-settings-label">{authLoading ? 'ログイン中...' : 'Googleでログイン'}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>

              <div className="pf-settings-group">
                <h3 className="pf-settings-group-title">一般</h3>
                <div className="pf-settings-item" onClick={toggleNotifications}>
                  <span className="pf-settings-label">通知</span>
                  <div className={`pf-settings-toggle ${notifications ? 'on' : ''}`}>
                    <div className="pf-settings-toggle-knob" />
                  </div>
                </div>
              </div>

              <div className="pf-settings-group">
                <h3 className="pf-settings-group-title">管理</h3>
                <div className="pf-settings-item" onClick={toggleDevModeFn}>
                  <span className="pf-settings-label">管理者モード</span>
                  <div className={`pf-settings-toggle ${devMode ? 'on' : ''}`}>
                    <div className="pf-settings-toggle-knob" />
                  </div>
                </div>
              </div>

              <div className="pf-settings-group">
                <h3 className="pf-settings-group-title">データ</h3>
                <div className="pf-settings-item pf-settings-danger" onClick={handleResetProgress}>
                  <span className="pf-settings-label">学習データをリセット</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>

              <div className="pf-settings-footer">
                <span className="pf-settings-version">Logic v1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pf-hero">
        <button className="pf-settings-btn" onClick={() => setShowSettings(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <div className="pf-avatar-area">
          <div className="pf-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
        <h2 className="pf-name">{user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? guest.id}</h2>
        {!user && (
          <div className="pf-guest-info">
            {editingId ? (
              <div className="pf-guest-edit">
                <input
                  className="pf-guest-input"
                  value={idDraft}
                  onChange={e => { setIdDraft(e.target.value); setIdError('') }}
                  maxLength={32}
                  autoFocus
                  placeholder="新しいID"
                />
                <button
                  className="pf-guest-save"
                  onClick={() => {
                    try {
                      const updated = updateGuestId(idDraft)
                      setGuest(updated)
                      setEditingId(false)
                    } catch (e: any) {
                      setIdError(e.message)
                    }
                  }}
                >保存</button>
                <button
                  className="pf-guest-cancel"
                  onClick={() => { setEditingId(false); setIdDraft(guest.id); setIdError('') }}
                >×</button>
              </div>
            ) : (
              <div className="pf-guest-row">
                <span className="pf-guest-badge">ゲスト</span>
                <button className="pf-guest-edit-btn" onClick={() => { setIdDraft(guest.id); setEditingId(true) }}>
                  IDを変更
                </button>
              </div>
            )}
            {idError && <div className="pf-guest-error">{idError}</div>}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="pf-stats-grid">
        <div className="pf-stat-card">
          <span className="pf-stat-value">{streak}</span>
          <span className="pf-stat-label">連続日数</span>
        </div>
        <div className="pf-stat-card">
          <span className="pf-stat-value">{completedLessons.length}</span>
          <span className="pf-stat-label">完了レッスン</span>
        </div>
        <div className="pf-stat-card">
          <span className="pf-stat-value">{studyHours}</span>
          <span className="pf-stat-label">学習時間</span>
        </div>
        <div className="pf-stat-card">
          <span className="pf-stat-value">{totalDays}</span>
          <span className="pf-stat-label">学習日数</span>
        </div>
      </div>


      {/* Completed Lessons */}
      {completedLessons.length > 0 && (
        <div className="pf-section">
          <h3 className="pf-section-title">完了したレッスン</h3>
          <div className="pf-completed-list">
            {completedLessons.map((key) => (
              <div key={key} className="pf-completed-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="pf-completed-name">{formatLessonKey(key)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {completedLessons.length === 0 && (
        <div className="pf-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4"/>
          </svg>
          <p>レッスンを始めると<br />ここに記録が表示されます</p>
        </div>
      )}

      {/* Deviation Card */}
      {onDeviation && (
        <div className="pf-deviation-card" onClick={onDeviation}>
          <span>{t('profile.deviation')}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* Ranking Card */}
      {onRanking && (
        <div className="pf-deviation-card" onClick={onRanking}>
          <span>{t('profile.ranking')}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* Theme Card */}
      {onTheme && (
        <div className="pf-deviation-card" onClick={onTheme}>
          <span>{t('profile.theme')}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* Daily reminder (today's problem) */}
      <div className="pf-deviation-card" style={{ display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: reminderPref.enabled ? 10 : 0 }}>
          <span>{t('profile.reminder')}</span>
          <input
            type="checkbox"
            checked={reminderPref.enabled}
            onChange={async (e) => {
              if (e.target.checked) {
                if (isNative()) {
                  const ok = await requestNotificationPermission()
                  if (!ok) {
                    alert(t('profile.reminderNoPermission'))
                    return
                  }
                }
                await scheduleDailyReminder(reminderPref.hour, reminderPref.minute)
                setReminderPref(loadReminderPref())
              } else {
                await cancelDailyReminder()
                setReminderPref(loadReminderPref())
              }
            }}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
        </div>
        {reminderPref.enabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('profile.reminderTime')}</span>
            <input
              type="time"
              value={`${String(reminderPref.hour).padStart(2, '0')}:${String(reminderPref.minute).padStart(2, '0')}`}
              onChange={async (e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                await scheduleDailyReminder(h, m)
                setReminderPref(loadReminderPref())
              }}
              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
            {!isNative() && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('profile.reminderWebNote')}</span>}
          </div>
        )}
      </div>

      {/* Language picker */}
      <div className="pf-deviation-card" style={{ display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>{t('profile.languageTitle')}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => getLocale() !== 'ja' && setLocale('ja')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1.5px solid ' + (getLocale() === 'ja' ? 'var(--accent)' : 'var(--border)'),
                background: getLocale() === 'ja' ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: getLocale() === 'ja' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t('profile.languageJa')}
            </button>
            <button
              onClick={() => getLocale() !== 'en' && setLocale('en')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1.5px solid ' + (getLocale() === 'en' ? 'var(--accent)' : 'var(--border)'),
                background: getLocale() === 'en' ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: getLocale() === 'en' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t('profile.languageEn')}
            </button>
          </div>
        </div>
      </div>

      {/* Legal links */}
      <div className="pf-deviation-card" onClick={() => window.open('/privacy.html', '_blank')}>
        <span>{t('profile.privacy')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div className="pf-deviation-card" onClick={() => window.open('/terms.html', '_blank')}>
        <span>{t('profile.terms')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div className="pf-deviation-card" onClick={() => window.open('/tokushoho.html', '_blank')}>
        <span>{t('profile.tokushoho')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      {/* Data deletion (GDPR / Play Store 必須) */}
      <div className="pf-deviation-card" style={{ borderColor: 'var(--danger)' }} onClick={async () => {
        if (!confirm(t('profile.deleteConfirm'))) return
        await resetAllData()
        alert(t('profile.deleteSuccess'))
        window.location.reload()
      }}>
        <span style={{ color: 'var(--danger)' }}>{t('profile.deleteData')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      {/* Subscription management — hidden during beta (BETA_MODE) */}
      {onPricing && !BETA_MODE && (
        <div className="pf-section">
          <SubscriptionManagement userId={user?.id ?? null} onChangePlan={onPricing} />
        </div>
      )}
      {BETA_MODE && (
        <div className="pf-plan-card" style={{ cursor: 'default' }}>
          <div className="pf-plan-card-info">
            <span className="pf-plan-card-label">{t('profile.planLabel')}</span>
            <span className="pf-plan-card-value">{t('profile.planBeta')}</span>
          </div>
        </div>
      )}

      {onFeedback && (
        <div className="pf-section">
          <button
            onClick={onFeedback}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {t('profile.feedback')}
          </button>
        </div>
      )}

      {devMode && <DevPanel />}

      <div className="pf-bottom-space" />
    </div>
  )
}

const TECH_STACK = [
  { category: 'フロントエンド', items: [
    { name: 'React', desc: 'UIを構築するJavaScriptライブラリ。コンポーネント（部品）を組み合わせて画面を作る' },
    { name: 'TypeScript', desc: 'JavaScriptに「型」を追加した言語。変数にどんなデータが入るか事前に定義してバグを防ぐ' },
    { name: 'Vite', desc: '開発サーバー＆ビルドツール。コードを保存すると即座にブラウザに反映される' },
    { name: 'CSS', desc: '画面のデザイン（色、配置、アニメーション）を定義するスタイル言語' },
  ]},
  { category: 'バックエンド', items: [
    { name: 'Express', desc: 'Node.jsのWebサーバーフレームワーク。APIエンドポイント（/api/...）を作る' },
    { name: 'Claude API', desc: 'AnthropicのAI API。ロールプレイの会話、採点、フラッシュカード生成に使用' },
  ]},
  { category: 'データ保存', items: [
    { name: 'localStorage', desc: 'ブラウザ内蔵のデータ保存。学習記録、フラッシュカード、設定などをJSON形式で保持' },
  ]},
]

const SOURCE_FILES = [
  {
    path: 'src/App.tsx',
    role: 'エントリーポイント',
    desc: 'アプリ全体のルーティングと状態管理を担当。下部タブバーで画面を切り替え、レッスン完了時のリワード表示や学習時間の計測もここで行う。各画面コンポーネント（Profile、Lesson、Flashcardsなど）をimportし、stateに応じて表示を切り替える。',
    tech: ['React', 'TypeScript', 'useState', 'useEffect', 'useCallback'],
    lines: '約400行',
    code: `// 各画面コンポーネントを読み込み
import RolePlaySystem from './RolePlaySystem'
import Lesson from './Lesson'
import Lesson from './Lesson'
import Knowledge from './Knowledge'
import Profile from './Profile'
import Flashcards from './Flashcards'
import Reward from './Reward'

// レッスン一覧データ（id, タイトル, カテゴリなど）
const lessons = [
  { id: 3,  category: 'ロールプレイ', title: '上司とのレビュー会議', action: 'roleplay' },
  { id: 20, category: 'ロジカルシンキング', title: 'MECE — 漏れなくダブりなく', action: 'lesson' },
  // ...全16レッスン
]

type Tab = 'home' | 'lessons' | 'roleplay' | 'knowledge' | 'profile'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')        // 現在のタブ
  const [screen, setScreen] = useState<Screen>(null)  // 表示中の画面
  const studyStart = useRef(Date.now())               // 学習時間計測用

  // タブに応じてコンポーネントを切り替え
  if (screen?.type === 'lesson') return <Lesson ... />
  if (screen?.type === 'roleplay') return <RolePlaySystem ... />
  if (tab === 'profile') return <Profile />
  return <HomeScreen />  // デフォルトはホーム画面
}`,
  },
  {
    path: 'server/index.ts',
    role: 'バックエンドAPI',
    desc: 'Expressサーバーで3つのAPIエンドポイントを提供。(1) /api/roleplay/chat: Claude APIでロールプレイ相手を演じる (2) /api/roleplay/score: 会話内容を5カテゴリで採点 (3) /api/flashcards/generate: 間違えた問題から復習カードを自動生成。各エンドポイントでsystemPromptを組み立て、Claude APIに送信し、JSONで結果を返す。',
    tech: ['Express', 'Anthropic SDK', 'REST API', 'Node.js'],
    lines: '約190行',
    code: `import express from 'express'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// === ロールプレイ会話 ===
app.post('/api/roleplay/chat', async (req, res) => {
  const { messages, setup } = req.body
  const { template, partner, goal } = setup

  // シナリオに応じてsystemPromptを動的に構築
  const systemPrompt = \`あなたは「\${partner.name}」というロールプレイキャラクターです。
  役職: \${partner.role}
  性格: \${partner.personality}
  関心事: \${partner.interests}
  ルール: 1回の発言は2〜4文に抑える。日本語で応答する\`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: systemPrompt,
    messages,  // ユーザーとAIの会話履歴をそのまま渡す
  })
  res.json({ role: 'assistant', content: response.content[0].text })
})

// === 採点 ===
app.post('/api/roleplay/score', async (req, res) => {
  const { messages, setup, historySummary } = req.body
  // 5カテゴリ（コミュニケーション、論理性、交渉力、具体性、目標達成）で各10点満点
  // 過去の履歴がある場合は成長傾向にも言及
  const result = JSON.parse(response)  // { scores: [...], overall: "..." }
  res.json(result)
})

// === フラッシュカードAI生成 ===
app.post('/api/flashcards/generate', async (req, res) => {
  const { wrongAnswers, category } = req.body
  // 間違えた問題の周辺知識や関連概念もカバーして5〜8枚生成
  res.json({ cards: [{ front: "質問", back: "解答+解説" }, ...] })
})

app.listen(3001)  // ポート3001で起動`,
  },
  {
    path: 'src/stats.ts',
    role: 'データ永続化・XP・レベル計算',
    desc: 'localStorageに学習データ（完了レッスン、学習日、学習時間）を保存・読み出し。XPシステムとレベル計算も担当。レッスン完了で100XP、学習時間1分ごとに2XPが加算される。連続学習日数（ストリーク）の計算ロジックもここ。',
    tech: ['localStorage', 'JSON', 'TypeScript型定義'],
    lines: '約140行',
    code: `const STORAGE_KEY = 'logic-stats'

type Stats = {
  completedLessons: string[]  // "lesson-20", "lesson-21" など
  studyDates: string[]        // ["2026-04-01", "2026-04-02", ...]
  studyTimeMs: number         // 累計ミリ秒
}

// localStorage から読み出し（なければ初期値）
function load(): Stats {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  return { completedLessons: [], studyDates: [], studyTimeMs: 0 }
}

// レッスン完了時にキーを保存 + 今日の日付を記録
export function recordCompletion(lessonKey: string) {
  const stats = load()
  if (!stats.completedLessons.includes(lessonKey)) {
    stats.completedLessons.push(lessonKey)
  }
  const d = today()
  if (!stats.studyDates.includes(d)) stats.studyDates.push(d)
  save(stats)
}

// 連続学習日数の計算（昨日or今日から遡って連続する日数）
export function getStreak(): number {
  const dates = load().studyDates.sort()
  const last = dates[dates.length - 1]
  if (last !== todayStr && last !== yesterdayStr) return 0
  let streak = 1
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()
    if (diff === 86400000) streak++      // ちょうど1日差
    else if (diff > 86400000) break      // 1日以上空いた
  }
  return streak
}

// XPシステム: レッスン種別ごとにXP量が異なる
const XP_MAP = { lesson: 100, roleplay: 150 }
// + 学習時間1分 = 2XP

// レベル計算
const LEVELS = [
  { xp: 0,    title: '初心者' },
  { xp: 200,  title: '学習者' },
  { xp: 500,  title: '実践者' },
  { xp: 1000, title: '挑戦者' },
  { xp: 2000, title: '達人' },
  { xp: 5000, title: 'マスター' },
]`,
  },
  {
    path: 'src/RolePlaySystem.tsx',
    role: 'AIロールプレイ画面',
    desc: '4つの画面（シナリオ選択→セットアップ→チャット→採点）を持つ複合コンポーネント。ユーザーがシナリオを選び、相手役の設定をカスタマイズし、AIとリアルタイムで会話し、終了後にAIが5項目で採点する。過去の履歴を踏まえた成長フィードバックも提供。',
    tech: ['fetch API', 'useState', 'useRef', '画面遷移パターン'],
    lines: '約500行',
    code: `type Message = { role: 'user' | 'assistant'; content: string }

// 4画面を1つのstateで管理（TypeScriptのユニオン型）
type Screen =
  | { type: 'select' }                                    // シナリオ選択
  | { type: 'setup'; template: ScenarioTemplate }          // 相手役設定
  | { type: 'chat'; setup: ScenarioSetup }                 // 会話中
  | { type: 'score'; setup: ScenarioSetup; messages: Message[] }  // 採点

export default function RolePlaySystem({ onBack }) {
  const [screen, setScreen] = useState<Screen>({ type: 'select' })

  // 画面に応じてコンポーネントを切り替え
  if (screen.type === 'select') return <ScenarioSelect onSelect={...} />
  if (screen.type === 'setup')  return <SetupScreen template={...} onStart={...} />
  if (screen.type === 'chat')   return <ChatScreen setup={...} onFinish={...} />
  if (screen.type === 'score')  return <ScoreScreen setup={...} messages={...} />
}

// チャット画面: サーバーにメッセージを送りAI応答を受け取る
function ChatScreen({ setup, onFinish }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text: string) => {
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const res = await fetch(\`\${API_BASE}/api/roleplay/chat\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMsg],  // 会話履歴を全部送る
        setup,                              // シナリオ設定も一緒に
      }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, data])   // AIの応答を追加
    setLoading(false)
  }
}`,
  },
  {
    path: 'src/flashcardData.ts',
    role: 'フラッシュカード・間隔反復',
    desc: 'SM-2アルゴリズムに基づく間隔反復学習システム。カードごとにinterval（復習間隔）とease（容易さ係数）を管理。「もう一度」で間隔リセット＋ease低下、「わかった」で間隔×ease倍、「簡単」でease上昇＋間隔1.3倍ボーナス。',
    tech: ['SM-2アルゴリズム', 'localStorage', 'TypeScript型'],
    lines: '約80行',
    code: `export type Flashcard = {
  id: string
  front: string              // 問題面
  back: string               // 解答面
  category: string           // "ロジカルシンキング", "MECE" など
  source: string             // 生成元 "lesson-20", "ai-weak"
  interval: number           // 次の復習までの日数
  ease: number               // 容易さ係数（初期値 2.5）
  nextReview: string          // 次回復習日 "YYYY-MM-DD"
  correctCount: number
  wrongCount: number
}

// SM-2 ベースの復習アルゴリズム
export function reviewCard(id: string, quality: 'again' | 'good' | 'easy') {
  const card = cards.find(c => c.id === id)

  if (quality === 'again') {
    // 不正解: 間隔を0にリセット、easeを0.3下げる（最低1.3）
    card.wrongCount++
    card.interval = 0
    card.ease = Math.max(1.3, card.ease - 0.3)
    card.nextReview = todayStr  // 今日また出る

  } else if (quality === 'good') {
    // 正解: 間隔 = 前回 × ease（初回は1日）
    card.correctCount++
    card.interval = card.interval === 0 ? 1 : Math.round(card.interval * card.ease)
    // 例: 1日 → 3日 → 7日 → 18日 ... と間隔が伸びていく

  } else { // 'easy'
    // 簡単: easeを0.15上げ + 間隔に1.3倍ボーナス（初回は3日）
    card.correctCount++
    card.ease = Math.min(3.0, card.ease + 0.15)
    card.interval = card.interval === 0 ? 3 : Math.round(card.interval * card.ease * 1.3)
  }

  // 次回復習日を計算して保存
  const next = new Date(); next.setDate(next.getDate() + card.interval)
  card.nextReview = next.toISOString().slice(0, 10)
  saveCards(cards)
}`,
  },
  {
    path: 'src/Profile.tsx',
    role: 'プロフィール・設定画面',
    desc: '今あなたが見ているこの画面。stats.tsから学習データを読み出し、学習カレンダー（直近12週）、統計グリッド、ロールプレイ履歴を表示。右上の歯車から設定パネルを開ける。この開発者モード自体もReactコンポーネント。',
    tech: ['useMemo', 'useState', 'CSS Grid', 'CSS Animation'],
    lines: '約500行',
    code: `export default function Profile() {
  // stats.ts の関数で学習データを取得
  const completedLessons = getCompletedLessons()  // ["lesson-20", "lesson-21", ...]
  const streak = getStreak()                       // 連続学習日数
  const studyHours = getStudyHours()               // "2.5h" or "30分"
  const studyDates = getStudyDates()               // カレンダー用の日付配列
  const { level, title, xp, progress } = getLevelInfo(rpHistory.length)

  const [showSettings, setShowSettings] = useState(false)
  const [devMode, setDevMode] = useState(false)

  return (
    <div className="profile">
      {/* 右上の歯車アイコン → 設定パネル */}
      {showSettings && <SettingsPanel />}

      {/* ヘッダー: アバター + レベル + XPバー */}
      <div className="pf-hero">
        <DragonMascot size={72} />
        <h2>K</h2>
        <span>Lv.{level} {title}</span>
        <div className="pf-xp-bar">
          <div style={{ width: \`\${progress}%\` }} />  {/* XP進捗バー */}
        </div>
      </div>

      {/* 統計グリッド（連続日数・完了数・学習時間・学習日数） */}
      <div className="pf-stats-grid">...</div>

      {/* 学習カレンダー（直近12週をGitHub風に表示） */}
      <StudyCalendar dates={studyDates} />

      {/* 開発者モードONの時だけ表示 → 今ここ！ */}
      {devMode && <DevPanel />}
    </div>
  )
}

// 学習カレンダー: useMemoで12週分の日付グリッドを生成
function StudyCalendar({ dates }) {
  const dateSet = useMemo(() => new Set(dates), [dates])
  const weeks = useMemo(() => {
    // 83日前（日曜起点）から今日まで、7日ずつの配列を生成
    // 各日付がdateSetに含まれていれば active=true
  }, [dateSet])
  return <div className="pf-cal-grid">...</div>  // CSS Grid で表示
}`,
  },
]

function DevPanel() {
  const [openFile, setOpenFile] = useState<string | null>(null)

  return (
    <div className="pf-section">
      <div className="pf-dev-panel">
        <div className="pf-dev-header">
          <span className="pf-dev-header-icon">{'</>'}</span>
          <h4 className="pf-dev-title">ソースコード</h4>
        </div>
        <p className="pf-dev-subtitle">このアプリを構成するファイルと実際のコード</p>

        {/* 技術スタック */}
        <div className="pf-dev-stack">
          {TECH_STACK.map((group) => (
            <div key={group.category} className="pf-dev-stack-group">
              <h5 className="pf-dev-stack-cat">{group.category}</h5>
              {group.items.map((item) => (
                <div key={item.name} className="pf-dev-stack-item">
                  <span className="pf-dev-stack-name">{item.name}</span>
                  <span className="pf-dev-stack-desc">{item.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ファイル一覧 */}
        <h5 className="pf-dev-files-title">ファイル構成</h5>
        <div className="pf-dev-files">
          {SOURCE_FILES.map((file) => (
            <div key={file.path} className="pf-dev-file">
              <div
                className={`pf-dev-file-header ${openFile === file.path ? 'open' : ''}`}
                onClick={() => setOpenFile(openFile === file.path ? null : file.path)}
              >
                <div className="pf-dev-file-info">
                  <span className="pf-dev-file-path">{file.path}</span>
                  <span className="pf-dev-file-role">{file.role} ({file.lines})</span>
                </div>
                <svg className="pf-dev-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>

              {openFile === file.path && (
                <div className="pf-dev-file-body">
                  <p className="pf-dev-file-desc">{file.desc}</p>
                  <div className="pf-dev-tech-tags">
                    {file.tech.map((t) => (
                      <span key={t} className="pf-dev-tech-tag">{t}</span>
                    ))}
                  </div>
                  <pre className="pf-dev-code"><code>{file.code}</code></pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatLessonKey(key: string): string {
  const map: Record<string, string> = {
    'lesson-20': 'MECE — 漏れなくダブりなく',
    'lesson-21': 'ロジックツリー',
    'lesson-22': 'So What / Why So',
    'lesson-23': 'ピラミッド原則',
    'lesson-24': 'ケーススタディ総合演習',
    'lesson-25': '演繹法',
    'lesson-26': '帰納法',
    'lesson-27': '形式論理',
    'lesson-28': 'ケース面接入門',
    'lesson-29': 'プロフィタビリティケース',
    'lesson-35': '市場参入ケース',
    'lesson-36': 'M&Aケース',
    'lesson-40': 'クリティカルシンキング入門',
    'lesson-41': '論理的誤謬を見破る',
    'lesson-42': 'データを正しく読む',
    'lesson-43': '問いを立てる力',
  }
  return map[key] || key
}
