import { useEffect, useState } from 'react'
import { Header } from '../components/platform/Header'
import { t, getLocale, setLocale } from '../i18n'
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
import { updateDisplayName } from '../supabase'
import { CheckIcon } from '../icons'

interface Props {
  onBack: () => void
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
 *  - 言語 (localStorage + UI 即時反映)
 *
 * 文言は中立的な丁寧体で書く (feedback-app-copy-neutral 準拠)。
 */
export function ProfileEditScreen({ onBack }: Props) {
  const currentYear = getCurrentYear()
  const profile = loadUserProfile()

  const [nickname, setNickname] = useState<string>(getDisplayName() || '')
  const [birthYearStr, setBirthYearStr] = useState<string>(
    profile.birthYear ? String(profile.birthYear) : '',
  )
  const [gender, setGender] = useState<Gender | ''>(profile.gender ?? '')
  const [occupation, setOccupation] = useState<Occupation | ''>(profile.occupation ?? '')
  const [goal, setGoal] = useState<string>(profile.goal ?? '')
  const [language, setLanguage] = useState<'ja' | 'en'>(getLocale())

  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState('')

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

      if (language !== getLocale()) {
        setLocale(language)
      }
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
          <div style={{ ...FIELD, borderBottom: '1px solid var(--border)' }}>
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

          {/* 言語 */}
          <div style={{ ...FIELD, borderBottom: 'none' }}>
            <label style={LABEL} htmlFor="pe-language">{t('profileEdit.language')}</label>
            <select
              id="pe-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ja' | 'en')}
              style={SELECT_LIKE}
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
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
      </div>
    </div>
  )
}
