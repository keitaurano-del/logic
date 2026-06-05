import { useEffect, useState } from 'react'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'
import {
  loadUserProfile,
  saveUserProfile,
  isValidBirthYear,
  MIN_BIRTH_YEAR,
  getCurrentYear,
  GENDER_LABELS,
  OCCUPATION_LABELS,
  type Gender,
  type Occupation,
} from '../userProfile'
import { getDisplayName, setDisplayName } from '../stats'
import { updateDisplayName, logout, updateUserEmail } from '../supabase'
import { confirm as confirmDialog } from '../platform/dialog'
import { CheckIcon } from '../icons'

interface Props {
  onBack: () => void
  // FB-31: プロフィール編集とアカウントを統合。アカウント操作（メール変更・
  // ログイン/ログアウト）に必要な情報・コールバックを受け取る。
  currentUser: { email: string } | null
  onLogout: () => void
}

const GENDER_ORDER: Gender[] = ['male', 'female', 'other', 'na']
const OCCUPATION_ORDER: Occupation[] = [
  'executive',
  'consultant',
  'strategy',
  'sales_marketing',
  'engineering',
  'admin',
  'professional',
  'student',
  'other',
]

/**
 * ProfileEditScreen — オンボーディングで聞いた属性をあとから編集できる画面。
 *
 * 編集対象:
 *  - ニックネーム (auth.user_metadata.full_name + localStorage + profiles.nickname)
 *  - 生まれ年 (localStorage + profiles.birth_year)
 *  - 性別 (localStorage のみ。profiles に列を作らないので将来 migration 必要)
 *  - 職業 (localStorage + profiles.occupation)
 *  - 目標 (localStorage + profiles.goal)
 *
 * FB-31: アカウント (メールアドレス変更・ログイン/ログアウト) も同一画面の
 * 「アカウント」セクションに統合した。言語は「環境設定」(PreferencesScreen) へ移動。
 *
 * 文言は中立的な丁寧体で書く (feedback-app-copy-neutral 準拠)。
 */
