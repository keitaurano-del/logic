import { useState } from 'react'
import { logout } from '../supabase'
import { getDisplayName, setDisplayName } from '../stats'
import { updateDisplayName } from '../supabase'
import { v3 } from '../styles/tokensV3'
import { CheckIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { confirm as confirmDialog } from '../platform/dialog'

interface Props {
  onBack: () => void
  currentUser: { email: string } | null
  onOpenLogin: (tab?: 'google' | 'email') => void
  onLogout: () => void
}

const NAME_CHANGE_KEY = 'logic-name-last-changed'

function canChangeName(): boolean {
  const last = localStorage.getItem(NAME_CHANGE_KEY)
  if (!last) return true
  const lastDate = new Date(last).toDateString()
  const today = new Date().toDateString()
  return lastDate !== today
}

function recordNameChange() {
  localStorage.setItem(NAME_CHANGE_KEY, new Date().toISOString())
}

export function AccountSettingsScreen({ onBack, currentUser, onOpenLogin, onLogout }: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(getDisplayName())
  const [nameSaving, setNameSaving] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: 'ログアウト',
      message: 'ログアウトしますか？',
      okText: 'ログアウト',
      cancelText: 'キャンセル',
    })
    if (ok) {
      await logout()
      onLogout()
    }
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    if (!canChangeName()) {
      setNameError('表示名の変更は1日1回までだよ')
      return
    }
    setNameSaving(true)
    setNameError('')
    try {
      setDisplayName(nameInput.trim())
      await updateDisplayName(nameInput.trim())
      recordNameChange()
      setNameSuccess(true)
      setEditingName(false)
      setTimeout(() => setNameSuccess(false), 2000)
    } catch {
      setNameError('保存に失敗したよ。もう一度試してね')
    } finally {
      setNameSaving(false)
    }
  }

  const todayChanged = !canChangeName()

  return (
    <div style={{ minHeight: '100dvh', background: v3.color.bg, color: v3.color.text, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title="アカウント" onBack={onBack} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 表示名 */}
        {currentUser && (
          <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${v3.color.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text3, letterSpacing: '.06em', marginBottom: 6 }}>表示名</div>
              {editingName ? (
                <div>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                    autoFocus
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.07)', border: `1px solid ${v3.color.accent}`,
                      color: v3.color.text, fontSize: 15, fontFamily: "'Noto Sans JP', sans-serif",
                      outline: 'none', boxSizing: 'border-box', marginBottom: 8,
                    }}
                  />
                  {nameError && <div style={{ fontSize: 12, color: 'var(--md-sys-color-error)', marginBottom: 8 }}>{nameError}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setEditingName(false); setNameError(''); setNameInput(getDisplayName()) }}
                      style={{ flex: 1, padding: '10px', background: v3.color.card2, border: 'none', borderRadius: 10, color: v3.color.text2, fontSize: 14, cursor: 'pointer' }}
                    >キャンセル</button>
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving || !nameInput.trim()}
                      style={{ flex: 1, padding: '10px', background: nameInput.trim() ? v3.color.accent : v3.color.card2, border: 'none', borderRadius: 10, color: nameInput.trim() ? '#fff' : v3.color.text3, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    >{nameSaving ? '保存中…' : '保存する'}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: v3.color.text }}>{getDisplayName()}</div>
                  {nameSuccess ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: v3.color.accent, fontWeight: 700 }}>
                      <CheckIcon width={14} height={14} />
                      <span>保存したよ</span>
                    </div>
                  ) : todayChanged ? (
                    <div style={{ fontSize: 12, color: v3.color.text3 }}>今日は変更済み</div>
                  ) : (
                    <button type="button" onClick={() => setEditingName(true)} style={{ fontSize: 13, color: v3.color.accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'transparent', border: 'none', minHeight: 32 }}>変更</button>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text3, letterSpacing: '.06em', marginBottom: 4 }}>メールアドレス</div>
              <div style={{ fontSize: 14, color: v3.color.text2 }}>{currentUser.email}</div>
            </div>
          </div>
        )}

        {/* ログイン/ログアウト */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden' }}>
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{ padding: '16px 18px', cursor: 'pointer', color: 'var(--md-sys-color-error)', fontSize: 15, fontWeight: 700, textAlign: 'center', background: 'transparent', border: 'none', width: '100%', font: 'inherit', minHeight: 44 }}
            >ログアウト</button>
          ) : (
            <>
              <button type="button" onClick={() => onOpenLogin('google')} style={{ padding: '16px 18px', borderBottom: `1px solid ${v3.color.line}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Googleでログイン</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button type="button" onClick={() => onOpenLogin('email')} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>メールアドレスでログイン</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
        </div>

        <div style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8 }}>
          表示名の変更は1日1回まで
        </div>
      </div>
    </div>
  )
}
