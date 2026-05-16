import { useState } from 'react'
import { logout } from '../supabase'
import { getDisplayName, setDisplayName } from '../stats'
import { updateDisplayName } from '../supabase'
import { CheckIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { confirm as confirmDialog } from '../platform/dialog'
import { t } from '../i18n'

interface Props {
  onBack: () => void
  currentUser: { email: string } | null
  onOpenLogin: () => void
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
      title: t('accountSettings.logoutTitle'),
      message: t('accountSettings.logoutMessage'),
      okText: t('accountSettings.logoutOk'),
      cancelText: t('accountSettings.cancel'),
    })
    if (ok) {
      await logout()
      onLogout()
    }
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    if (!canChangeName()) {
      setNameError(t('accountSettings.errLimit'))
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
      setNameError(t('accountSettings.errSave'))
    } finally {
      setNameSaving(false)
    }
  }

  const todayChanged = !canChangeName()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('accountSettings.title')} onBack={onBack} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 表示名 */}
        {currentUser && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${'var(--border)'}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', marginBottom: 6 }}>{t('accountSettings.displayName')}</div>
              {editingName ? (
                <div>
                  <input
                    type="text"
                    aria-label={t('accountSettings.displayNameAria')}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                    autoFocus
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.07)', border: `1px solid ${'var(--brand)'}`,
                      color: 'var(--text-primary)', fontSize: 15, fontFamily: "'Noto Sans JP', sans-serif",
                      outline: 'none', boxSizing: 'border-box', marginBottom: 8,
                    }}
                  />
                  {nameError && <div style={{ fontSize: 12, color: 'var(--md-sys-color-error)', marginBottom: 8 }}>{nameError}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setEditingName(false); setNameError(''); setNameInput(getDisplayName()) }}
                      style={{ flex: 1, padding: '10px', background: 'var(--bg-elevated)', border: 'none', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}
                    >{t('accountSettings.cancel')}</button>
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving || !nameInput.trim()}
                      style={{ flex: 1, padding: '10px', background: nameInput.trim() ? 'var(--brand)' : 'var(--bg-elevated)', border: 'none', borderRadius: 10, color: nameInput.trim() ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    >{nameSaving ? t('accountSettings.saving') : t('accountSettings.save')}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{getDisplayName()}</div>
                  {nameSuccess ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--brand)', fontWeight: 700 }}>
                      <CheckIcon width={14} height={14} />
                      <span>{t('accountSettings.saved')}</span>
                    </div>
                  ) : todayChanged ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('accountSettings.changedToday')}</div>
                  ) : (
                    <button type="button" onClick={() => setEditingName(true)} style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'transparent', border: 'none', minHeight: 32 }}>{t('accountSettings.change')}</button>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', marginBottom: 4 }}>{t('accountSettings.email')}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{currentUser.email}</div>
            </div>
          </div>
        )}

        {/* ログイン/ログアウト */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{ padding: '16px 18px', cursor: 'pointer', color: 'var(--md-sys-color-error)', fontSize: 15, fontWeight: 700, textAlign: 'center', background: 'transparent', border: 'none', width: '100%', font: 'inherit', minHeight: 44 }}
            >{t('accountSettings.logout')}</button>
          ) : (
            <button type="button" onClick={() => onOpenLogin()} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{t('accountSettings.emailLogin')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.8 }}>
          {t('accountSettings.changeOncePerDay')}
        </div>
      </div>
    </div>
  )
}