export function ProfileEditScreen({ onBack, currentUser, onLogout }: Props) {
  const currentYear = getCurrentYear()
  const profile = loadUserProfile()

  const [nickname, setNickname] = useState<string>(getDisplayName() || '')
  const [birthYearStr, setBirthYearStr] = useState<string>(
    profile.birthYear ? String(profile.birthYear) : '',
  )
  const [gender, setGender] = useState<Gender | ''>(profile.gender ?? '')
  const [occupation, setOccupation] = useState<Occupation | ''>(profile.occupation ?? '')
  const [goal, setGoal] = useState<string>(profile.goal ?? '')

  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState('')

  // FB-31: アカウント — メールアドレス変更
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailInput, setEmailInput] = useState(currentUser?.email ?? '')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)

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

  const handleSaveEmail = async () => {
    const next = emailInput.trim()
    if (!next) { setEmailError(t('auth.errEmailRequired')); return }
    if (currentUser?.email && next.toLowerCase() === currentUser.email.toLowerCase()) {
      setEmailError(t('accountSettings.emailSameError'))
      return
    }
    setEmailSaving(true)
    setEmailError('')
    const result = await updateUserEmail(next)
    setEmailSaving(false)
    if (result.error) {
      if (result.error === 'auth/invalid-email') setEmailError(t('auth.invalidEmail'))
      else if (result.error === 'auth/rate-limited') setEmailError(t('auth.errRateLimited'))
      else if (result.error === 'auth/email-in-use') setEmailError(t('accountSettings.emailInUseError'))
      else if (result.error === 'auth/not-configured') setEmailError(t('auth.errNotConfigured'))
      else setEmailError(t('auth.errSendLinkFailed'))
      return
    }
    setEmailSentTo(next)
    setEditingEmail(false)
  }

  useEffect(() => {
    if (!savedFlash) return
    const id = setTimeout(() => setSavedFlash(false), 2000)
    return () => clearTimeout(id)
  }, [savedFlash])

  const handleSave = async () => {
    setError('')
    // 生まれ年バリデーション (空欄は許容)
    const trimmedYear = birthYearStr.trim()
    let parsedYear: number | undefined = undefined
    if (trimmedYear !== '') {
      const n = Number(trimmedYear)
      if (!isValidBirthYear(n)) {
        setError(t('profileEdit.birthYearError', { min: MIN_BIRTH_YEAR, max: currentYear }))
        return
      }
      parsedYear = n
    }

    setSaving(true)
    try {
      // ニックネーム: 空欄なら更新しない (誤って空に保存させない)
      const trimmedNick = nickname.trim()
      if (trimmedNick && trimmedNick !== getDisplayName()) {
        setDisplayName(trimmedNick)
        await updateDisplayName(trimmedNick)
      }

      saveUserProfile({
        displayName: trimmedNick || undefined,
        birthYear: parsedYear,
        gender: gender || undefined,
        occupation: occupation || undefined,
        goal: goal.trim() || undefined,
      })

      setSavedFlash(true)
    } catch {
      setError(t('profileEdit.errSave'))
    } finally {
      setSaving(false)
    }
  }

  const SECTION: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-v3-card-inset)',
  }
  const FIELD: React.CSSProperties = {
    padding: '14px 18px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }
  const LABEL: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  }
  const INPUT: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    background: 'var(--bg-input, rgba(0,0,0,0.04))',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontFamily: "'Noto Sans JP', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }
  const SELECT_LIKE: React.CSSProperties = {
    ...INPUT,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('profileEdit.title')} onBack={onBack} />

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* セクション: 基本情報 */}
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '8px 4px 0' }}>
          {t('profileEdit.sectionAttrs')}
        </div>
        <div style={SECTION}>
          {/* ニックネーム */}
          <div style={FIELD}>
            <label style={LABEL} htmlFor="pe-nickname">{t('profileEdit.nickname')}</label>
            <input
              id="pe-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('profileEdit.nicknamePlaceholder')}
              style={INPUT}
              autoComplete="nickname"
            />
          </div>

          {/* 生まれ年 */}
          <div style={FIELD}>
            <label style={LABEL} htmlFor="pe-birth-year">{t('profileEdit.birthYear')}</label>
            <input
              id="pe-birth-year"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={birthYearStr}
              onChange={(e) => { setBirthYearStr(e.target.value); if (error) setError('') }}
              placeholder={t('profileEdit.birthYearPlaceholder')}
              min={MIN_BIRTH_YEAR}
              max={currentYear}
              style={INPUT}
            />
            <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {t('profileEdit.birthYearHint', { min: MIN_BIRTH_YEAR, max: currentYear })}
            </div>
          </div>

          {/* 性別 */}
          <div style={FIELD}>
            <label style={LABEL} htmlFor="pe-gender">{t('profileEdit.gender')}</label>
            <select
              id="pe-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | '')}
              style={SELECT_LIKE}
            >
              <option value="">{t('profileEdit.unset')}</option>
              {GENDER_ORDER.map(g => (
                <option key={g} value={g}>{GENDER_LABELS[g]}</option>
              ))}
            </select>
          </div>

          {/* 職業 */}
          <div style={FIELD}>
            <label style={LABEL} htmlFor="pe-occupation">{t('profileEdit.occupation')}</label>
            <select
              id="pe-occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value as Occupation | '')}
              style={SELECT_LIKE}
            >
              <option value="">{t('profileEdit.unset')}</option>
              {OCCUPATION_ORDER.map(o => (
                <option key={o} value={o}>{OCCUPATION_LABELS[o]}</option>
              ))}
            </select>
          </div>

          {/* 目標 */}
          <div style={{ ...FIELD, borderBottom: 'none' }}>
            <label style={LABEL} htmlFor="pe-goal">{t('profileEdit.goal')}</label>
            <textarea
              id="pe-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t('profileEdit.goalPlaceholder')}
              rows={3}
              style={{ ...INPUT, resize: 'vertical', minHeight: 80 }}
            />
            <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {t('profileEdit.goalHint')}
            </div>
          </div>
        </div>

        {/* エラー / 保存完了 */}
        {error && (
          <div role="alert" style={{ fontSize: '0.8667rem', color: 'var(--md-sys-color-error)', padding: '0 4px', lineHeight: 1.6 }}>
            {error}
          </div>
        )}
        {savedFlash && (
          <div role="status" aria-live="polite" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.8667rem', color: 'var(--brand)', fontWeight: 700, padding: '0 4px',
          }}>
            <CheckIcon width={14} height={14} />
            <span>{t('profileEdit.saved')}</span>
          </div>
        )}

        {/* 保存ボタン */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: saving ? 'var(--bg-elevated)' : 'var(--brand)',
            color: saving ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 12,
            fontSize: '1rem', fontWeight: 700,
            cursor: saving ? 'default' : 'pointer',
            minHeight: 48,
            boxShadow: saving ? 'none' : '0 4px 12px rgba(61,95,196,0.18)',
          }}
        >
          {saving ? t('profileEdit.saving') : t('profileEdit.save')}
        </button>

        {/* FB-31: アカウントセクション（メールアドレス変更・ログイン/ログアウト） */}
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '8px 4px 0' }}>
          {t('profileEdit.sectionAccount')}
        </div>
        <div style={SECTION}>
          {/* メールアドレス（ログイン済みのみ） */}
          {currentUser && (
            <div style={{ ...FIELD, borderBottom: '1px solid var(--border)' }}>
              <span style={LABEL}>{t('accountSettings.email')}</span>
              {editingEmail ? (
                <div>
                  <input
                    type="email"
                    aria-label={t('accountSettings.email')}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEmail() }}
                    autoFocus
                    autoComplete="email"
                    style={{ ...INPUT, marginBottom: 8 }}
                  />
                  {emailError && <div role="alert" style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-error)', marginBottom: 8 }}>{emailError}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => { setEditingEmail(false); setEmailError(''); setEmailInput(currentUser.email ?? '') }}
                      style={{ flex: 1, padding: '10px', minHeight: 44, background: 'var(--bg-elevated)', border: 'none', borderRadius: 10, color: 'var(--text-secondary)', fontSize: '0.9333rem', cursor: 'pointer' }}
                    >{t('accountSettings.cancel')}</button>
                    <button
                      type="button"
                      onClick={handleSaveEmail}
                      disabled={emailSaving || !emailInput.trim()}
                      style={{ flex: 1, padding: '10px', minHeight: 44, background: emailInput.trim() ? 'var(--brand)' : 'var(--bg-elevated)', border: 'none', borderRadius: 10, color: emailInput.trim() ? '#fff' : 'var(--text-muted)', fontSize: '0.9333rem', fontWeight: 700, cursor: 'pointer' }}
                    >{emailSaving ? t('accountSettings.saving') : t('accountSettings.sendLinkBtn')}</button>
                  </div>
                  <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                    {t('accountSettings.emailChangeHint')}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{currentUser.email}</div>
                  <button type="button" onClick={() => { setEditingEmail(true); setEmailInput(currentUser.email ?? ''); setEmailError(''); setEmailSentTo(null) }} style={{ fontSize: '0.8667rem', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'transparent', border: 'none', minHeight: 32, flexShrink: 0 }}>{t('accountSettings.change')}</button>
                </div>
              )}
              {emailSentTo && !editingEmail && (
                <div role="status" aria-live="polite" style={{
                  fontSize: '0.8rem', color: 'var(--text-primary)',
                  background: 'var(--brand-soft)', borderRadius: 8,
                  padding: '8px 10px', marginTop: 10, lineHeight: 1.6,
                }}>
                  {t('accountSettings.emailVerifySent', { email: emailSentTo })}
                </div>
              )}
            </div>
          )}

          {/* ログアウト（ログイン済みのみ表示） */}
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              style={{ padding: '16px 18px', cursor: 'pointer', color: 'var(--md-sys-color-error)', fontSize: '1rem', fontWeight: 700, textAlign: 'center', background: 'transparent', border: 'none', width: '100%', font: 'inherit', minHeight: 44 }}
            >{t('accountSettings.logout')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
